"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { createReview, fetchReviews } from "@/lib/api/reviews";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface ReviewsSectionProps {
  slug: string;
  canReview?: boolean;
}

export function ReviewsSection({ slug, canReview }: ReviewsSectionProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", slug],
    queryFn: () => fetchReviews(slug),
  });

  const mutation = useMutation({
    mutationFn: () => createReview(slug, { rating, body: body || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", slug] });
      queryClient.invalidateQueries({ queryKey: ["cat", slug] });
      setBody("");
      setError(null);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return (
    <section className="space-y-4">
      <h3 className="font-semibold">Reviews</h3>
      {canReview ? (
        <div className="rounded-xl bg-[#FDF8F3] p-4">
          <p className="mb-2 text-sm font-medium">Leave a review</p>
          <div className="mb-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)}>
                <Star
                  className={cn(
                    "h-5 w-5",
                    n <= rating ? "fill-amber-400 text-amber-400" : "text-[#E8DFD6]",
                  )}
                />
              </button>
            ))}
          </div>
          <textarea
            rows={2}
            placeholder="Share your experience…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mb-2 w-full rounded-xl border border-[#E8DFD6] px-3 py-2 text-sm"
          />
          {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="rounded-full bg-[#1C1410] px-4 py-1.5 text-sm text-white disabled:opacity-50"
          >
            Submit Review
          </button>
        </div>
      ) : null}
      {isLoading ? (
        <p className="text-sm text-[#6B5E57]">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-[#6B5E57]">No reviews yet.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-xl border border-[#E8DFD6] p-3 text-sm">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium">{review.user?.name ?? "User"}</span>
                <span className="flex items-center gap-0.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {review.rating}
                </span>
              </div>
              {review.body ? <p className="text-[#6B5E57]">{review.body}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
