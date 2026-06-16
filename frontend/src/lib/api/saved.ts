import type { CatListing } from "@/types";
import { api } from "./client";

export async function fetchSavedCats() {
  const { data } = await api.get<{ data: CatListing[] }>("/saved-cats");
  return data.data;
}

export async function saveCat(catId: number) {
  await api.post(`/cats/${catId}/save`);
}

export async function unsaveCat(catId: number) {
  await api.delete(`/cats/${catId}/save`);
}
