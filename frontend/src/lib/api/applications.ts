import type { AdoptionApplication } from "@/types";
import { api } from "./client";

export async function applyToAdopt(catId: number, message: string) {
  const { data } = await api.post<{ data: AdoptionApplication }>(`/cats/${catId}/apply`, {
    message,
  });
  return data.data;
}

export async function fetchMyApplications() {
  const { data } = await api.get<{ data: AdoptionApplication[] }>("/my-applications");
  return data.data;
}

export async function fetchListingApplications(catId: number) {
  const { data } = await api.get<{ data: AdoptionApplication[] }>(
    `/cats/${catId}/applications`,
  );
  return data.data;
}

export async function updateApplication(
  id: number,
  status: "approved" | "rejected" | "withdrawn",
) {
  const { data } = await api.patch<{ data: AdoptionApplication }>(`/applications/${id}`, {
    status,
  });
  return data.data;
}
