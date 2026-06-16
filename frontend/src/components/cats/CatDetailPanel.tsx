"use client";

import Link from "next/link";
import { useState } from "react";
import { Flag, MapPin, ShieldCheck, Star, X } from "lucide-react";
import { ApplyModal } from "@/components/cats/ApplyModal";
import { PhotoGallery } from "@/components/cats/PhotoGallery";
import { ReportModal } from "@/components/cats/ReportModal";
import { ReviewsSection } from "@/components/cats/ReviewsSection";
import { useAuth } from "@/components/providers/AuthProvider";
import type { CatListing } from "@/types";
import { cn, formatFee, genderLabel } from "@/lib/utils";

interface CatDetailPanelProps {
  cat: CatListing;
  onClose: () => void;
  onContact: (cat: CatListing) => void;
}

export function CatDetailPanel({ cat, onClose, onContact }: CatDetailPanelProps) {
  const { user } = useAuth();
  const [showApply, setShowApply] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const photos =
    cat.photos?.length
      ? cat.photos
      : cat.primary_photo_url
        ? [{ id: 0, url: cat.primary_photo_url, sort_order: 0 }]
        : [];

  const canReview = !!user && user.id !== cat.owner?.id;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
        <button type="button" className="flex-1" onClick={onClose} aria-label="Close" />
        <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E8DFD6] bg-white px-4 py-3">
            <span className="font-medium capitalize">{cat.status}</span>
            <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-[#FDF8F3]">
              <X className="h-5 w-5" />
            </button>
          </div>

          <PhotoGallery photos={photos} alt={cat.name} />

          <div className="space-y-4 p-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{cat.name}</h2>
                {cat.is_featured ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Featured
                  </span>
                ) : null}
              </div>
              <p className="text-[#6B5E57]">
                {cat.breed} · {cat.age_label} · {genderLabel(cat.gender)}
              </p>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {cat.rating.toFixed(1)} ({cat.review_count})
              </div>
            </div>

            {cat.owner ? (
              <Link
                href={`/owners/${cat.owner.id}`}
                className="block rounded-xl bg-[#FDF8F3] p-4 hover:ring-1 hover:ring-[#E8DFD6]"
              >
                <div className="flex items-center gap-3">
                  {cat.owner.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.owner.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : null}
                  <div>
                    <p className="font-medium">
                      {cat.owner.name}
                      {cat.owner.is_verified ? (
                        <ShieldCheck className="ml-1 inline h-4 w-4 text-emerald-600" />
                      ) : null}
                    </p>
                    <p className="text-sm text-[#6B5E57]">
                      {cat.owner.response_rate}% response rate · replies within{" "}
                      {cat.owner.avg_response_minutes} mins
                    </p>
                  </div>
                </div>
              </Link>
            ) : null}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#6B5E57]">Location</p>
                <p className="flex items-center gap-1 font-medium">
                  <MapPin className="h-3.5 w-3.5" />
                  {cat.location.split(",")[0]}
                </p>
              </div>
              <div>
                <p className="text-[#6B5E57]">Listed</p>
                <p className="font-medium">{cat.posted_ago}</p>
              </div>
              {cat.rehome_reason ? (
                <div className="col-span-2">
                  <p className="text-[#6B5E57]">Reason</p>
                  <p className="font-medium">{cat.rehome_reason}</p>
                </div>
              ) : null}
            </div>

            {cat.description ? (
              <p className="text-sm leading-relaxed text-[#1C1410]">{cat.description}</p>
            ) : null}

            {cat.traits?.length ? (
              <div className="flex flex-wrap gap-2">
                {cat.traits.map((trait) => (
                  <span key={trait.id} className="rounded-full bg-[#F3EBE3] px-3 py-1 text-sm">
                    {trait.name}
                  </span>
                ))}
              </div>
            ) : null}

            <ReviewsSection slug={cat.slug} canReview={canReview} />

            <div className="rounded-xl bg-[#FDF8F3] p-4">
              <p className="text-2xl font-bold">{formatFee(cat.adoption_fee_cents)}</p>
              <p className="text-sm text-[#6B5E57]">adoption fee</p>
              <div className="mt-4 flex flex-col gap-2">
                {cat.status === "available" && user && user.id !== cat.owner?.id ? (
                  <button
                    type="button"
                    onClick={() => setShowApply(true)}
                    className="w-full rounded-full bg-[#1C1410] py-3 text-sm font-medium text-white"
                  >
                    Apply to Adopt
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onContact(cat)}
                  className={cn(
                    "w-full rounded-full py-3 text-sm font-medium",
                    cat.status === "available"
                      ? "border border-[#E8DFD6] bg-white text-[#1C1410]"
                      : "bg-[#1C1410] text-white",
                  )}
                >
                  Contact Owner
                </button>
                {user && user.id !== cat.owner?.id ? (
                  <button
                    type="button"
                    onClick={() => setShowReport(true)}
                    className="flex items-center justify-center gap-1 text-xs text-[#6B5E57] hover:text-red-600"
                  >
                    <Flag className="h-3 w-3" /> Report listing
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showApply ? <ApplyModal cat={cat} onClose={() => setShowApply(false)} /> : null}
      {showReport ? <ReportModal cat={cat} onClose={() => setShowReport(false)} /> : null}
    </>
  );
}
