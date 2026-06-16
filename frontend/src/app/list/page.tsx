"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { createCatListing } from "@/lib/api/cats";
import { fetchTraits } from "@/lib/api/traits";
import { getApiErrorMessage } from "@/lib/api/client";

type FormState = {
  name: string;
  breed: string;
  age_months: string;
  gender: "male" | "female";
  location: string;
  description: string;
  rehome_reason: string;
  adoption_fee_cents: string;
  trait_ids: number[];
  photos: File[];
};

const initial: FormState = {
  name: "",
  breed: "",
  age_months: "",
  gender: "female",
  location: "",
  description: "",
  rehome_reason: "",
  adoption_fee_cents: "0",
  trait_ids: [],
  photos: [],
};

export default function ListCatPage() {
  const { user, loading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);

  const { data: traits = [] } = useQuery({
    queryKey: ["traits"],
    queryFn: fetchTraits,
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("breed", form.breed);
      fd.append("age_months", form.age_months);
      fd.append("gender", form.gender);
      fd.append("location", form.location);
      fd.append("description", form.description);
      fd.append("rehome_reason", form.rehome_reason);
      fd.append("adoption_fee_cents", String(Number(form.adoption_fee_cents) * 100));
      form.trait_ids.forEach((id) => fd.append("trait_ids[]", String(id)));
      form.photos.forEach((photo) => fd.append("photos[]", photo));
      return createCatListing(fd);
    },
    onSuccess: () => router.push("/my-listings"),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("listings.listTitle")}</h1>
        <p className="text-sm text-[#6B5E57]">{t("listings.listSubtitle")}</p>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${step >= s ? "bg-[#1C1410]" : "bg-[#E8DFD6]"}`}
          />
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E8DFD6]">
        {step === 1 ? (
          <div className="space-y-4">
            <label className="block text-sm">
              {t("listings.uploadPhotos")}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  setForm({ ...form, photos: Array.from(e.target.files ?? []).slice(0, 6) })
                }
                className="mt-1 block w-full text-sm"
              />
            </label>
            {[
              ["name", t("listings.catName"), t("listings.catNamePlaceholder")],
              ["breed", t("listings.breed"), t("listings.breedPlaceholder")],
              ["age_months", t("listings.ageMonths"), t("listings.agePlaceholder")],
              ["location", t("listings.yourLocation"), t("listings.locationPlaceholder")],
            ].map(([key, label, placeholder]) => (
              <label key={key} className="block text-sm">
                {label}
                <input
                  required
                  value={form[key as keyof FormState] as string}
                  placeholder={placeholder}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
                />
              </label>
            ))}
            <div>
              <p className="mb-2 text-sm">{t("listings.gender")}</p>
              <div className="flex gap-2">
                {(["female", "male"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`rounded-full px-4 py-1.5 text-sm ${
                      form.gender === g ? "bg-[#1C1410] text-white" : "bg-[#F3EBE3]"
                    }`}
                  >
                    {g === "male" ? t("filters.male") : t("filters.female")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <label className="block text-sm">
              {t("listings.rehomeReason")}
              <input
                required
                value={form.rehome_reason}
                placeholder={t("listings.rehomePlaceholder")}
                onChange={(e) => setForm({ ...form, rehome_reason: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              {t("listings.aboutCat")}
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t("listings.aboutPlaceholder")}
                className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
              />
            </label>
            <div>
              <p className="mb-2 text-sm">{t("listings.traits")}</p>
              <div className="flex flex-wrap gap-2">
                {traits.map((trait) => (
                  <button
                    key={trait.id}
                    type="button"
                    onClick={() => {
                      const ids = form.trait_ids.includes(trait.id)
                        ? form.trait_ids.filter((id) => id !== trait.id)
                        : [...form.trait_ids, trait.id];
                      setForm({ ...form, trait_ids: ids });
                    }}
                    className={`rounded-full px-3 py-1 text-sm ${
                      form.trait_ids.includes(trait.id)
                        ? "bg-[#1C1410] text-white"
                        : "bg-[#F3EBE3]"
                    }`}
                  >
                    {trait.name}
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-sm">
              {t("listings.adoptionFeeUsd")}
              <input
                type="number"
                min={0}
                value={form.adoption_fee_cents}
                onChange={(e) => setForm({ ...form, adoption_fee_cents: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
              />
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <h2 className="font-semibold">{t("listings.previewTitle")}</h2>
            <div className="rounded-xl bg-[#FDF8F3] p-4 text-sm">
              <p className="font-medium">{form.name || "—"}</p>
              <p className="text-[#6B5E57]">
                {form.breed} · {form.location}
              </p>
              <p className="mt-2">{form.description || t("listings.noDescription")}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
              <p className="font-medium">{t("listings.safetyTitle")}</p>
              <p className="text-[#6B5E57]">{t("listings.safetyBody")}</p>
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-full px-4 py-2 text-sm ring-1 ring-[#E8DFD6]"
            >
              {t("listings.back")}
            </button>
          ) : (
            <Link href="/" className="text-sm text-[#6B5E57] underline">
              {t("common.cancel")}
            </Link>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-full bg-[#1C1410] px-6 py-2 text-sm text-white"
            >
              {t("listings.next")}
            </button>
          ) : (
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
              className="rounded-full bg-[#1C1410] px-6 py-2 text-sm text-white disabled:opacity-50"
            >
              {mutation.isPending ? t("listings.submitting") : t("listings.submitListing")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
