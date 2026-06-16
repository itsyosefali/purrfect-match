"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import type { CatListing } from "@/types";
import { useLocale } from "@/components/providers/LocaleProvider";
import { startConversation } from "@/lib/api/messages";
import { getApiErrorMessage } from "@/lib/api/client";

interface ContactModalProps {
  cat: CatListing;
  onClose: () => void;
}

export function ContactModal({ cat, onClose }: ContactModalProps) {
  const router = useRouter();
  const { t } = useLocale();
  const ownerFirstName = cat.owner?.name.split(" ")[0] ?? "";

  const defaultMessage = useMemo(
    () => t("contact.defaultMessage", { owner: ownerFirstName, cat: cat.name }),
    [t, ownerFirstName, cat.name],
  );

  const [message, setMessage] = useState(defaultMessage);
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
              {t("contact.repliesWithin", {
                minutes: cat.owner?.avg_response_minutes ?? 60,
              })}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-[#FDF8F3]" aria-label={t("common.close")}>
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
          {t("contact.yourMessage")}
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
          {mutation.isPending ? t("messages.sending") : t("contact.sendMessage")}
        </button>
      </div>
    </div>
  );
}
