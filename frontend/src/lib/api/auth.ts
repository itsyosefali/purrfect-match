import type { User } from "@/types";
import { api, clearCsrfToken, ensureCsrfCookie } from "./client";

export async function fetchUser() {
  const { data } = await api.get<{ data: User }>("/user");
  return data.data;
}

export async function sendRegistrationOtp(phone: string) {
  await ensureCsrfCookie();
  await api.post("/auth/otp/send", { phone });
}

export async function login(email: string, password: string) {
  await ensureCsrfCookie();
  const { data } = await api.post<{ user: User }>("/login", {
    email,
    password,
  });
  return data.user;
}

export async function register(payload: {
  name: string;
  phone: string;
  otp: string;
  password: string;
  password_confirmation: string;
  email?: string;
  city?: string;
}) {
  await ensureCsrfCookie();
  const { data } = await api.post<{ user: User }>("/register", payload);
  return data.user;
}

export async function logout() {
  await ensureCsrfCookie();
  await api.post("/logout");
  clearCsrfToken();
}
