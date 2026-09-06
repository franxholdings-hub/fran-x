import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  ChevronLeft,
  History,
  Loader2,
  MessageSquare,
  Phone,
  Plus,
  Send,
  UserCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LogoMark } from "@/components/site/Logo";
import { FRIX, FRIX_AGENT_LABELS } from "@/lib/frix";
import { useAuth } from "@/hooks/useAuth";

type Msg = { role: "user" | "assistant"; content: string; agent?: string | null };
type Conversation = { id: string; title: string; updatedAt: number; messages: Msg[] };

const CONVERSATION_KEY = "frix.conversation";
const VISITOR_KEY = "frix.visitor";
const HISTORY_KEY = "frix.history";

const freshMessages = (): Msg[] => [
  { role: "assistant", content: FRIX.intro, agent: "business" },
];

function visitorId() {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function loadHistory(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: Conversation[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 30)));
  } catch {
    /* ignore quota errors */
  }
}

function conversationTitle(messages: Msg[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New chat";
  const t = firstUser.content.replace(/\s+/g, " ").trim();
  return t.length > 42 ? `${t.slice(0, 42)}…` : t || "New chat";
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(ts).toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

export function FrixWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(freshMessages());
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [showCallback, setShowCallback] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [callback, setCallback] = useState({
    full_name: "",
    contact_method: "Phone call",
    contact_value: "",
    preferred_date: "",
    preferred_time: "",
    timezone: "WAT (UTC+1)",
    reason: "",
  });
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(loadHistory());
    const stored = window.localStorage.getItem(CONVERSATION_KEY);
    if (stored) setConversationId(stored);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      setOpen(true);
      const loaded = loadHistory();
      setHistory(loaded);
      // Show the history section first when there are previous chats.
      setShowHistory(loaded.length > 0);
      const prefill = (event as CustomEvent<{ prefill?: string }>).detail?.prefill;
      if (prefill) {
        setInput(prefill);
        setShowHistory(false);
      }
      setTimeout(() => inputRef.current?.focus(), 120);
    };
    window.addEventListener("frix:open", handler);
    return () => window.removeEventListener("frix:open", handler);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  /** Upsert the current conversation into the local history list. */
  const persist = useCallback((id: string, msgs: Msg[]) => {
    setHistory((prev) => {
      const without = prev.filter((c) => c.id !== id);
      const next = [{ id, title: conversationTitle(msgs), updatedAt: Date.now(), messages: msgs }, ...without];
      saveHistory(next);
      return next;
    });
  }, []);

  const post = useCallback(
    async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/public/frix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, visitorId: visitorId(), ...payload }),
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) throw new Error((data["error"] as string) ?? "FRIX AI is unavailable right now.");
      if (typeof data["conversationId"] === "string") {
        setConversationId(data["conversationId"]);
        window.localStorage.setItem(CONVERSATION_KEY, data["conversationId"]);
      }
      if (typeof data["reference"] === "string") setReference(data["reference"]);
      return data;
    },
    [conversationId],
  );

  const send = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setError(null);
    const withUser: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(withUser);
    setBusy(true);
    try {
      const data = await post({ message: text, action: "chat" });
      const id = (data["conversationId"] as string) ?? conversationId ?? "";
      const reply: Msg = { role: "assistant", content: String(data["reply"] ?? ""), agent: (data["agent"] as string) ?? null };
      const finalMsgs = [...withUser, reply];
      setMessages(finalMsgs);
      if (id) persist(id, finalMsgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  };

  const escalate = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const data = await post({ action: "escalate" });
      const reply: Msg = { role: "assistant", content: String(data["reply"] ?? ""), agent: "business" };
      const finalMsgs = [...messages, reply];
      setMessages(finalMsgs);
      const id = (data["conversationId"] as string) ?? conversationId ?? "";
      if (id) persist(id, finalMsgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const submitCallback = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await post({ action: "callback", callback });
      setShowCallback(false);
      const reply: Msg = { role: "assistant", content: String(data["reply"] ?? ""), agent: "business" };
      const finalMsgs = [...messages, reply];
      setMessages(finalMsgs);
      const id = (data["conversationId"] as string) ?? conversationId ?? "";
      if (id) persist(id, finalMsgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    window.localStorage.removeItem(CONVERSATION_KEY);
    setMessages(freshMessages());
    setError(null);
    setReference(null);
    setShowCallback(false);
    setShowHistory(false);
    setTimeout(() => inputRef.current?.focus(), 120);
  };

  const openConversation = (conv: Conversation) => {
    setConversationId(conv.id);
    window.localStorage.setItem(CONVERSATION_KEY, conv.id);
    setMessages(conv.messages);
    setError(null);
    setReference(null);
    setShowCallback(false);
    setShowHistory(false);
    setTimeout(() => inputRef.current?.focus(), 120);
  };

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Talk to FRAN-X — FRIX AI Business Concierge"
          className="group fixed right-4 bottom-40 z-[90] flex items-center gap-3 sm:right-6 lg:bottom-28"
        >
          <span className="pointer-events-none hidden rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
            Talk to FRAN-X
          </span>
          <span className="relative grid h-11 w-11 place-items-center rounded-full border border-primary/40 bg-background shadow-[0_18px_40px_-16px_var(--primary)] transition-transform duration-200 hover:scale-105 sm:h-14 sm:w-14">
            <span className="pulse-ring absolute inset-0 rounded-full bg-primary/25" />
            <LogoMark className="relative h-6 w-6 sm:h-8 sm:w-8" />
          </span>
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border/70 bg-surface/70 px-4 py-3">
            {showHistory ? (
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                aria-label="Back to chat"
                className="rounded-md p-1.5 hover:bg-muted"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                aria-label="Chat history"
                className="rounded-md p-1.5 hover:bg-muted"
              >
                <History className="h-5 w-5" />
              </button>
            )}
            <LogoMark className="h-9 w-9" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-semibold">{FRIX.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{FRIX.title} · 24/7</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close FRIX AI" className="rounded-md p-1.5 hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>

          {showHistory ? (
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <Button type="button" onClick={startNewChat} className="w-full">
                <Plus className="h-4 w-4" /> New chat
              </Button>

              <p className="mt-5 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Previous chats
              </p>
              {history.length === 0 ? (
                <p className="rounded-lg border border-border/60 bg-surface/40 px-4 py-6 text-center text-sm text-muted-foreground">
                  No previous chats yet. Start a new chat to begin.
                </p>
              ) : (
                <ul className="space-y-2">
                  {history.map((conv) => (
                    <li key={conv.id}>
                      <button
                        type="button"
                        onClick={() => openConversation(conv)}
                        className="flex w-full items-center gap-3 rounded-lg border border-border/60 bg-surface/40 px-3 py-3 text-left transition-colors hover:border-primary/40 hover:bg-surface"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary/30 text-primary">
                          <MessageSquare className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{conv.title}</span>
                          <span className="block text-[11px] text-muted-foreground">{relativeTime(conv.updatedAt)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <>
              <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div className={m.role === "user" ? "max-w-[85%] rounded-xl bg-primary px-3.5 py-2.5 text-sm text-primary-foreground" : "max-w-[92%] text-sm text-foreground"}>
                      {m.role === "assistant" ? (
                        <p className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          <Bot className="h-3 w-3" />
                          {FRIX_AGENT_LABELS[m.agent ?? "business"] ?? FRIX.name}
                        </p>
                      ) : null}
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                ))}
                {busy ? (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> FRIX AI is thinking…
                  </p>
                ) : null}
                {reference ? (
                  <p className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
                    Your inquiry reference: <span className="font-mono text-primary">{reference}</span>
                  </p>
                ) : null}
                {error ? <p className="text-xs text-destructive">{error}</p> : null}
              </div>

              {showCallback ? (
                <form onSubmit={submitCallback} className="space-y-2 border-t border-border/70 p-4">
                  <p className="text-xs font-semibold">Request a callback</p>
                  <Input placeholder="Full name" value={callback.full_name} onChange={(e) => setCallback({ ...callback, full_name: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Phone / email" value={callback.contact_value} onChange={(e) => setCallback({ ...callback, contact_value: e.target.value })} />
                    <Input placeholder="Method (call, WhatsApp…)" value={callback.contact_method} onChange={(e) => setCallback({ ...callback, contact_method: e.target.value })} />
                    <Input type="date" value={callback.preferred_date} onChange={(e) => setCallback({ ...callback, preferred_date: e.target.value })} />
                    <Input type="time" value={callback.preferred_time} onChange={(e) => setCallback({ ...callback, preferred_time: e.target.value })} />
                  </div>
                  <Input placeholder="Time zone" value={callback.timezone} onChange={(e) => setCallback({ ...callback, timezone: e.target.value })} />
                  <Textarea placeholder="Reason for the consultation" rows={2} value={callback.reason} onChange={(e) => setCallback({ ...callback, reason: e.target.value })} />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={busy}>Submit request</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowCallback(false)}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 border-t border-border/70 px-4 pt-3">
                    <Button type="button" size="sm" variant="outline" onClick={escalate} disabled={busy}>
                      <UserCheck className="h-3.5 w-3.5" /> Request human assistance
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowCallback(true)} disabled={busy}>
                      <Phone className="h-3.5 w-3.5" /> Callback
                    </Button>
                  </div>
                  <form onSubmit={send} className="flex items-center gap-2 p-4">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={user ? "Tell FRIX AI what you need…" : "Ask FRIX AI anything about FRAN-X…"}
                      aria-label="Message FRIX AI"
                    />
                    <Button type="submit" size="icon" disabled={busy} aria-label="Send">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      ) : null}
    </>
  );
}

export function TalkToFranxButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent("frix:open"))}
    >
      <MessageSquare /> Talk to FRAN-X
    </Button>
  );
}
