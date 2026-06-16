import type { Conversation, Message, Notification } from "@/types";
import { api } from "./client";

export async function fetchConversations() {
  const { data } = await api.get<{ data: Conversation[] }>("/conversations");
  return data.data;
}

export async function fetchConversation(id: number) {
  const { data } = await api.get<{
    data: Conversation;
    messages: Message[];
  }>(`/conversations/${id}`);
  return {
    conversation: data.data,
    messages: data.messages ?? [],
  };
}

export async function startConversation(
  catListingId: number,
  body: string,
) {
  const { data } = await api.post<{ data: Conversation }>("/conversations", {
    cat_listing_id: catListingId,
    body,
  });
  return data.data;
}

export async function sendMessage(conversationId: number, body: string) {
  const { data } = await api.post<{ data: Message }>(
    `/conversations/${conversationId}/messages`,
    { body },
  );
  return data.data;
}

export async function fetchNotifications() {
  const { data } = await api.get<{ data: Notification[] }>("/notifications");
  return data.data;
}

export async function markAllNotificationsRead() {
  await api.post("/notifications/mark-all-read");
}

export async function fetchUnreadCounts() {
  const { data } = await api.get<{
    data: { unread_messages: number; conversations: number };
  }>("/notifications/unread-count");
  return data.data;
}
