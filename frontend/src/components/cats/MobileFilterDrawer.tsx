"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { FilterSidebar } from "@/components/cats/FilterSidebar";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { CatFilters, CatTrait } from "@/types";

interface MobileFilterDrawerProps {
  traits: CatTrait[];
  filters: CatFilters;
  breeds: string[];
  onChange: (filters: CatFilters) => void;
}

export function MobileFilterDrawer({
  traits,
  filters,
  breeds,
  onChange,
}: MobileFilterDrawerProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-[#E8DFD6] lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t("filters.title")}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label={t("filters.closeFilters")}
          />
          <div className="absolute bottom-0 start-0 end-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">{t("filters.title")}</h3>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar
              traits={traits}
              filters={filters}
              breeds={breeds}
              onChange={(next) => {
                onChange(next);
              }}
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-full bg-[#1C1410] py-3 text-sm text-white"
            >
              {t("filters.showResults")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
