"use client";

import Link from "next/link";
import { Heart, MapPin, MessageCircle, Star } from "lucide-react";
import type { CatListing } from "@/types";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn, formatFee } from "@/lib/utils";

interface CatCardProps {
  cat: CatListing;
  onSelect?: (cat: CatListing) => void;
  onSave?: (cat: CatListing) => void;
  onMessage?: (cat: CatListing) => void;
  showMessage?: boolean;
}

export function CatCard({
  cat,
  onSelect,
  onSave,
  onMessage,
  showMessage = true,
}: CatCardProps) {
  const { t } = useLocale();

  const statusColors = {
    available: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-800",
    adopted: "bg-gray-100 text-gray-600",
  };

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E8DFD6] transition hover:shadow-md">
      <div className="relative aspect-[6/7] overflow-hidden bg-[#F3EBE3]">
        <button
          type="button"
          onClick={() => onSelect?.(cat)}
          className="absolute inset-0 z-0 block h-full w-full text-start"
        >
          {cat.primary_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cat.primary_photo_url}
              alt={cat.name}
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#6B5E57]">
              {t("cat.noPhoto")}
            </div>
          )}
        </button>

        <span
          className={cn(
            "pointer-events-none absolute start-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
            statusColors[cat.status],
          )}
        >
          {t(`status.${cat.status}`)}
        </span>

        {cat.is_featured ? (
          <span className="pointer-events-none absolute start-3 top-10 z-10 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-medium text-[#1C1410]">
            {t("cat.featured")}
          </span>
        ) : null}

        {onSave ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSave(cat);
            }}
            className="absolute end-3 top-3 z-20 rounded-full bg-white/90 p-2 shadow"
            aria-label={t("cat.saveCat")}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                cat.is_saved ? "fill-red-500 text-red-500" : "text-[#6B5E57]",
              )}
            />
          </button>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        {cat.owner ? (
          <div className="flex items-center gap-2">
            {cat.owner.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cat.owner.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
            ) : null}
            <span className="text-xs text-[#6B5E57]">{cat.owner.name}</span>
          </div>
        ) : null}

        <div>
          <Link href={`/cats/${cat.slug}`} className="text-lg font-semibold hover:underline">
            {cat.name}
          </Link>
          <p className="text-sm text-[#6B5E57]">{cat.breed}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold">{formatFee(cat.adoption_fee_cents, t("cat.free"))}</p>
            <p className="text-xs text-[#6B5E57]">{t("cat.adoptionFee")}</p>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {cat.rating.toFixed(1)}
            <span className="text-[#6B5E57]">({cat.review_count})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-[#6B5E57]">
          <MapPin className="h-3.5 w-3.5" />
          {cat.location}
        </div>
        <p className="text-sm text-[#6B5E57]">
          {cat.age_label} · {cat.gender === "male" ? t("filters.male") : t("filters.female")}
        </p>

        {cat.traits?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {cat.traits.slice(0, 4).map((trait) => (
              <span
                key={trait.id}
                className="rounded-full bg-[#F3EBE3] px-2 py-0.5 text-xs text-[#1C1410]"
              >
                {trait.name}
              </span>
            ))}
          </div>
        ) : null}

        <p className="text-xs text-[#6B5E57]">
          {t("cat.posted", { time: cat.posted_ago })}
          {cat.rehome_reason ? ` · ${cat.rehome_reason}` : ""}
        </p>

        {showMessage && onMessage ? (
          <button
            type="button"
            onClick={() => onMessage(cat)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E8DFD6] py-2 text-sm font-medium hover:bg-[#FDF8F3]"
          >
            <MessageCircle className="h-4 w-4" />
            {t("cat.messageOwner", { name: cat.owner?.name.split(" ")[0] ?? "" })}
          </button>
        ) : null}
      </div>
    </article>
  );
}
