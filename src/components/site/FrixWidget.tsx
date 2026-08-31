import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageSquare, Phone, Send, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LogoMark } from "@/components/site/Logo";
import { FRIX, FRIX_AGENT_LABELS } from "@/lib/frix";
import { useAuth } from "@/hooks/useAuth";

type Msg = { role: "user" | "assistant"; content: string; agent?: string | null };

const STORAGE_KEY = "frix.conversation";
const VISITOR_KEY = "frix.visitor";

function visitorId() {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function FrixWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: FRIX.intro, agent: "business" },
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [showCallback, setShowCallback] = useState(false);
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
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setConversationId(stored);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      setOpen(true);
      const prefill = (event as CustomEvent<{ prefill?: string }>).detail?.prefill;
      if (prefill) setInput(prefill);
      setTimeout(() => inputRef.current?.focus(), 120);
    };
    window.addEventListener("frix:open", handler);
    return () => window.removeEventListener("frix:open", handler);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

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
        window.localStorage.setItem(STORAGE_KEY, data["conversationId"]);
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
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);
    try {
      const data = await post({ message: text, action: "chat" });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: String(data["reply"] ?? ""), agent: (data["agent"] as string) ?? null },
      ]);
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
      setMessages((m) => [...m, { role: "assistant", content: String(data["reply"] ?? ""), agent: "business" }]);
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
      setMessages((m) => [...m, { role: "assistant", content: String(data["reply"] ?? ""), agent: "business" }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
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
          <span className="relative grid h-14 w-14 place-items-center rounded-full border border-primary/40 bg-background shadow-[0_18px_40px_-16px_var(--primary)] transition-transform duration-200 hover:scale-105">
            <span className="pulse-ring absolute inset-0 rounded-full bg-primary/25" />
            <LogoMark className="relative h-8 w-8" />
          </span>
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-x-3 bottom-3 z-[95] flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[36rem] sm:w-[26rem]">
          <div className="flex items-center gap-3 border-b border-border/70 bg-surface/70 px-4 py-3">
            <LogoMark className="h-9 w-9" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-semibold">{FRIX.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{FRIX.title} · 24/7</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close FRIX AI" className="rounded-md p-1.5 hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

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
