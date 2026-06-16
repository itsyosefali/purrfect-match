import { api } from "./client";

export async function reportListing(
  catId: number,
  payload: { reason: string; body?: string },
) {
  await api.post(`/cats/${catId}/report`, payload);
}
