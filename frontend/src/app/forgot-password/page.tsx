"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { forgotPassword } from "@/lib/api/profile";
import { getApiErrorMessage } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => forgotPassword(email),
    onSuccess: () => setSent(true),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Reset Password</h1>
      {sent ? (
        <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E8DFD6]">
          <p className="text-sm text-[#6B5E57]">
            If an account exists for {email}, you will receive a reset link shortly.
          </p>
          <Link href="/login" className="mt-4 inline-block text-sm underline">
            Back to login
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
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
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-full bg-[#1C1410] py-2.5 text-sm text-white disabled:opacity-50"
          >
            Send Reset Link
          </button>
          <Link href="/login" className="block text-center text-sm text-[#6B5E57] underline">
            Back to login
          </Link>
        </form>
      )}
    </div>
  );
}
