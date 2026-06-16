"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Star } from "lucide-react";
import { CatCard } from "@/components/cats/CatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLocale } from "@/components/providers/LocaleProvider";
import { fetchPublicUser } from "@/lib/api/profile";

export default function OwnerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useLocale();
  const userId = Number(id);

  const { data: owner, isLoading, error } = useQuery({
    queryKey: ["owner", userId],
    queryFn: () => fetchPublicUser(userId),
    enabled: !Number.isNaN(userId),
  });

  if (isLoading) {
    return <p className="text-[#6B5E57]">{t("owner.loading")}</p>;
  }

  if (error || !owner) {
    return (
      <EmptyState
        title={t("owner.notFound")}
        description={t("owner.notFoundBody")}
        action={
          <Link href="/" className="rounded-full bg-[#1C1410] px-4 py-2 text-sm text-white">
            {t("owner.browseCats")}
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-[#E8DFD6] sm:flex-row sm:items-center">
        {owner.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={owner.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F3EBE3] text-2xl font-bold">
            {owner.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">
            {owner.name}
            {owner.is_verified ? (
              <ShieldCheck className="ms-2 inline h-5 w-5 text-emerald-600" />
            ) : null}
          </h1>
          {owner.city ? <p className="text-[#6B5E57]">{owner.city}</p> : null}
          <div className="mt-1 flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {owner.rating.toFixed(1)} ({owner.review_count} {t("owner.reviews")})
          </div>
          <p className="mt-1 text-sm text-[#6B5E57]">
            {t("detail.responseRate", {
              rate: owner.response_rate,
              minutes: owner.avg_response_minutes,
            })}
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          {t("owner.listings")} ({owner.listings?.length ?? 0})
        </h2>
        {owner.listings?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {owner.listings.map((cat) => (
              <CatCard key={cat.id} cat={cat} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t("listings.emptyTitle")}
            description={t("listings.emptyBody")}
          />
        )}
      </section>
    </div>
  );
}
