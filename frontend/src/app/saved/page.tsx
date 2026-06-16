"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { CatCard } from "@/components/cats/CatCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchSavedCats, unsaveCat } from "@/lib/api/saved";

export default function SavedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: cats = [], isLoading } = useQuery({
    queryKey: ["saved-cats"],
    queryFn: fetchSavedCats,
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (catId: number) => {
      await unsaveCat(catId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-cats"] }),
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Saved Cats</h1>
        <p className="text-sm text-[#6B5E57]">
          {cats.length} cat{cats.length !== 1 ? "s" : ""} in your wishlist
        </p>
      </div>

      {isLoading ? (
        <p className="text-[#6B5E57]">Loading…</p>
      ) : cats.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-[#E8DFD6]">
          <Heart className="mx-auto mb-3 h-8 w-8 text-[#6B5E57]" />
          <p className="mb-2 font-medium">No saved cats yet</p>
          <p className="mb-4 text-sm text-[#6B5E57]">Heart a listing to save it here.</p>
          <Link href="/" className="rounded-full bg-[#1C1410] px-4 py-2 text-sm text-white">
            Browse cats
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((cat) => (
            <CatCard
              key={cat.id}
              cat={{ ...cat, is_saved: true }}
              showMessage={false}
              onSave={() => saveMutation.mutate(cat.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
