"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import type { CatListing } from "@/types";
import { applyToAdopt } from "@/lib/api/applications";
import { getApiErrorMessage } from "@/lib/api/client";

interface ApplyModalProps {
  cat: CatListing;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApplyModal({ cat, onClose, onSuccess }: ApplyModalProps) {
  const [message, setMessage] = useState(
    `Hi! I'm interested in adopting ${cat.name}. I'd love to learn more about them.`,
  );
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => applyToAdopt(cat.id, message),
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Apply to Adopt {cat.name}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-[#FDF8F3]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-3 text-sm text-[#6B5E57]">
          Tell the owner why you&apos;d be a great match.
        </p>
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-[#E8DFD6] px-3 py-2 text-sm"
        />
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm ring-1 ring-[#E8DFD6]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={mutation.isPending || !message.trim()}
            onClick={() => mutation.mutate()}
            className="rounded-full bg-[#1C1410] px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {mutation.isPending ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
