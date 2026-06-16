"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchMyApplications, updateApplication } from "@/lib/api/applications";
import { formatFee } from "@/lib/utils";

export default function ApplicationsPage() {
  const { user, loading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: fetchMyApplications,
    enabled: !!user,
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: number) => updateApplication(id, "withdrawn"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-applications"] }),
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("applications.title")}</h1>
      {isLoading ? (
        <p className="text-[#6B5E57]">{t("common.loading")}</p>
      ) : applications.length === 0 ? (
        <EmptyState
          title={t("applications.emptyTitle")}
          description={t("applications.emptyBody")}
          action={
            <Link href="/" className="rounded-full bg-[#1C1410] px-4 py-2 text-sm text-white">
              {t("applications.browseCats")}
            </Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {applications.map((app) => (
            <li key={app.id} className="rounded-2xl bg-white p-4 ring-1 ring-[#E8DFD6]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={app.cat ? `/cats/${app.cat.slug}` : "#"}
                    className="font-semibold hover:underline"
                  >
                    {app.cat?.name ?? t("applications.catFallback")}
                  </Link>
                  <p className="text-sm text-[#6B5E57]">
                    {t("applications.status", { status: t(`status.${app.status}`) })}
                  </p>
                  {app.cat ? (
                    <p className="text-sm">
                      {t("applications.adoptionFee", {
                        fee: formatFee(app.cat.adoption_fee_cents, t("cat.free")),
                      })}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-[#6B5E57]">{app.message}</p>
                </div>
                {app.status === "pending" ? (
                  <button
                    type="button"
                    onClick={() => withdrawMutation.mutate(app.id)}
                    className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-700"
                  >
                    {t("applications.withdraw")}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
