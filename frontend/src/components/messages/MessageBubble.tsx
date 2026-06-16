"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  youLabel: string;
}

export function MessageBubble({ message, youLabel }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex max-w-[85%] flex-col gap-1",
        message.is_mine ? "ms-auto items-end" : "me-auto items-start",
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          message.is_mine
            ? "rounded-ee-md bg-[#1C1410] text-white"
            : "rounded-es-md bg-white text-[#1C1410] ring-1 ring-[#E8DFD6]",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
      </div>
      <span className="px-1 text-[11px] text-[#6B5E57]">
        {message.is_mine ? youLabel : null}
        {message.is_mine ? " · " : null}
        {message.created_ago}
      </span>
    </div>
  );
}

export function groupMessagesByDay(
  messages: Message[],
  labels: { today: string; yesterday: string },
) {
  const groups: { label: string; messages: Message[] }[] = [];

  messages.forEach((message) => {
    const date = new Date(message.created_at);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let label = date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    if (date.toDateString() === today.toDateString()) label = labels.today;
    else if (date.toDateString() === yesterday.toDateString()) label = labels.yesterday;

    const last = groups[groups.length - 1];
    if (last?.label === label) last.messages.push(message);
    else groups.push({ label, messages: [message] });
  });

  return groups;
}
