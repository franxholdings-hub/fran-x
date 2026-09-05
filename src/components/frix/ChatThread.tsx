// Chat area for the FRIX AI workspace — messages with markdown, timestamps,
// copy and regenerate actions, plus the smart composer (modes + tools).

import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Bot,
  ChevronDown,
  Copy,
  RefreshCw,
  Send,
  Sparkles,
  Square,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Markdown } from "./Markdown";
import type { FrixAccountInfo, WorkspaceMessage } from "./api";

export type FrixModeOption = "normal" | "pidgin" | "exam" | "lowdata";
export type FrixToolOption = "none" | "writing" | "business" | "data" | "productivity" | "summarize";

const MODE_OPTIONS: { value: FrixModeOption; label: string; hint: string }[] = [
  { value: "normal", label: "Normal", hint: "Standard FRIX AI behavior" },
  { value: "pidgin", label: "Pidgin Mode", hint: "Chat naturally in Nigerian Pidgin" },
  { value: "exam", label: "Exam Mode", hint: "Step-by-step educational help" },
  { value: "lowdata", label: "Low Data Mode", hint: "Short, plain, data-light replies" },
];

const TOOL_OPTIONS: { value: FrixToolOption; label: string; hint: string }[] = [
  { value: "none", label: "No tool", hint: "Plain conversation" },
  { value: "writing", label: "Writing", hint: "Draft, rewrite and edit text" },
  { value: "summarize", label: "Summarize", hint: "Condense text into key points" },
  { value: "business", label: "Business", hint: "Analysis, marketing and strategy" },
  { value: "data", label: "Data", hint: "Interpret numbers and charts" },
  { value: "productivity", label: "Productivity", hint: "Planning and brainstorming" },
];

const SUGGESTIONS = [
  "Help me outline a business plan for a startup",
  "Explain a concept I'm studying for an exam",
  "Rewrite this paragraph to sound more professional",
  "What FRAN-X services fit a small business?",
];

function formatTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  return sameDay ? time : `${d.toLocaleDateString("en-NG", { month: "short", day: "numeric" })} · ${time}`;
}

type Props = {
  messages: WorkspaceMessage[];
  busy: boolean;
  error: string | null;
  limitReached: boolean;
  account: FrixAccountInfo | null;
  activeTitle: string;
  mode: FrixModeOption;
  tool: FrixToolOption;
  input: string;
  onInputChange: (value: string) => void;
  onModeChange: (mode: FrixModeOption) => void;
  onToolChange: (tool: FrixToolOption) => void;
  onSend: (text: string) => void;
  onRegenerate: () => void;
  onStop: () => void;
  onRetry: () => void;
  onOpenSidebar: () => void;
};

export function ChatThread({
  messages,
  busy,
  error,
  limitReached,
  account,
  activeTitle,
  mode,
  tool,
  input,
  onInputChange,
  onModeChange,
  onToolChange,
  onSend,
  onRegenerate,
  onStop,
  onRetry,
  onOpenSidebar,
}: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, busy]);

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    onSend(text);
  };

  const copyLast = async () => {
    if (!lastAssistant) return;
    try {
      await navigator.clipboard.writeText(lastAssistant.content);
      toast.success("Response copied");
    } catch {
      toast.error("Couldn't copy the response");
    }
  };

  const activeMode = MODE_OPTIONS.find((m) => m.value === mode);
  const activeTool = TOOL_OPTIONS.find((t) => t.value === tool);

  return (
    <div className="flex h-full min-w-0 flex-col">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-2 border-b border-border/60 bg-background/85 px-3 py-2.5 backdrop-blur-md sm:px-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="Open history">
          <ChevronDown className="h-5 w-5 rotate-90" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold">{activeTitle}</p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            {busy ? "FRIX AI is thinking…" : "FRIX AI online"}
            {account && ` · ${account.planName}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {lastAssistant && (
            <Button variant="ghost" size="icon" onClick={copyLast} aria-label="Copy response">
              <Copy className="h-4 w-4" />
            </Button>
          )}
          {messages.length > 0 && !busy && (
            <Button variant="ghost" size="icon" onClick={onRegenerate} aria-label="Regenerate response">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4">
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center gap-4 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl border border-primary/30 bg-background shadow-sm">
              <Bot className="h-7 w-7 text-primary" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">Start your conversation with FRIX AI</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask anything, pick a mode or tool below, and FRIX gets to work.
              </p>
            </div>
            <div className="grid w-full gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onInputChange(s)}
                  className="rounded-xl border border-border bg-background/70 px-3.5 py-3 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Sparkles className="mb-1 h-3.5 w-3.5 text-primary" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[78%]",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background shadow-sm",
                  )}
                >
                  {m.role === "user" ? (
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.content}</p>
                  ) : (
                    <Markdown content={m.content} />
                  )}
                  <p
                    className={cn(
                      "mt-1.5 text-[10px]",
                      m.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 shadow-sm">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
                  </span>
                  <span className="text-xs text-muted-foreground">FRIX AI is thinking…</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Errors / limits */}
      <div className="mx-auto w-full max-w-3xl space-y-2 px-3 sm:px-4">
        {error && !limitReached && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
            <span className="min-w-0 break-words">{error}</span>
            <Button size="sm" variant="outline" onClick={onRetry} className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10">
              Retry
            </Button>
          </div>
        )}
        {limitReached && account && (
          <div className="flex flex-col gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold">You've reached your FRIX AI usage limit</p>
              <p className="text-xs text-muted-foreground">
                Upgrade to a higher plan for more conversations and advanced capabilities.
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link to="/pricing">
                <Zap className="h-3.5 w-3.5" /> View Plans
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border/60 bg-background/85 px-3 py-3 backdrop-blur-md sm:px-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-8 gap-1.5 px-2.5 text-xs", mode !== "normal" && "border-primary/50 text-primary")}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{activeMode?.label ?? "Mode"}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuLabel>FRIX AI Modes</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {MODE_OPTIONS.map((m) => (
                  <DropdownMenuItem key={m.value} onSelect={() => onModeChange(m.value)} className="flex-col items-start gap-0.5">
                    <span className={cn("text-sm", m.value === mode && "font-semibold text-primary")}>{m.label}</span>
                    <span className="text-[11px] text-muted-foreground">{m.hint}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-8 gap-1.5 px-2.5 text-xs", tool !== "none" && "border-primary/50 text-primary")}
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{activeTool?.label ?? "Tool"}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuLabel>AI Tools</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {TOOL_OPTIONS.map((t) => (
                  <DropdownMenuItem key={t.value} onSelect={() => onToolChange(t.value)} className="flex-col items-start gap-0.5">
                    <span className={cn("text-sm", t.value === tool && "font-semibold text-primary")}>{t.label}</span>
                    <span className="text-[11px] text-muted-foreground">{t.hint}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden flex-1 sm:block">
              {mode !== "normal" && <Badge variant="secondary" className="mr-1.5">{activeMode?.label}</Badge>}
              {tool !== "none" && <Badge variant="secondary">{activeTool?.label}</Badge>}
            </div>
          </div>

          <div className="mt-2 flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Ask FRIX anything…"
              rows={1}
              className="max-h-40 min-h-11 resize-none"
              aria-label="Message FRIX AI"
            />
            {busy ? (
              <Button size="icon" variant="outline" onClick={onStop} aria-label="Stop generation" className="h-11 w-11 shrink-0">
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={submit}
                disabled={!input.trim()}
                aria-label="Send message"
                className="h-11 w-11 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
