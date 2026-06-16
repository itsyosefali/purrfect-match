"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flag, MapPin, ShieldCheck, Star } from "lucide-react";
import { ApplyModal } from "@/components/cats/ApplyModal";
import { PhotoGallery } from "@/components/cats/PhotoGallery";
import { ReportModal } from "@/components/cats/ReportModal";
import { ReviewsSection } from "@/components/cats/ReviewsSection";
import { ContactModal } from "@/components/messages/ContactModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchCat } from "@/lib/api/cats";
import { formatFee, genderLabel } from "@/lib/utils";

export default function CatDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const { data: cat, isLoading, error } = useQuery({
    queryKey: ["cat", slug],
    queryFn: () => fetchCat(slug),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 rounded bg-white" />
        <div className="h-96 rounded-2xl bg-white" />
      </div>
    );
  }

  if (error || !cat) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-[#E8DFD6]">
        <p className="mb-2 font-medium">Cat not found</p>
        <p className="mb-4 text-sm text-[#6B5E57]">
          This listing may have been removed or the link is incorrect.
        </p>
        <Link href="/" className="rounded-full bg-[#1C1410] px-4 py-2 text-sm text-white">
          Back to browse
        </Link>
      </div>
    );
  }

  const photos =
    cat.photos?.length
      ? cat.photos
      : cat.primary_photo_url
        ? [{ id: 0, url: cat.primary_photo_url, sort_order: 0 }]
        : [];

  const canReview = !!user && user.id !== cat.owner?.id;

  return (
    <>
      <Link href="/" className="mb-4 inline-block text-sm text-[#6B5E57] hover:text-[#1C1410]">
        ← Back to browse
      </Link>
      <article className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#E8DFD6]">
        <PhotoGallery photos={photos} alt={cat.name} className="md:aspect-[21/9]" />
        <div className="grid gap-8 p-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium capitalize text-emerald-800">
                  {cat.status}
                </span>
                {cat.is_featured ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                    Featured
                  </span>
                ) : null}
              </div>
              <h1 className="mt-2 text-3xl font-bold">{cat.name}</h1>
              <p className="text-[#6B5E57]">
                {cat.breed} · {cat.age_label} · {genderLabel(cat.gender)}
              </p>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {cat.rating.toFixed(1)} ({cat.review_count})
              </div>
            </div>
            {cat.description ? <p className="leading-relaxed">{cat.description}</p> : null}
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
          </div>
          <aside className="space-y-4">
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
                      {cat.owner.response_rate}% response rate
                    </p>
                  </div>
                </div>
              </Link>
            ) : null}
            <div className="text-sm">
              <p className="flex items-center gap-1 text-[#6B5E57]">
                <MapPin className="h-4 w-4" /> {cat.location}
              </p>
              {cat.rehome_reason ? (
                <p className="mt-2">
                  <span className="text-[#6B5E57]">Reason: </span>
                  {cat.rehome_reason}
                </p>
              ) : null}
            </div>
            <div className="rounded-xl bg-[#FDF8F3] p-4">
              <p className="text-2xl font-bold">{formatFee(cat.adoption_fee_cents)}</p>
              <p className="text-sm text-[#6B5E57]">adoption fee</p>
              <div className="mt-4 space-y-2">
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
                  onClick={() => {
                    if (user) setShowContact(true);
                    else router.push("/login");
                  }}
                  className="w-full rounded-full border border-[#E8DFD6] bg-white py-3 text-sm font-medium"
                >
                  Contact Owner
                </button>
                {user && user.id !== cat.owner?.id ? (
                  <button
                    type="button"
                    onClick={() => setShowReport(true)}
                    className="flex w-full items-center justify-center gap-1 text-xs text-[#6B5E57] hover:text-red-600"
                  >
                    <Flag className="h-3 w-3" /> Report listing
                  </button>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </article>
      {showContact ? <ContactModal cat={cat} onClose={() => setShowContact(false)} /> : null}
      {showApply ? <ApplyModal cat={cat} onClose={() => setShowApply(false)} /> : null}
      {showReport ? <ReportModal cat={cat} onClose={() => setShowReport(false)} /> : null}
    </>
  );
}
