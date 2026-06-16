import type { CatTrait } from "@/types";
import { api } from "./client";

export async function fetchTraits() {
  const { data } = await api.get<{ data: CatTrait[] }>("/traits");
  return data.data;
}
