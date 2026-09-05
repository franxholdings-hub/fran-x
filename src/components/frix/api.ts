// Client-side API helpers for the FRIX AI workspace. Every request is
// authenticated with the current Supabase session token.

import { supabase } from "@/integrations/supabase/client";

export type WorkspaceMessage = {
  id: string;
  role: "user" | "assistant" | string;
  content: string;
  created_at: string;
};

export type WorkspaceConversation = {
  id: string;
  title: string | null;
  mode: string | null;
  status: string;
  message_count: number;
  created_at: string;
  updated_at: string;
};

export type FrixAccountInfo = {
  status: "none" | "trial" | "active" | "past_due" | "expired";
  planName: string;
  planCode: string;
  monthlyPrice: number;
  limit: number;
  conversationsUsed: number;
  messagesUsed: number;
  canStart: boolean;
  isFree: boolean;
  trialDaysLeft: number;
};

async function authFetch(url: string, init?: RequestInit) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? "";
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchWorkspaceAccount() {
  const res = await authFetch("/api/frix/account");
  if (!res.ok) throw new Error("Could not load your FRIX AI account.");
  const json = (await res.json()) as {
    user: { name: string; email: string };
    account: FrixAccountInfo;
  };
  return json;
}

export async function fetchConversations() {
  const res = await authFetch("/api/frix/conversations");
  if (!res.ok) throw new Error("Could not load your conversations.");
  const json = (await res.json()) as { conversations: WorkspaceConversation[] };
  return json.conversations;
}

export async function fetchConversationMessages(id: string) {
  const res = await authFetch(`/api/frix/conversation?id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Could not load this conversation.");
  const json = (await res.json()) as {
    conversation: WorkspaceConversation;
    messages: WorkspaceMessage[];
  };
  return json;
}

export type ChatRequest = {
  conversationId?: string | null;
  message?: string;
  mode?: string;
  tool?: string;
  regenerate?: boolean;
  signal?: AbortSignal;
};

export async function sendChat(req: ChatRequest) {
  const res = await authFetch("/api/frix/chat", {
    method: "POST",
    body: JSON.stringify({
      conversationId: req.conversationId ?? null,
      message: req.message,
      mode: req.mode,
      tool: req.tool,
      regenerate: req.regenerate ?? false,
    }),
    signal: req.signal,
  });
  const json = (await res.json()) as {
    conversationId?: string;
    reply?: string;
    userMessage?: WorkspaceMessage | null;
    assistantMessage?: WorkspaceMessage | null;
    usage?: { conversationsUsed: number; limit: number };
    error?: string;
    limitReached?: boolean;
  };
  return { ok: res.ok, status: res.status, json };
}

export async function renameConversation(id: string, title: string) {
  const res = await authFetch("/api/frix/conversation", {
    method: "PATCH",
    body: JSON.stringify({ id, title }),
  });
  if (!res.ok) throw new Error("Could not rename the conversation.");
}

export async function deleteConversation(id: string) {
  const res = await authFetch(`/api/frix/conversation?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Could not delete the conversation.");
}
