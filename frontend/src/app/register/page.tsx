"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getApiErrorMessage } from "@/lib/api/client";
import * as authApi from "@/lib/api/auth";

const RESEND_COOLDOWN_SECONDS = 60;

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [form, setForm] = useState({
    otp: "",
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

  useEffect(() => {
    if (resendIn <= 0) return;

    const timer = window.setInterval(() => {
      setResendIn((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendIn]);

  if (loading || user) return null;

  const sendOtp = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await authApi.sendRegistrationOtp(phone);
      setResendIn(RESEND_COOLDOWN_SECONDS);
      setStep(2);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-2xl font-bold">{t("auth.joinTitle")}</h1>
      <p className="mb-6 text-sm text-[#6B5E57]">{t("auth.joinSubtitle")}</p>

      {step === 1 ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await sendOtp();
          }}
          className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-[#E8DFD6]"
        >
          <label className="block text-sm">
            {t("auth.phone")}
            <input
              type="tel"
              required
              inputMode="numeric"
              autoComplete="tel"
              placeholder={t("auth.phonePlaceholder")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
            />
          </label>
          <p className="text-xs text-[#6B5E57]">{t("auth.phoneHint")}</p>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#1C1410] py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? t("auth.sendingOtp") : t("auth.sendOtp")}
          </button>
        </form>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            setError(null);
            try {
              await register({
                phone,
                otp: form.otp,
                name: form.name,
                email: form.email || undefined,
                password: form.password,
                password_confirmation: form.password_confirmation,
                city: form.city || undefined,
              });
              router.push("/");
            } catch (err) {
              setError(getApiErrorMessage(err));
            } finally {
              setSubmitting(false);
            }
          }}
          className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-[#E8DFD6]"
        >
          <p className="text-sm text-[#6B5E57]">
            {t("auth.otpSentTo", { phone })}
          </p>
          <label className="block text-sm">
            {t("auth.otpCode")}
            <input
              type="text"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "") })}
              className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2 tracking-widest"
            />
          </label>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError(null);
              }}
              className="text-[#6B5E57] underline"
            >
              {t("auth.changePhone")}
            </button>
            <button
              type="button"
              disabled={resendIn > 0 || submitting}
              onClick={sendOtp}
              className="text-[#1C1410] underline disabled:opacity-50"
            >
              {resendIn > 0
                ? t("auth.resendIn", { seconds: resendIn })
                : t("auth.resendOtp")}
            </button>
          </div>
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
            {t("auth.emailOptional")}
            <input
              type="email"
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
      )}

      <p className="mt-4 text-center text-sm text-[#6B5E57]">
        {t("auth.alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-medium text-[#1C1410] underline">
          {t("auth.login")}
        </Link>
      </p>
    </div>
  );
}
