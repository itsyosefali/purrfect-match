"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getApiErrorMessage } from "@/lib/api/client";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const demoAccounts = useMemo(
    () => [
      { label: t("auth.demoAdopter"), email: "alex@purrfectmatch.test" },
      { label: t("auth.demoOwner"), email: "priya@purrfectmatch.test" },
      { label: t("auth.demoAdmin"), email: "admin@purrfectmatch.test" },
    ],
    [t],
  );

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  if (loading || user) return null;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-2xl font-bold">{t("auth.welcomeBack")}</h1>
      <p className="mb-6 text-sm text-[#6B5E57]">{t("auth.loginSubtitle")}</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);
          setError(null);
          try {
            await login(email, password);
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
          {t("auth.email")}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t("auth.password")}
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <p className="text-end text-sm">
          <Link href="/forgot-password" className="text-[#6B5E57] underline">
            {t("auth.forgotPassword")}
          </Link>
        </p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[#1C1410] py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? t("auth.loggingIn") : t("auth.login")}
        </button>
      </form>
      <div className="mt-4 rounded-xl bg-[#FDF8F3] p-4 text-sm">
        <p className="mb-2 font-medium">{t("auth.demoAccounts", { password: "password" })}</p>
        <div className="flex flex-wrap gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setPassword("password");
                setError(null);
              }}
              className="rounded-full bg-white px-3 py-1 text-xs ring-1 ring-[#E8DFD6] hover:bg-[#F3EBE3]"
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-[#6B5E57]">
        {t("auth.noAccount")}{" "}
        <Link href="/register" className="font-medium text-[#1C1410] underline">
          {t("auth.signup")}
        </Link>
      </p>
    </div>
  );
}
