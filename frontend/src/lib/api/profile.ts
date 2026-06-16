import type { PublicUser, User } from "@/types";
import { api } from "./client";

export async function fetchPublicUser(id: number) {
  const { data } = await api.get<{ data: PublicUser }>(`/users/${id}`);
  return data.data;
}

export async function updateProfile(formData: FormData) {
  const { data } = await api.patch<{ data: User }>("/user", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function updatePassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) {
  await api.post("/user/password", payload);
}

export async function forgotPassword(email: string) {
  await api.post("/forgot-password", { email });
}

export async function resetPassword(payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  await api.post("/reset-password", payload);
}
