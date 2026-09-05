// FRIX AI Workspace — the authenticated member experience: dashboard
// sidebar (history, search, usage, plan), a markdown chat with modes and
// tools, and real backend-driven usage limits with upgrade prompts.

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchWorkspaceAccount,
  fetchConversations,
  fetchConversationMessages,
  sendChat,
  renameConversation,
  deleteConversation,
  type FrixAccountInfo,
  type WorkspaceConversation,
  type WorkspaceMessage,
} from "./api";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import {
  ChatThread,
  type FrixModeOption,
  type FrixToolOption,
} from "./ChatThread";

let tempId = 0;

export function FrixWorkspace() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [account, setAccount] = useState<FrixAccountInfo | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [conversations, setConversations] = useState<WorkspaceConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<FrixModeOption>("normal");
  const [tool, setTool] = useState<FrixToolOption>("none");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const refreshConversations = useCallback(async () => {
    try {
      const list = await fetchConversations();
      setConversations(list);
    } catch {
      /* the sidebar keeps its previous list */
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [acc, list] = await Promise.all([fetchWorkspaceAccount(), fetchConversations()]);
        if (!active) return;
        setAccount(acc.account);
        setUserName(acc.user.name);
        setUserEmail(acc.user.email);
        setConversations(list);
      } catch {
        if (active) setLoadFailed(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const activeTitle = activeConversation?.title?.trim() || (activeId ? "Untitled conversation" : "New chat");

  const newChat = () => {
    abortRef.current?.abort();
    setActiveId(null);
    setMessages([]);
    setError(null);
    setLimitReached(false);
    setSidebarOpen(false);
  };

  const selectConversation = async (id: string) => {
    abortRef.current?.abort();
    setSidebarOpen(false);
    setError(null);
    setLimitReached(false);
    if (id === activeId) return;
    try {
      const { conversation, messages: msgs } = await fetchConversationMessages(id);
      setActiveId(id);
      setMessages(msgs);
      const convMode = conversation.mode as FrixModeOption | null;
      setMode(convMode && ["pidgin", "exam", "lowdata"].includes(convMode) ? convMode : "normal");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open this conversation.");
    }
  };

  const run = useCallback(
    async (opts: { message?: string; regenerate?: boolean; restoreOnLimit?: string }) => {
      setBusy(true);
      setError(null);
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const optimistic = opts.message
        ? {
            id: `temp-${++tempId}`,
            role: "user",
            content: opts.message,
            created_at: new Date().toISOString(),
          }
        : null;
      if (optimistic) {
        setMessages((prev) => {
          // A regenerated run replaces the previous assistant bubble instead of stacking.
          const base = opts.regenerate && prev.length > 0 && prev[prev.length - 1].role === "assistant"
            ? prev.slice(0, -1)
            : prev;
          return [...base, optimistic];
        });
      }

      try {
        const { ok, status, json } = await sendChat({
          conversationId: activeId,
          message: opts.message,
          mode,
          tool,
          regenerate: opts.regenerate,
          signal: ctrl.signal,
        });

        if (!ok || !json.reply) {
          // Attach to a freshly created conversation so retry keeps context.
          if (json.conversationId && !activeId) setActiveId(json.conversationId);

          if (status === 402) {
            setLimitReached(true);
            setError(json.error ?? "You've reached your usage limit.");
            setAccount((prev) =>
              prev ? { ...prev, canStart: false } : prev,
            );
            if (optimistic) {
              setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
              setInput(opts.restoreOnLimit ?? optimistic.content);
            }
            return;
          }
          throw new Error(json.error ?? "FRIX AI couldn't process that request. Please try again.");
        }

        if (json.conversationId && !activeId) setActiveId(json.conversationId);

        setMessages((prev) => {
          const withoutTemp = optimistic ? prev.filter((m) => m.id !== optimistic.id) : prev;
          const next = [...withoutTemp];
          if (json.userMessage) next.push(json.userMessage);
          if (json.assistantMessage) next.push(json.assistantMessage);
          return next;
        });

        if (json.usage) {
          setAccount((prev) =>
            prev ? { ...prev, conversationsUsed: json.usage!.conversationsUsed, limit: json.usage!.limit } : prev,
          );
        }
        void refreshConversations();
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          toast.message("Generation stopped");
          return;
        }
        // The user message is already persisted server-side; keep it in view.
        setError(err instanceof Error ? err.message : "FRIX AI couldn't process that request. Please try again.");
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [activeId, mode, tool, refreshConversations],
  );

  const handleSend = (text: string) => {
    if (!account?.canStart && !activeId) {
      setLimitReached(true);
      return;
    }
    setInput("");
    void run({ message: text, restoreOnLimit: text });
  };

  const handleRegenerate = () => {
    if (!activeId || busy) return;
    void run({ regenerate: true });
  };

  const handleStop = () => abortRef.current?.abort();

  const handleRetry = () => {
    if (activeId) {
      void run({ regenerate: true });
    } else {
      setError(null);
    }
  };

  const handleRename = async (id: string, title: string) => {
    await renameConversation(id, title);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
  };

  const handleDelete = async (id: string) => {
    await deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (id === activeId) {
      setActiveId(null);
      setMessages([]);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/", replace: true });
  };

  const sidebar = (
    <WorkspaceSidebar
      account={account}
      userName={userName || user?.email?.split("@")[0] || "FRAN-X Member"}
      userEmail={userEmail || user?.email || ""}
      conversations={conversations}
      activeId={activeId}
      search={search}
      onSearchChange={setSearch}
      onNewChat={newChat}
      onSelect={selectConversation}
      onRename={handleRename}
      onDelete={handleDelete}
      onSignOut={handleSignOut}
    />
  );

  if (loadFailed) {
    return (
      <div className="grid h-[50vh] place-items-center px-6 text-center">
        <div>
          <p className="font-display text-lg font-semibold">FRIX AI couldn't load your workspace</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto h-[calc(100dvh-7.5rem)] w-full overflow-hidden border-x border-border/60 bg-background/40 lg:h-screen lg:max-w-[100rem]">
        <div className="flex h-full">
          <aside className="hidden w-72 shrink-0 lg:block">{sidebar}</aside>
          <main className="min-w-0 flex-1">
            <ChatThread
              messages={messages}
              busy={busy}
              error={error}
              limitReached={limitReached}
              account={account}
              activeTitle={activeTitle}
              mode={mode}
              tool={tool}
              input={input}
              onInputChange={setInput}
              onModeChange={setMode}
              onToolChange={setTool}
              onSend={handleSend}
              onRegenerate={handleRegenerate}
              onStop={handleStop}
              onRetry={handleRetry}
              onOpenSidebar={() => setSidebarOpen(true)}
            />
          </main>
        </div>
      </div>

      {/* Mobile history sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[19rem] p-0 sm:max-w-[19rem]">
          <SheetTitle className="sr-only">FRIX AI history</SheetTitle>
          {sidebar}
        </SheetContent>
      </Sheet>
    </>
  );
}

