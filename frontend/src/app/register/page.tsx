"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getApiErrorMessage } from "@/lib/api/client";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    city: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace("/");
    return null;
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-2xl font-bold">Join Purrfect Match</h1>
      <p className="mb-6 text-sm text-[#6B5E57]">Create an account to adopt or rehome cats.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          try {
            await register(form);
            router.push("/");
          } catch (err) {
            setError(getApiErrorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
        className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-[#E8DFD6]"
      >
        {(["name", "email", "city"] as const).map((field) => (
          <label key={field} className="block text-sm capitalize">
            {field}
            <input
              type={field === "email" ? "email" : "text"}
              required={field !== "city"}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
            />
          </label>
        ))}
        <label className="block text-sm">
          Password
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Confirm password
          <input
            type="password"
            required
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#1C1410] py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[#6B5E57]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#1C1410] underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
