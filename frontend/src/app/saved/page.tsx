"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { CatCard } from "@/components/cats/CatCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { fetchSavedCats, unsaveCat } from "@/lib/api/saved";

export default function SavedPage() {
  const { user, loading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: cats = [], isLoading } = useQuery({
    queryKey: ["saved-cats"],
    queryFn: fetchSavedCats,
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (catId: number) => {
      await unsaveCat(catId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-cats"] }),
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("saved.title")}</h1>
        <p className="text-sm text-[#6B5E57]">
          {t(cats.length === 1 ? "saved.count" : "saved.count_plural", { count: cats.length })}
        </p>
      </div>

      {isLoading ? (
        <p className="text-[#6B5E57]">{t("common.loading")}</p>
      ) : cats.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-[#E8DFD6]">
          <Heart className="mx-auto mb-3 h-8 w-8 text-[#6B5E57]" />
          <p className="mb-2 font-medium">{t("saved.emptyTitle")}</p>
          <p className="mb-4 text-sm text-[#6B5E57]">{t("saved.emptyBody")}</p>
          <Link href="/" className="rounded-full bg-[#1C1410] px-4 py-2 text-sm text-white">
            {t("saved.browseCats")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((cat) => (
            <CatCard
              key={cat.id}
              cat={{ ...cat, is_saved: true }}
              showMessage={false}
              onSave={() => saveMutation.mutate(cat.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
