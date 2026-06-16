"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchListingApplications, updateApplication } from "@/lib/api/applications";
import { fetchMyListings } from "@/lib/api/cats";

export default function ListingApplicationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const catId = Number(params.id);
  const queryClient = useQueryClient();

  const { data: listings = [] } = useQuery({
    queryKey: ["my-listings"],
    queryFn: fetchMyListings,
    enabled: !!user,
  });

  const listing = listings.find((l) => l.id === catId);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["listing-applications", catId],
    queryFn: () => fetchListingApplications(catId),
    enabled: !!user && !!listing,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) =>
      updateApplication(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listing-applications", catId] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
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
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/my-listings" className="text-sm text-[#6B5E57] hover:underline">
        ← Back to My Listings
      </Link>
      <h1 className="text-2xl font-bold">Applications for {listing.name}</h1>
      {isLoading ? (
        <p className="text-[#6B5E57]">Loading…</p>
      ) : applications.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-[#6B5E57] ring-1 ring-[#E8DFD6]">
          No applications yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {applications.map((app) => (
            <li key={app.id} className="rounded-2xl bg-white p-4 ring-1 ring-[#E8DFD6]">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{app.adopter?.name ?? "Adopter"}</p>
                <span className="text-xs capitalize text-[#6B5E57]">{app.status}</span>
              </div>
              <p className="mb-3 text-sm text-[#6B5E57]">{app.message}</p>
              {app.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateMutation.mutate({ id: app.id, status: "approved" })}
                    className="rounded-full bg-emerald-600 px-3 py-1 text-xs text-white"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => updateMutation.mutate({ id: app.id, status: "rejected" })}
                    className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-700"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
