// Sidebar for the FRIX AI workspace — new chat, search, grouped history,
// real usage/plan indicator and account actions. Rendered inside the
// desktop column and inside a bottom sheet on mobile.

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Check,
  Loader2,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoMark } from "@/components/site/Logo";
import { cn } from "@/lib/utils";
import type { FrixAccountInfo, WorkspaceConversation } from "./api";

type Props = {
  account: FrixAccountInfo | null;
  userName: string;
  userEmail: string;
  conversations: WorkspaceConversation[];
  activeId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSignOut: () => void;
};

function conversationTitle(c: WorkspaceConversation) {
  return c.title?.trim() || "Untitled conversation";
}

function groupConversations(list: WorkspaceConversation[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const groups: { label: string; items: WorkspaceConversation[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous", items: [] },
  ];
  for (const c of list) {
    const t = new Date(c.updated_at).getTime();
    if (t >= startOfToday) groups[0].items.push(c);
    else if (t >= startOfYesterday) groups[1].items.push(c);
    else groups[2].items.push(c);
  }
  return groups.filter((g) => g.items.length > 0);
}

export function WorkspaceSidebar({
  account,
  userName,
  userEmail,
  conversations,
  activeId,
  search,
  onSearchChange,
  onNewChat,
  onSelect,
  onRename,
  onDelete,
  onSignOut,
}: Props) {
  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const needle = search.trim().toLowerCase();
  const filtered = needle
    ? conversations.filter(
        (c) =>
          conversationTitle(c).toLowerCase().includes(needle) ||
          (c.title ?? "").toLowerCase().includes(needle),
      )
    : conversations;
  const groups = groupConversations(filtered);

  const commitRename = async (id: string) => {
    if (!renaming || renaming.id !== id) return;
    const title = renaming.value.trim();
    setRenaming(null);
    if (!title) return;
    try {
      await onRename(id, title);
      toast.success("Conversation renamed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rename failed");
    }
  };

  const doDelete = async (id: string) => {
    setBusyId(id);
    try {
      await onDelete(id);
      toast.success("Conversation deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const usedPct = account ? Math.min(100, Math.round((account.conversationsUsed / Math.max(1, account.limit)) * 100)) : 0;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto bg-sidebar/60 p-4 lg:border-r lg:border-border">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-1">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/30 bg-background shadow-sm">
          <LogoMark className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold leading-tight">FRIX AI</p>
          <p className="text-[11px] leading-tight text-muted-foreground">Your Intelligent AI Workspace</p>
        </div>
      </div>

      {/* New chat */}
      <Button onClick={onNewChat} className="w-full">
        <Plus className="h-4 w-4" /> New Chat
      </Button>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search conversations…"
          className="pl-9"
          aria-label="Search conversations"
        />
      </div>

      {/* Usage / plan — real numbers from the backend */}
      {account && (
        <div className="rounded-xl border border-border bg-background/70 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant={account.isFree ? "outline" : "default"}
              className={cn(!account.isFree && account.status === "trial" && "bg-emerald-600 text-white")}
            >
              {account.planName}
            </Badge>
            {account.status === "trial" && account.trialDaysLeft > 0 && (
              <span className="text-[11px] text-muted-foreground">{account.trialDaysLeft}d trial left</span>
            )}
          </div>
          <p className="mt-2.5 text-xs text-muted-foreground">
            {account.conversationsUsed} / {account.limit} conversations used this month
          </p>
          <Progress value={usedPct} className="mt-1.5 h-1.5" />
          <p className="mt-1.5 text-[11px] text-muted-foreground">{account.messagesUsed} messages exchanged</p>
          {account.isFree && (
            <Button asChild size="sm" variant="outline" className="mt-2.5 w-full">
              <Link to="/pricing">
                <Sparkles className="h-3.5 w-3.5" /> Upgrade for higher limits
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* History */}
      <div className="min-h-0 flex-1 space-y-4">
        {conversations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-5 text-center">
            <MessageSquare className="mx-auto h-7 w-7 text-muted-foreground/50" />
            <p className="mt-2 text-xs text-muted-foreground">
              No conversations yet. Start your first chat with FRIX AI.
            </p>
          </div>
        ) : groups.length === 0 ? (
          <p className="px-1 text-xs text-muted-foreground">No conversations match “{search}”.</p>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((c) => {
                  const active = c.id === activeId;
                  if (renaming?.id === c.id) {
                    return (
                      <li key={c.id} className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-background px-2 py-1.5">
                        <Input
                          autoFocus
                          value={renaming.value}
                          onChange={(e) => setRenaming({ id: c.id, value: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void commitRename(c.id);
                            if (e.key === "Escape") setRenaming(null);
                          }}
                          className="h-7 border-0 px-1 text-sm focus-visible:ring-0"
                          aria-label="Rename conversation"
                        />
                        <button type="button" onClick={() => void commitRename(c.id)} aria-label="Save name" className="shrink-0 text-emerald-500 hover:text-emerald-400">
                          <Check className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  }
                  return (
                    <li key={c.id} className="group/item relative">
                      <button
                        type="button"
                        onClick={() => onSelect(c.id)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 pr-8 text-left text-sm transition-colors",
                          active ? "bg-primary/15 font-medium text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                        )}
                        aria-current={active ? "true" : undefined}
                      >
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        <span className="truncate">{conversationTitle(c)}</span>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label={`Conversation options for ${conversationTitle(c)}`}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover/item:opacity-100 focus:opacity-100"
                          >
                            {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MoreHorizontal className="h-3.5 w-3.5" />}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onSelect={() => setRenaming({ id: c.id, value: c.title ?? "" })}>
                            <Pencil className="h-3.5 w-3.5" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => void doDelete(c.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* Account */}
      <div className="shrink-0 rounded-xl border border-border bg-background/70 p-3">
        <p className="truncate text-sm font-medium">{userName}</p>
        <p className="truncate text-[11px] text-muted-foreground">{userEmail}</p>
        <div className="mt-2.5 flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to="/portal">Account</Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={onSignOut} aria-label="Sign out">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
