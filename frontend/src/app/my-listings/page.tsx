"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { CatCard } from "@/components/cats/CatCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { deleteListing, fetchMyListings, updateListingStatus } from "@/lib/api/cats";

export default function MyListingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["my-listings"],
    queryFn: fetchMyListings,
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-listings"] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateListingStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-listings"] }),
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Link
          href="/list"
          className="flex items-center gap-2 rounded-full bg-[#1C1410] px-4 py-2 text-sm text-white"
        >
          <Plus className="h-4 w-4" /> Add Listing
        </Link>
      </div>

      {isLoading ? (
        <p className="text-[#6B5E57]">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-[#E8DFD6]">
          <p className="mb-2 font-medium">No listings yet</p>
          <p className="mb-4 text-sm text-[#6B5E57]">Start by listing a cat for adoption.</p>
          <Link href="/list" className="rounded-full bg-[#1C1410] px-4 py-2 text-sm text-white">
            List a Cat
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((cat) => (
            <div key={cat.id} className="relative space-y-2">
              <CatCard cat={cat} showMessage={false} />
              <div className="flex flex-wrap gap-2 px-1">
                <Link
                  href={`/my-listings/${cat.id}/edit`}
                  className="rounded-full bg-white px-3 py-1 text-xs ring-1 ring-[#E8DFD6]"
                >
                  Edit
                </Link>
                <Link
                  href={`/my-listings/${cat.id}/applications`}
                  className="rounded-full bg-white px-3 py-1 text-xs ring-1 ring-[#E8DFD6]"
                >
                  Applications
                </Link>
                <select
                  value={cat.status}
                  onChange={(e) =>
                    statusMutation.mutate({ id: cat.id, status: e.target.value })
                  }
                  className="rounded-full border border-[#E8DFD6] bg-white px-2 py-1 text-xs"
                >
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="adopted">Adopted</option>
                </select>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(cat.id)}
                  className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
