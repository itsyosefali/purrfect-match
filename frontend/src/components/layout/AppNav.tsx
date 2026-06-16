"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Cat, PawPrint, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { fetchNotifications, fetchUnreadCounts, markAllNotificationsRead } from "@/lib/api/messages";
import { cn } from "@/lib/utils";

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = useMemo(
    () => [
      { href: "/", label: t("nav.browse") },
      { href: "/list", label: t("nav.listCat"), auth: true },
      { href: "/messages", label: t("nav.messages"), auth: true },
      { href: "/my-listings", label: t("nav.myListings"), auth: true },
      { href: "/applications", label: t("nav.applications"), auth: true },
      { href: "/saved", label: t("nav.saved"), auth: true },
    ],
    [t],
  );

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
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:gap-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-[#1C1410]">
          <PawPrint className="h-5 w-5" />
          {t("app.name")}
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
                  <span className="ms-1.5 rounded-full bg-amber-500 px-1.5 text-xs text-white">
                    {counts.conversations}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:block" />
          {user ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications((v) => !v)}
                  className="rounded-full p-2 text-[#6B5E57] hover:bg-white"
                  aria-label={t("nav.notifications")}
                >
                  <Bell className="h-5 w-5" />
                  {counts?.unread_messages ? (
                    <span className="absolute end-1 top-1 h-2 w-2 rounded-full bg-amber-500" />
                  ) : null}
                </button>
                {showNotifications ? (
                  <div className="absolute end-0 mt-2 w-80 rounded-xl border border-[#E8DFD6] bg-white p-3 shadow-lg">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium">{t("nav.notifications")}</p>
                      {counts?.unread_messages ? (
                        <button
                          type="button"
                          onClick={() => markReadMutation.mutate()}
                          className="text-xs text-[#6B5E57] underline"
                        >
                          {t("nav.markAllRead")}
                        </button>
                      ) : null}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-[#6B5E57]">{t("nav.noNotifications")}</p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className="block w-full rounded-lg p-2 text-start hover:bg-[#FDF8F3]"
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
                {t("nav.logout")}
              </button>
            </>
          ) : loading ? null : (
            <>
              <Link href="/login" className="text-sm text-[#6B5E57] hover:text-[#1C1410]">
                {t("nav.login")}
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[#1C1410] px-4 py-1.5 text-sm text-white"
              >
                {t("nav.signup")}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto border-t border-[#E8DFD6] px-4 py-2 md:hidden">
        <LanguageSwitcher className="shrink-0 sm:hidden" />
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
            <Plus className="h-3 w-3" /> {t("nav.list")}
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
