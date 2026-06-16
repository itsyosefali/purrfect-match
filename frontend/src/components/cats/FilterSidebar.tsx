"use client";

import type { CatFilters, CatTrait } from "@/types";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  traits: CatTrait[];
  filters: CatFilters;
  breeds: string[];
  onChange: (filters: CatFilters) => void;
}

const quickFilterKeys = [
  { slug: "kitten", key: "filters.traitKitten" },
  { slug: "calm", key: "filters.traitCalm" },
  { slug: "good-with-kids", key: "filters.traitGoodWithKids" },
  { slug: "affectionate", key: "filters.traitAffectionate" },
] as const;

export function FilterSidebar({
  traits,
  filters,
  breeds,
  onChange,
}: FilterSidebarProps) {
  const { t } = useLocale();
  const selectedTraits = filters.traits?.split(",").filter(Boolean) ?? [];

  const toggleTrait = (slug: string) => {
    const next = selectedTraits.includes(slug)
      ? selectedTraits.filter((item) => item !== slug)
      : [...selectedTraits, slug];
    onChange({ ...filters, traits: next.join(",") || undefined, page: 1 });
  };

  const feeLabel = () => {
    if (filters.max_fee_cents === undefined || filters.max_fee_cents >= 50000) {
      return t("filters.anyFee");
    }
    if (filters.max_fee_cents === 0) return t("filters.freeOnly");
    return t("filters.upToFee", { amount: (filters.max_fee_cents / 100).toFixed(0) });
  };

  return (
    <aside className="space-y-6 rounded-2xl bg-white p-5 ring-1 ring-[#E8DFD6]">
      <h3 className="font-semibold">{t("filters.title")}</h3>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B5E57]">
          {t("filters.gender")}
        </h4>
        <div className="flex flex-wrap gap-2">
          {(["", "male", "female"] as const).map((g) => (
            <button
              key={g || "all"}
              type="button"
              onClick={() => onChange({ ...filters, gender: g || undefined, page: 1 })}
              className={cn(
                "rounded-full px-3 py-1 text-sm",
                (filters.gender ?? "") === g
                  ? "bg-[#1C1410] text-white"
                  : "bg-[#F3EBE3] text-[#1C1410]",
              )}
            >
              {g === "" ? t("filters.all") : g === "male" ? t("filters.male") : t("filters.female")}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B5E57]">
          {t("filters.breed")}
        </h4>
        <select
          value={filters.breed ?? ""}
          onChange={(e) =>
            onChange({ ...filters, breed: e.target.value || undefined, page: 1 })
          }
          className="w-full rounded-xl border border-[#E8DFD6] bg-[#FDF8F3] px-3 py-2 text-sm"
        >
          <option value="">{t("filters.allBreeds")}</option>
          {breeds.map((breed) => (
            <option key={breed} value={breed}>
              {breed}
            </option>
          ))}
        </select>
      </section>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B5E57]">
          {t("filters.maxAge")}
        </h4>
        <div className="flex flex-wrap gap-2">
          {[
            { label: t("filters.any"), value: undefined },
            { label: t("filters.kitten"), value: 12 },
            { label: t("filters.senior"), value: 120 },
          ].map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => onChange({ ...filters, max_age_months: value, page: 1 })}
              className={cn(
                "rounded-full px-3 py-1 text-sm",
                filters.max_age_months === value
                  ? "bg-[#1C1410] text-white"
                  : "bg-[#F3EBE3] text-[#1C1410]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B5E57]">
          {t("filters.maxFee")}
        </h4>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={50000}
            step={5000}
            value={filters.max_fee_cents ?? 50000}
            onChange={(e) =>
              onChange({
                ...filters,
                max_fee_cents: Number(e.target.value) >= 50000 ? undefined : Number(e.target.value),
                page: 1,
              })
            }
            className="w-full accent-[#1C1410]"
          />
          <p className="text-sm text-[#6B5E57]">{feeLabel()}</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { label: t("filters.any"), value: undefined },
            { label: t("filters.free"), value: 0 },
            { label: "$150+", value: 15000 },
          ].map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => onChange({ ...filters, max_fee_cents: value, page: 1 })}
              className={cn(
                "rounded-full px-3 py-1 text-sm",
                filters.max_fee_cents === value
                  ? "bg-[#1C1410] text-white"
                  : "bg-[#F3EBE3] text-[#1C1410]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B5E57]">
          {t("filters.personality")}
        </h4>
        <div className="flex flex-wrap gap-2">
          {traits.map((trait) => (
            <button
              key={trait.id}
              type="button"
              onClick={() => toggleTrait(trait.slug)}
              className={cn(
                "rounded-full px-3 py-1 text-sm",
                selectedTraits.includes(trait.slug)
                  ? "bg-[#1C1410] text-white"
                  : "bg-[#F3EBE3] text-[#1C1410]",
              )}
            >
              {trait.name}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

export function QuickFilterChips({
  filters,
  onChange,
}: {
  filters: CatFilters;
  onChange: (filters: CatFilters) => void;
}) {
  const { t } = useLocale();
  const selected = filters.traits?.split(",").filter(Boolean) ?? [];

  return (
    <div className="flex flex-wrap gap-2">
      {quickFilterKeys.map(({ slug, key }) => (
        <button
          key={slug}
          type="button"
          onClick={() => {
            const next = selected.includes(slug)
              ? selected.filter((item) => item !== slug)
              : [...selected, slug];
            onChange({ ...filters, traits: next.join(",") || undefined, page: 1 });
          }}
          className={cn(
            "rounded-full px-3 py-1 text-sm",
            selected.includes(slug)
              ? "bg-[#1C1410] text-white"
              : "bg-white text-[#1C1410] ring-1 ring-[#E8DFD6]",
          )}
        >
          {t(key)}
        </button>
      ))}
    </div>
  );
}
