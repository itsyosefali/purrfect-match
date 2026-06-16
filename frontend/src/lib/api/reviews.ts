import type { Review } from "@/types";
import { api } from "./client";

export async function fetchReviews(slug: string) {
  const { data } = await api.get<{ data: Review[] }>(`/cats/${slug}/reviews`);
  return data.data;
}

export async function createReview(slug: string, payload: { rating: number; body?: string }) {
  const { data } = await api.post<{ data: Review }>(`/cats/${slug}/reviews`, payload);
  return data.data;
}
