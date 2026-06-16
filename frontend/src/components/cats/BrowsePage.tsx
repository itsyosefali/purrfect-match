"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { CatCard } from "@/components/cats/CatCard";
import { CatDetailPanel } from "@/components/cats/CatDetailPanel";
import { FilterSidebar, QuickFilterChips } from "@/components/cats/FilterSidebar";
import { MobileFilterDrawer } from "@/components/cats/MobileFilterDrawer";
import { ContactModal } from "@/components/messages/ContactModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchCats, fetchStats } from "@/lib/api/cats";
import { saveCat, unsaveCat } from "@/lib/api/saved";
import { fetchTraits } from "@/lib/api/traits";
import type { CatFilters, CatListing } from "@/types";

export function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const filters: CatFilters = useMemo(
    () => ({
      search: searchParams.get("search") ?? undefined,
      gender: searchParams.get("gender") ?? undefined,
      breed: searchParams.get("breed") ?? undefined,
      max_age_months: searchParams.get("max_age_months")
        ? Number(searchParams.get("max_age_months"))
        : undefined,
      max_fee_cents: searchParams.get("max_fee_cents")
        ? Number(searchParams.get("max_fee_cents"))
        : undefined,
      traits: searchParams.get("traits") ?? undefined,
      sort: searchParams.get("sort") ?? "newest",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    }),
    [searchParams],
  );

  const [selectedCat, setSelectedCat] = useState<CatListing | null>(null);
  const [contactCat, setContactCat] = useState<CatListing | null>(null);
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  const updateFilters = useCallback(
    (next: CatFilters) => {
      const params = new URLSearchParams();
      Object.entries(next).forEach(([key, value]) => {
        if (value !== undefined && value !== "") params.set(key, String(value));
      });
      router.push(`/?${params.toString()}`);
    },
    [router],
  );

  const { data: catsPage, isLoading } = useQuery({
    queryKey: ["cats", filters],
    queryFn: () => fetchCats(filters),
  });

  const { data: traits = [] } = useQuery({
    queryKey: ["traits"],
    queryFn: fetchTraits,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  const breeds = useMemo(
    () => [...new Set((catsPage?.data ?? []).map((c) => c.breed))].sort(),
    [catsPage],
  );

  const saveMutation = useMutation({
    mutationFn: async (cat: CatListing) => {
      if (cat.is_saved) await unsaveCat(cat.id);
      else await saveCat(cat.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cats"] });
      queryClient.invalidateQueries({ queryKey: ["saved-cats"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {stats ? (
            <p className="text-sm text-[#6B5E57]">
              {stats.cats_available} cats available near you
            </p>
          ) : null}
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Find Your
            <br />
            Perfect Match.
          </h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateFilters({ ...filters, search: searchInput || undefined, page: 1 });
            }}
            className="relative max-w-md"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5E57]" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, breed, or city…"
              className="w-full rounded-full border border-[#E8DFD6] bg-white py-2.5 pl-10 pr-4 text-sm"
            />
          </form>
          <QuickFilterChips filters={filters} onChange={updateFilters} />
        </div>
        <div className="hidden lg:block" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="hidden lg:block">
          <FilterSidebar
            traits={traits}
            filters={filters}
            breeds={breeds.length ? breeds : [
              "Brown Tabby", "Domestic Shorthair", "Maine Coon Mix", "British Shorthair",
            ]}
            onChange={updateFilters}
          />
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <MobileFilterDrawer
                traits={traits}
                filters={filters}
                breeds={breeds.length ? breeds : [
                  "Brown Tabby", "Domestic Shorthair", "Maine Coon Mix", "British Shorthair",
                ]}
                onChange={updateFilters}
              />
              <p className="text-sm text-[#6B5E57]">
                Showing {catsPage?.meta.total ?? 0} cats
              </p>
            </div>
            <select
              value={filters.sort ?? "newest"}
              onChange={(e) => updateFilters({ ...filters, sort: e.target.value, page: 1 })}
              className="rounded-full border border-[#E8DFD6] bg-white px-3 py-1.5 text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="featured">Featured</option>
              <option value="rating">Top Rated</option>
              <option value="fee-asc">Fee: Low to High</option>
              <option value="fee-desc">Fee: High to Low</option>
            </select>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : catsPage?.data.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-[#E8DFD6]">
              <p className="mb-2 font-medium">No cats match your filters</p>
              <p className="mb-4 text-sm text-[#6B5E57]">
                Try adjusting your search or clearing filters.
              </p>
              <button
                type="button"
                onClick={() => updateFilters({ sort: "newest", page: 1 })}
                className="rounded-full bg-[#1C1410] px-4 py-2 text-sm text-white"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {catsPage?.data.map((cat) => (
                <CatCard
                  key={cat.id}
                  cat={cat}
                  onSelect={setSelectedCat}
                  onSave={user ? (c) => saveMutation.mutate(c) : undefined}
                  onMessage={user ? setContactCat : () => router.push("/login")}
                />
              ))}
            </div>
          )}

          {catsPage && catsPage.meta.last_page > 1 ? (
            <div className="flex justify-center gap-2">
              {Array.from({ length: catsPage.meta.last_page }).map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => updateFilters({ ...filters, page })}
                    className={`rounded-full px-3 py-1 text-sm ${
                      page === catsPage.meta.current_page
                        ? "bg-[#1C1410] text-white"
                        : "bg-white ring-1 ring-[#E8DFD6]"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 ring-1 ring-[#E8DFD6] md:grid-cols-4">
          {[
            { label: "Verified Owners", value: `${stats.verified_owners.toLocaleString()}+` },
            { label: "Successful Adoptions", value: `${stats.successful_adoptions.toLocaleString()}+` },
            { label: "Identity Verified", value: `${stats.identity_verified_percent}%` },
            { label: "Cities Covered", value: `${stats.cities_covered}+` },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-sm text-[#6B5E57]">{item.label}</p>
            </div>
          ))}
        </div>
      ) : null}

      {selectedCat ? (
        <CatDetailPanel
          cat={selectedCat}
          onClose={() => setSelectedCat(null)}
          onContact={(cat) => {
            setSelectedCat(null);
            setContactCat(cat);
          }}
        />
      ) : null}

      {contactCat ? (
        <ContactModal cat={contactCat} onClose={() => setContactCat(null)} />
      ) : null}
    </div>
  );
}
