"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getEcho, disconnectEcho } from "@/lib/echo";

export function useConversationRealtime(conversationId: number | null, userId?: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId || !userId) return;

    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private(`conversation.${conversationId}`);

    channel.listen(".message.sent", () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => {
      channel.stopListening(".message.sent");
      echo.leave(`conversation.${conversationId}`);
    };
  }, [conversationId, userId, queryClient]);
}
