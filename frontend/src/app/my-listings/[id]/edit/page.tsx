"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchMyListings, updateListing } from "@/lib/api/cats";
import { fetchTraits } from "@/lib/api/traits";
import { getApiErrorMessage } from "@/lib/api/client";

export default function EditListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const listingId = Number(params.id);

  const { data: listings = [] } = useQuery({
    queryKey: ["my-listings"],
    queryFn: fetchMyListings,
    enabled: !!user,
  });

  const listing = useMemo(
    () => listings.find((l) => l.id === listingId),
    [listings, listingId],
  );

  const { data: traits = [] } = useQuery({
    queryKey: ["traits"],
    queryFn: fetchTraits,
    enabled: !!user,
  });

  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [ageMonths, setAgeMonths] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [rehomeReason, setRehomeReason] = useState("");
  const [fee, setFee] = useState("0");
  const [traitIds, setTraitIds] = useState<number[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [deletePhotoIds, setDeletePhotoIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (listing && !initialized) {
      setName(listing.name);
      setBreed(listing.breed);
      setAgeMonths(String(listing.age_months));
      setGender(listing.gender as "male" | "female");
      setLocation(listing.location);
      setDescription(listing.description ?? "");
      setRehomeReason(listing.rehome_reason ?? "");
      setFee(String(listing.adoption_fee_cents / 100));
      setTraitIds(listing.traits?.map((t) => t.id) ?? []);
      setInitialized(true);
    }
  }, [listing, initialized]);

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("breed", breed);
      fd.append("age_months", ageMonths);
      fd.append("gender", gender);
      fd.append("location", location);
      fd.append("description", description);
      fd.append("rehome_reason", rehomeReason);
      fd.append("adoption_fee_cents", String(Number(fee) * 100));
      traitIds.forEach((id) => fd.append("trait_ids[]", String(id)));
      deletePhotoIds.forEach((id) => fd.append("delete_photo_ids[]", String(id)));
      newPhotos.forEach((photo) => fd.append("photos[]", photo));
      return updateListing(listingId, fd);
    },
    onSuccess: () => router.push("/my-listings"),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  if (!listing) {
    return (
      <div className="text-center">
        <p className="mb-4">Listing not found.</p>
        <Link href="/my-listings" className="text-sm underline">
          Back to My Listings
        </Link>
      </div>
    );
  }

  const remainingPhotos =
    listing.photos?.filter((p) => !deletePhotoIds.includes(p.id)) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/my-listings" className="text-sm text-[#6B5E57] hover:underline">
          ← Back to My Listings
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Edit {listing.name}</h1>
      </div>

      <div className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-[#E8DFD6]">
        {remainingPhotos.length ? (
          <div>
            <p className="mb-2 text-sm font-medium">Current photos</p>
            <div className="flex flex-wrap gap-2">
              {remainingPhotos.map((photo) => (
                <div key={photo.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  {photo.id > 0 ? (
                    <button
                      type="button"
                      onClick={() => setDeletePhotoIds((ids) => [...ids, photo.id])}
                      className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <label className="block text-sm">
          Add photos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setNewPhotos(Array.from(e.target.files ?? []).slice(0, 6))}
            className="mt-1 block w-full text-sm"
          />
        </label>
        {[
          ["name", name, setName, "Name"],
          ["breed", breed, setBreed, "Breed"],
          ["age", ageMonths, setAgeMonths, "Age (months)"],
          ["location", location, setLocation, "Location"],
        ].map(([key, val, setter, label]) => (
          <label key={key as string} className="block text-sm">
            {label as string}
            <input
              value={val as string}
              onChange={(e) => (setter as (v: string) => void)(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
            />
          </label>
        ))}
        <div>
          <p className="mb-2 text-sm">Gender</p>
          <div className="flex gap-2">
            {(["female", "male"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`rounded-full px-4 py-1.5 text-sm capitalize ${
                  gender === g ? "bg-[#1C1410] text-white" : "bg-[#F3EBE3]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <label className="block text-sm">
          Reason for rehoming
          <input
            value={rehomeReason}
            onChange={(e) => setRehomeReason(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Description
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        <div>
          <p className="mb-2 text-sm">Traits</p>
          <div className="flex flex-wrap gap-2">
            {traits.map((trait) => (
              <button
                key={trait.id}
                type="button"
                onClick={() =>
                  setTraitIds((ids) =>
                    ids.includes(trait.id)
                      ? ids.filter((id) => id !== trait.id)
                      : [...ids, trait.id],
                  )
                }
                className={`rounded-full px-3 py-1 text-sm ${
                  traitIds.includes(trait.id) ? "bg-[#1C1410] text-white" : "bg-[#F3EBE3]"
                }`}
              >
                {trait.name}
              </button>
            ))}
          </div>
        </div>
        <label className="block text-sm">
          Adoption fee (USD)
          <input
            type="number"
            min={0}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
          className="rounded-full bg-[#1C1410] px-6 py-2 text-sm text-white disabled:opacity-50"
        >
          {mutation.isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
