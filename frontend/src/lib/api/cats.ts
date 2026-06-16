import type { CatFilters, CatListing, PaginatedResponse, Stats } from "@/types";
import { api } from "./client";

export async function fetchCats(filters: CatFilters = {}) {
  const { data } = await api.get<PaginatedResponse<CatListing>>("/cats", {
    params: filters,
  });
  return data;
}

export async function fetchCat(slug: string) {
  const { data } = await api.get<{ data: CatListing }>(`/cats/${slug}`);
  return data.data;
}

export async function fetchStats() {
  const { data } = await api.get<{ data: Stats }>("/stats");
  return data.data;
}

export async function createCatListing(formData: FormData) {
  const { data } = await api.post<{ data: CatListing }>("/cats", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function fetchMyListings() {
  const { data } = await api.get<{ data: CatListing[] }>("/my-listings");
  return data.data;
}

export async function deleteListing(id: number) {
  await api.delete(`/cats/${id}`);
}

export async function updateListing(id: number, formData: FormData) {
  const { data } = await api.patch<{ data: CatListing }>(`/cats/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function updateListingStatus(
  id: number,
  status: string,
) {
  const { data } = await api.patch<{ data: CatListing }>(`/cats/${id}`, {
    status,
  });
  return data.data;
}
