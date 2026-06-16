"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { disconnectEcho } from "@/lib/echo";
import {
  fetchConversation,
  fetchConversations,
  sendMessage,
} from "@/lib/api/messages";
import { useConversationRealtime } from "@/hooks/useConversationRealtime";
import type { Conversation } from "@/types";
import { cn } from "@/lib/utils";

function MessagesContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const selectedId = searchParams.get("conversation")
    ? Number(searchParams.get("conversation"))
    : null;

  const [draft, setDraft] = useState("");

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    enabled: !!user,
    refetchInterval: 30_000,
  });

  const { data: activeThread } = useQuery({
    queryKey: ["conversation", selectedId],
    queryFn: () => fetchConversation(selectedId!),
    enabled: !!user && !!selectedId,
    refetchInterval: 30_000,
  });

  useConversationRealtime(selectedId, user?.id);

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendMessage(selectedId!, body),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["conversation", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
    },
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      router.replace(`/messages?conversation=${conversations[0].id}`);
    }
  }, [selectedId, conversations, router]);

  if (loading || !user) return null;

  const messages = activeThread?.messages ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Messages</h1>

      {conversations.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-[#E8DFD6]">
          <p className="mb-2 font-medium">No messages yet</p>
          <p className="text-sm text-[#6B5E57]">
            Contact a cat owner to start a conversation.
          </p>
        </div>
      ) : (
        <div className="grid min-h-[500px] overflow-hidden rounded-2xl bg-white ring-1 ring-[#E8DFD6] md:grid-cols-[280px_1fr]">
          <div className="border-b border-[#E8DFD6] md:border-b-0 md:border-r">
            <p className="border-b border-[#E8DFD6] px-4 py-3 text-sm text-[#6B5E57]">
              {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
            </p>
            <ul>
              {conversations.map((c: Conversation) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/messages?conversation=${c.id}`)}
                    className={cn(
                      "w-full border-b border-[#E8DFD6] px-4 py-3 text-left hover:bg-[#FDF8F3]",
                      selectedId === c.id && "bg-[#FDF8F3]",
                    )}
                  >
                    <p className="font-medium">{c.cat?.name}</p>
                    <p className="text-xs text-[#6B5E57]">{c.other_user?.name}</p>
                    <p className="line-clamp-1 text-sm text-[#6B5E57]">
                      {c.latest_message?.body}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            {activeThread ? (
              <>
                <div className="border-b border-[#E8DFD6] px-4 py-3">
                  <p className="font-medium">{activeThread.conversation.cat?.name}</p>
                  <p className="text-sm text-[#6B5E57]">
                    {activeThread.conversation.other_user?.name} ·{" "}
                    {activeThread.conversation.cat?.location}
                  </p>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                        msg.is_mine
                          ? "ml-auto bg-[#1C1410] text-white"
                          : "bg-[#F3EBE3] text-[#1C1410]",
                      )}
                    >
                      <p>{msg.body}</p>
                      <p className="mt-1 text-xs opacity-70">{msg.created_ago}</p>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (draft.trim()) sendMutation.mutate(draft.trim());
                  }}
                  className="flex gap-2 border-t border-[#E8DFD6] p-4"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 rounded-full border border-[#E8DFD6] px-4 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sendMutation.isPending}
                    className="rounded-full bg-[#1C1410] px-4 py-2 text-sm text-white disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-[#6B5E57]">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  useEffect(() => () => disconnectEcho(), []);

  return (
    <Suspense fallback={<p className="text-[#6B5E57]">Loading messages…</p>}>
      <MessagesContent />
    </Suspense>
  );
}
