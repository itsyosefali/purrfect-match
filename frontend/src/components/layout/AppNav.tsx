"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Cat, Heart, MessageCircle, PawPrint, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchNotifications, fetchUnreadCounts, markAllNotificationsRead } from "@/lib/api/messages";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Browse" },
  { href: "/list", label: "List a Cat", auth: true },
  { href: "/messages", label: "Messages", auth: true },
  { href: "/my-listings", label: "My Listings", auth: true },
  { href: "/applications", label: "Applications", auth: true },
  { href: "/saved", label: "Saved", auth: true },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);

  const markReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
    },
  });

  const { data: counts } = useQuery({
    queryKey: ["unread-counts"],
    queryFn: fetchUnreadCounts,
    enabled: !!user,
    refetchInterval: 15_000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: !!user && showNotifications,
  });

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8DFD6] bg-[#FDF8F3]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-[#1C1410]">
          <PawPrint className="h-5 w-5" />
          Purrfect Match
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {navItems.map((item) => {
            if (item.auth && !user) return null;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition",
                  active
                    ? "bg-[#1C1410] text-white"
                    : "text-[#6B5E57] hover:bg-white hover:text-[#1C1410]",
                )}
              >
                {item.label}
                {item.href === "/messages" && counts?.conversations ? (
                  <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 text-xs text-white">
                    {counts.conversations}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications((v) => !v)}
                  className="rounded-full p-2 text-[#6B5E57] hover:bg-white"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {counts?.unread_messages ? (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" />
                  ) : null}
                </button>
                {showNotifications ? (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#E8DFD6] bg-white p-3 shadow-lg">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium">Notifications</p>
                      {counts?.unread_messages ? (
                        <button
                          type="button"
                          onClick={() => markReadMutation.mutate()}
                          className="text-xs text-[#6B5E57] underline"
                        >
                          Mark all read
                        </button>
                      ) : null}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-[#6B5E57]">No new notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className="block w-full rounded-lg p-2 text-left hover:bg-[#FDF8F3]"
                          onClick={() => {
                            setShowNotifications(false);
                            router.push(`/messages?conversation=${n.conversation_id}`);
                          }}
                        >
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="line-clamp-2 text-xs text-[#6B5E57]">{n.body}</p>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
              <Link
                href="/settings"
                className="hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-[#1C1410] shadow-sm md:flex"
              >
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <Cat className="h-4 w-4" />
                )}
                {user.name}
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="hidden rounded-full px-3 py-1.5 text-sm text-[#6B5E57] hover:text-[#1C1410] md:block"
              >
                Log out
              </button>
            </>
          ) : loading ? null : (
            <>
              <Link href="/login" className="text-sm text-[#6B5E57] hover:text-[#1C1410]">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[#1C1410] px-4 py-1.5 text-sm text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-t border-[#E8DFD6] px-4 py-2 md:hidden">
        {navItems.map((item) => {
          if (item.auth && !user) return null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs text-[#1C1410]"
            >
              {item.label}
            </Link>
          );
        })}
        {user ? (
          <Link href="/list" className="flex items-center gap-1 rounded-full bg-[#1C1410] px-3 py-1 text-xs text-white">
            <Plus className="h-3 w-3" /> List
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#1C1410]">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
