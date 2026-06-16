"use client";

import type { CatFilters, CatTrait } from "@/types";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  traits: CatTrait[];
  filters: CatFilters;
  breeds: string[];
  onChange: (filters: CatFilters) => void;
}

const quickFilters = ["kitten", "calm", "good-with-kids", "affectionate"];

export function FilterSidebar({
  traits,
  filters,
  breeds,
  onChange,
}: FilterSidebarProps) {
  const selectedTraits = filters.traits?.split(",").filter(Boolean) ?? [];

  const toggleTrait = (slug: string) => {
    const next = selectedTraits.includes(slug)
      ? selectedTraits.filter((t) => t !== slug)
      : [...selectedTraits, slug];
    onChange({ ...filters, traits: next.join(",") || undefined, page: 1 });
  };

  return (
    <aside className="space-y-6 rounded-2xl bg-white p-5 ring-1 ring-[#E8DFD6]">
      <h3 className="font-semibold">Filters</h3>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B5E57]">
          Gender
        </h4>
        <div className="flex flex-wrap gap-2">
          {["", "male", "female"].map((g) => (
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
              {g === "" ? "All" : g === "male" ? "Male" : "Female"}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B5E57]">
          Breed
        </h4>
        <select
          value={filters.breed ?? ""}
          onChange={(e) =>
            onChange({ ...filters, breed: e.target.value || undefined, page: 1 })
          }
          className="w-full rounded-xl border border-[#E8DFD6] bg-[#FDF8F3] px-3 py-2 text-sm"
        >
          <option value="">All Breeds</option>
          {breeds.map((breed) => (
            <option key={breed} value={breed}>
              {breed}
            </option>
          ))}
        </select>
      </section>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B5E57]">
          Max Age
        </h4>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Any", value: undefined },
            { label: "Kitten", value: 12 },
            { label: "Senior", value: 120 },
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
          Max Fee
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
          <p className="text-sm text-[#6B5E57]">
            {filters.max_fee_cents === undefined || filters.max_fee_cents >= 50000
              ? "Any fee"
              : filters.max_fee_cents === 0
                ? "Free only"
                : `Up to $${(filters.max_fee_cents / 100).toFixed(0)}`}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { label: "Any", value: undefined },
            { label: "Free", value: 0 },
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
          Personality
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
  const selected = filters.traits?.split(",").filter(Boolean) ?? [];

  return (
    <div className="flex flex-wrap gap-2">
      {quickFilters.map((slug) => (
        <button
          key={slug}
          type="button"
          onClick={() => {
            const next = selected.includes(slug)
              ? selected.filter((s) => s !== slug)
              : [...selected, slug];
            onChange({ ...filters, traits: next.join(",") || undefined, page: 1 });
          }}
          className={cn(
            "rounded-full px-3 py-1 text-sm capitalize",
            selected.includes(slug)
              ? "bg-[#1C1410] text-white"
              : "bg-white text-[#1C1410] ring-1 ring-[#E8DFD6]",
          )}
        >
          {slug.replace(/-/g, " ")}
        </button>
      ))}
    </div>
  );
}
