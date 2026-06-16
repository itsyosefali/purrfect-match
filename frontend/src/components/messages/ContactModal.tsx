"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import type { CatListing } from "@/types";
import { startConversation } from "@/lib/api/messages";
import { getApiErrorMessage } from "@/lib/api/client";

interface ContactModalProps {
  cat: CatListing;
  onClose: () => void;
}

export function ContactModal({ cat, onClose }: ContactModalProps) {
  const router = useRouter();
  const [message, setMessage] = useState(
    `Hi ${cat.owner?.name.split(" ")[0]}! I am interested in adopting ${cat.name}. Could we chat more about the process?`,
  );
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => startConversation(cat.id, message),
    onSuccess: (conversation) => {
      onClose();
      router.push(`/messages?conversation=${conversation.id}`);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-semibold">{cat.owner?.name}</p>
            <p className="text-sm text-[#6B5E57]">
              Replies within {cat.owner?.avg_response_minutes} mins
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-[#FDF8F3]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-xl bg-[#FDF8F3] p-3 text-sm">
          <p className="font-medium">{cat.name}</p>
          <p className="text-[#6B5E57]">
            {cat.breed} · {cat.location}
          </p>
        </div>

        <label className="mb-4 block text-sm font-medium">
          Your Message
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-[#E8DFD6] p-3 text-sm"
          />
        </label>

        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          disabled={mutation.isPending || !message.trim()}
          onClick={() => mutation.mutate()}
          className="w-full rounded-full bg-[#1C1410] py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {mutation.isPending ? "Sending…" : "Send Message"}
        </button>
      </div>
    </div>
  );
}
