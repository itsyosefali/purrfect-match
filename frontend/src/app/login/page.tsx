"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getApiErrorMessage } from "@/lib/api/client";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace("/");
    return null;
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-2xl font-bold">Welcome back</h1>
      <p className="mb-6 text-sm text-[#6B5E57]">Log in to list cats, save favorites, and message owners.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          try {
            await login(email, password);
            router.push("/");
          } catch (err) {
            setError(getApiErrorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
        className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-[#E8DFD6]"
      >
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <p className="text-right text-sm">
          <Link href="/forgot-password" className="text-[#6B5E57] underline">
            Forgot password?
          </Link>
        </p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#1C1410] py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[#6B5E57]">
        No account?{" "}
        <Link href="/register" className="font-medium text-[#1C1410] underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
