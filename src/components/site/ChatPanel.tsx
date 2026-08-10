import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  thread_user_id: string;
  sender_id: string;
  body: string;
  from_admin: boolean;
  read_at: string | null;
  created_at: string;
};

export function ChatPanel({
  threadUserId,
  currentUserId,
  asAdmin,
  title = "Chat with FRAN-X",
}: {
  threadUserId: string;
  currentUserId: string;
  asAdmin: boolean;
  title?: string;
}) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const queryKey = useMemo(() => ["messages", threadUserId], [threadUserId]);

  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("thread_user_id", threadUserId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`messages-${threadUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `thread_user_id=eq.${threadUserId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [threadUserId, queryClient, queryKey]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [data]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      thread_user_id: threadUserId,
      sender_id: currentUserId,
      body,
      from_admin: asAdmin,
    });
    setSending(false);
    if (!error) {
      setText("");
      void queryClient.invalidateQueries({ queryKey });
    }
  };

  return (
    <div className="glass-panel flex h-[30rem] flex-col rounded-xl">
      <div className="border-b border-border/60 px-5 py-4">
        <p className="font-display text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">Messages are private between you and FRAN-X.</p>
      </div>
      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {(data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
        ) : (
          (data ?? []).map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-surface text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className="mt-1 text-[10px] opacity-70">
                    {m.from_admin ? "FRAN-X team" : "Client"} ·{" "}
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-border/60 p-4">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          aria-label="Message"
        />
        <Button type="submit" disabled={sending} size="icon" aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}