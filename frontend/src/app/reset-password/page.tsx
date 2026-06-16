"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/lib/api/profile";
import { getApiErrorMessage } from "@/lib/api/client";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }),
    onSuccess: () => router.push("/login"),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  if (!token || !email) {
    return (
      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E8DFD6]">
        <p className="text-sm text-[#6B5E57]">Invalid or expired reset link.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-[#E8DFD6]"
    >
      <label className="block text-sm">
        New password
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Confirm password
        <input
          type="password"
          required
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-full bg-[#1C1410] py-2.5 text-sm text-white disabled:opacity-50"
      >
        Reset Password
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Choose a New Password</h1>
      <Suspense fallback={<p className="text-sm text-[#6B5E57]">Loading…</p>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
