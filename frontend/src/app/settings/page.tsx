"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { updatePassword, updateProfile } from "@/lib/api/profile";
import { getApiErrorMessage } from "@/lib/api/client";

export default function SettingsPage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCity(user.city ?? "");
    }
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("city", city);
      if (avatar) fd.append("avatar", avatar);
      return updateProfile(fd);
    },
    onSuccess: async () => {
      await refresh();
      setProfileMsg("Profile updated.");
      setProfileErr(null);
      setAvatar(null);
    },
    onError: (err) => {
      setProfileErr(getApiErrorMessage(err));
      setProfileMsg(null);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      updatePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      }),
    onSuccess: () => {
      setPwMsg("Password updated.");
      setPwErr(null);
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
    },
    onError: (err) => {
      setPwErr(getApiErrorMessage(err));
      setPwMsg(null);
    },
  });

  if (loading || !user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      <section className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-[#E8DFD6]">
        <h2 className="font-semibold">Profile</h2>
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F3EBE3] text-sm">
              {user.name.charAt(0)}
            </div>
          )}
          <label className="text-sm">
            Change avatar
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
              className="mt-1 block text-xs"
            />
          </label>
        </div>
        <label className="block text-sm">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          City
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <p className="text-sm text-[#6B5E57]">Email: {user.email}</p>
        {profileMsg ? <p className="text-sm text-emerald-600">{profileMsg}</p> : null}
        {profileErr ? <p className="text-sm text-red-600">{profileErr}</p> : null}
        <button
          type="button"
          disabled={profileMutation.isPending}
          onClick={() => profileMutation.mutate()}
          className="rounded-full bg-[#1C1410] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Save Profile
        </button>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-[#E8DFD6]">
        <h2 className="font-semibold">Password</h2>
        <label className="block text-sm">
          Current password
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          New password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Confirm new password
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        {pwMsg ? <p className="text-sm text-emerald-600">{pwMsg}</p> : null}
        {pwErr ? <p className="text-sm text-red-600">{pwErr}</p> : null}
        <button
          type="button"
          disabled={passwordMutation.isPending}
          onClick={() => passwordMutation.mutate()}
          className="rounded-full bg-[#1C1410] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Update Password
        </button>
        <p className="text-sm">
          <Link href="/forgot-password" className="text-[#6B5E57] underline">
            Forgot password?
          </Link>
        </p>
      </section>
    </div>
  );
}
