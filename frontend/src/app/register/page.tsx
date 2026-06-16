"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getApiErrorMessage } from "@/lib/api/client";

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    city: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  if (loading || user) return null;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-2xl font-bold">{t("auth.joinTitle")}</h1>
      <p className="mb-6 text-sm text-[#6B5E57]">{t("auth.joinSubtitle")}</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);
          setError(null);
          try {
            await register(form);
            router.push("/");
          } catch (err) {
            setError(getApiErrorMessage(err));
          } finally {
            setSubmitting(false);
          }
        }}
        className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-[#E8DFD6]"
      >
        <label className="block text-sm">
          {t("auth.name")}
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t("auth.email")}
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t("auth.city")}
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t("auth.password")}
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t("auth.confirmPassword")}
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
          disabled={submitting}
          className="w-full rounded-full bg-[#1C1410] py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? t("auth.creatingAccount") : t("auth.signup")}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[#6B5E57]">
        {t("auth.alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-medium text-[#1C1410] underline">
          {t("auth.login")}
        </Link>
      </p>
    </div>
  );
}
