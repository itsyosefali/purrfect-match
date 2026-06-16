"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { ChatPanel, ConversationList } from "@/components/messages/ConversationChat";
import { groupMessagesByDay, MessageBubble } from "@/components/messages/MessageBubble";
import { disconnectEcho } from "@/lib/echo";
import {
  fetchConversation,
  fetchConversations,
  sendMessage,
} from "@/lib/api/messages";
import { useConversationRealtime } from "@/hooks/useConversationRealtime";
import { cn } from "@/lib/utils";

function MessagesContent() {
  const { user, loading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const conversationParam = searchParams.get("conversation");
  const selectedId = conversationParam ? Number(conversationParam) : null;
  const validSelectedId = selectedId && !Number.isNaN(selectedId) ? selectedId : null;

  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    enabled: !!user,
    refetchInterval: 30_000,
  });

  const { data: activeThread, isFetching: isThreadLoading } = useQuery({
    queryKey: ["conversation", validSelectedId],
    queryFn: () => fetchConversation(validSelectedId!),
    enabled: !!user && !!validSelectedId,
    refetchInterval: 30_000,
  });

  useConversationRealtime(validSelectedId, user?.id);

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendMessage(validSelectedId!, body),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["conversation", validSelectedId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
    },
  });

  const selectConversation = useCallback((id: number) => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      setMobileView("chat");
    }
    router.push(`/messages?conversation=${id}`, { scroll: false });
  }, [router]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!validSelectedId && conversations.length > 0) {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      if (isDesktop) {
        router.replace(`/messages?conversation=${conversations[0].id}`, { scroll: false });
      }
    }
  }, [validSelectedId, conversations, router]);

  useEffect(() => {
    if (validSelectedId && window.matchMedia("(max-width: 767px)").matches) {
      setMobileView("chat");
    }
  }, [validSelectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length, validSelectedId]);

  if (loading || !user) return null;

  const messages = activeThread?.messages ?? [];
  const messageGroups = groupMessagesByDay(messages, {
    today: t("messages.today"),
    yesterday: t("messages.yesterday"),
  });

  const conversation = activeThread?.conversation;
  const countLabel = t(
    conversations.length === 1 ? "messages.conversationCount" : "messages.conversationCount_plural",
    { count: conversations.length },
  );

  const showChatOnMobile = mobileView === "chat" && !!validSelectedId;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("messages.title")}</h1>
        <p className="text-sm text-[#6B5E57]">{t("messages.subtitle")}</p>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center ring-1 ring-[#E8DFD6]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3EBE3]">
            <MessageCircle className="h-8 w-8 text-[#6B5E57]" />
          </div>
          <p className="mb-2 text-lg font-semibold">{t("messages.emptyTitle")}</p>
          <p className="mx-auto mb-6 max-w-sm text-sm text-[#6B5E57]">
            {t("messages.emptyBody")}
          </p>
          <Link
            href="/"
            className="inline-flex rounded-full bg-[#1C1410] px-5 py-2.5 text-sm font-medium text-white"
          >
            {t("messages.browseCats")}
          </Link>
        </div>
      ) : (
        <div className="relative grid h-[min(720px,calc(100vh-12rem))] grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#E8DFD6] md:grid-cols-[320px_minmax(0,1fr)]">
          <div
            className={cn(
              "relative z-20 h-full min-h-0 min-w-0 border-[#E8DFD6] md:border-e",
              showChatOnMobile ? "hidden md:block" : "block",
            )}
          >
            <ConversationList
              conversations={conversations}
              selectedId={validSelectedId}
              search={search}
              onSearchChange={setSearch}
              onSelect={selectConversation}
              countLabel={countLabel}
              searchPlaceholder={t("messages.searchPlaceholder")}
              backLabel={t("messages.backToList")}
              unreadLabel={(count) => t("messages.unread", { count })}
              sentPrefix={t("messages.you")}
            />
          </div>

          <div
            className={cn(
              "relative z-10 h-full min-h-0 min-w-0",
              showChatOnMobile ? "block" : "hidden md:block",
            )}
          >
            {conversation && validSelectedId === conversation.id ? (
              <ChatPanel
                catName={conversation.cat?.name}
                catSlug={conversation.cat?.slug}
                catLocation={conversation.cat?.location}
                otherUserName={conversation.other_user?.name}
                otherUserAvatar={conversation.other_user?.avatar_url}
                otherUserVerified={conversation.other_user?.is_verified}
                replyMinutes={conversation.other_user?.avg_response_minutes}
                draft={draft}
                onDraftChange={setDraft}
                onSubmit={() => {
                  if (draft.trim()) sendMutation.mutate(draft.trim());
                }}
                sending={sendMutation.isPending}
                placeholder={t("messages.typePlaceholder")}
                sendLabel={t("messages.send")}
                sendingLabel={t("messages.sending")}
                viewListingLabel={t("messages.viewListing")}
                repliesInLabel={
                  conversation.other_user?.avg_response_minutes
                    ? t("messages.repliesIn", {
                        minutes: conversation.other_user.avg_response_minutes,
                      })
                    : undefined
                }
                showBack
                backLabel={t("messages.backToList")}
                onBack={() => setMobileView("list")}
                messagesContent={
                  messageGroups.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-[#6B5E57]">
                      {isThreadLoading ? t("common.loading") : t("messages.selectConversationHint")}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messageGroups.map((group) => (
                        <div key={group.label}>
                          <div className="mb-4 flex justify-center">
                            <span className="rounded-full bg-white px-3 py-1 text-xs text-[#6B5E57] ring-1 ring-[#E8DFD6]">
                              {group.label}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {group.messages.map((msg) => (
                              <MessageBubble
                                key={msg.id}
                                message={msg}
                                youLabel={t("messages.you")}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                      <div ref={bottomRef} />
                    </div>
                  )
                }
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-[#FDF8F3] p-8 text-center">
                <MessageCircle className="h-10 w-10 text-[#6B5E57]/60" />
                <p className="font-medium">
                  {isThreadLoading ? t("common.loading") : t("messages.selectConversation")}
                </p>
                <p className="max-w-xs text-sm text-[#6B5E57]">
                  {t("messages.selectConversationHint")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  const { t } = useLocale();

  useEffect(() => () => disconnectEcho(), []);

  return (
    <Suspense fallback={<p className="text-[#6B5E57]">{t("messages.loading")}</p>}>
      <MessagesContent />
    </Suspense>
  );
}
