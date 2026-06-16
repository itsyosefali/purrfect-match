"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BadgeCheck, ExternalLink, Search } from "lucide-react";
import type { Conversation } from "@/types";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: number | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect?: (id: number) => void;
  onBack?: () => void;
  showBack?: boolean;
  countLabel: string;
  searchPlaceholder: string;
  backLabel: string;
  unreadLabel: (count: number) => string;
  sentPrefix: string;
}

export function ConversationList({
  conversations,
  selectedId,
  search,
  onSearchChange,
  onSelect,
  onBack,
  showBack,
  countLabel,
  searchPlaceholder,
  backLabel,
  unreadLabel,
  sentPrefix,
}: ConversationListProps) {
  const pathname = usePathname();

  const filtered = conversations.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.cat?.name.toLowerCase().includes(q)
      || c.other_user?.name.toLowerCase().includes(q)
      || c.latest_message?.body.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-full flex-col bg-[#FBF6F1]">
      <div className="border-b border-[#E8DFD6] px-4 py-4">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mb-3 flex items-center gap-1 text-sm text-[#6B5E57] hover:text-[#1C1410]"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {backLabel}
          </button>
        ) : null}
        <p className="text-xs font-medium uppercase tracking-wide text-[#6B5E57]">
          {countLabel}
        </p>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5E57]" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-full border border-[#E8DFD6] bg-white py-2.5 ps-9 pe-4 text-sm outline-none focus:border-[#1C1410]"
          />
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {filtered.map((conversation) => {
          const active = selectedId === conversation.id;
          const unread = conversation.unread_count ?? 0;

          return (
            <li key={conversation.id}>
              <Link
                href={`${pathname}?conversation=${conversation.id}`}
                scroll={false}
                onClick={() => onSelect?.(conversation.id)}
                className={cn(
                  "flex w-full gap-3 border-b border-[#E8DFD6]/80 px-4 py-3 text-start transition hover:bg-white/70",
                  active && "bg-white shadow-sm",
                )}
              >
                <div className="relative shrink-0">
                  {conversation.cat?.primary_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={conversation.cat.primary_photo_url}
                      alt=""
                      className="h-12 w-12 rounded-2xl object-cover ring-1 ring-[#E8DFD6]"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3EBE3] text-lg">
                      🐱
                    </div>
                  )}
                  {conversation.other_user?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={conversation.other_user.avatar_url}
                      alt=""
                      className="absolute -bottom-1 -end-1 h-6 w-6 rounded-full object-cover ring-2 ring-white"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#1C1410]">
                        {conversation.cat?.name}
                      </p>
                      <p className="truncate text-xs text-[#6B5E57]">
                        {conversation.other_user?.name}
                        {conversation.other_user?.is_verified ? (
                          <BadgeCheck className="ms-1 inline h-3.5 w-3.5 text-emerald-600" />
                        ) : null}
                      </p>
                    </div>
                    {conversation.latest_message ? (
                      <span className="shrink-0 text-[11px] text-[#6B5E57]">
                        {conversation.latest_message.created_ago}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-sm text-[#6B5E57]">
                      {conversation.latest_message?.is_mine ? `${sentPrefix}: ` : ""}
                      {conversation.latest_message?.body ?? "—"}
                    </p>
                    {unread > 0 ? (
                      <span className="shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {unreadLabel(unread)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface ChatPanelProps {
  catName?: string;
  catSlug?: string;
  catLocation?: string;
  otherUserName?: string;
  otherUserAvatar?: string | null;
  otherUserVerified?: boolean;
  replyMinutes?: number;
  messagesContent: React.ReactNode;
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  sending: boolean;
  placeholder: string;
  sendLabel: string;
  sendingLabel: string;
  viewListingLabel: string;
  repliesInLabel?: string;
  onBack?: () => void;
  showBack?: boolean;
  backLabel: string;
}

export function ChatPanel({
  catName,
  catSlug,
  catLocation,
  otherUserName,
  otherUserAvatar,
  otherUserVerified,
  replyMinutes,
  messagesContent,
  draft,
  onDraftChange,
  onSubmit,
  sending,
  placeholder,
  sendLabel,
  sendingLabel,
  viewListingLabel,
  repliesInLabel,
  onBack,
  showBack,
  backLabel,
}: ChatPanelProps) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 border-b border-[#E8DFD6] px-4 py-3">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-full p-2 text-[#6B5E57] hover:bg-[#FDF8F3] md:hidden"
            aria-label={backLabel}
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
        ) : null}
        {otherUserAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={otherUserAvatar}
            alt=""
            className="h-10 w-10 rounded-full object-cover ring-1 ring-[#E8DFD6]"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3EBE3]">
            🐱
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{catName}</p>
          <p className="truncate text-sm text-[#6B5E57]">
            {otherUserName}
            {otherUserVerified ? (
              <BadgeCheck className="ms-1 inline h-3.5 w-3.5 text-emerald-600" />
            ) : null}
            {catLocation ? ` · ${catLocation}` : null}
          </p>
          {repliesInLabel ? (
            <p className="text-xs text-[#6B5E57]">{repliesInLabel}</p>
          ) : null}
        </div>
        {catSlug ? (
          <Link
            href={`/cats/${catSlug}`}
            className="hidden items-center gap-1 rounded-full bg-[#FDF8F3] px-3 py-1.5 text-xs font-medium text-[#1C1410] hover:bg-[#F3EBE3] sm:flex"
          >
            {viewListingLabel}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#FDF8F3_0%,#FFFFFF_120px)] p-4">
        {messagesContent}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="border-t border-[#E8DFD6] bg-white p-4"
      >
        <div className="flex items-end gap-2 rounded-2xl bg-[#FDF8F3] p-2 ring-1 ring-[#E8DFD6] focus-within:ring-[#1C1410]/20">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder={placeholder}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="shrink-0 rounded-xl bg-[#1C1410] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {sending ? sendingLabel : sendLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
