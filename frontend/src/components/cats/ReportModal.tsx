"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import type { CatListing } from "@/types";
import { reportListing } from "@/lib/api/reports";
import { getApiErrorMessage } from "@/lib/api/client";

const reasons = [
  { value: "spam", label: "Spam" },
  { value: "scam", label: "Scam or fraud" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "misleading", label: "Misleading information" },
  { value: "other", label: "Other" },
];

interface ReportModalProps {
  cat: CatListing;
  onClose: () => void;
}

export function ReportModal({ cat, onClose }: ReportModalProps) {
  const [reason, setReason] = useState("misleading");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () => reportListing(cat.id, { reason, body: body || undefined }),
    onSuccess: () => setDone(true),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Report Listing</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-[#FDF8F3]">
            <X className="h-5 w-5" />
          </button>
        </div>
        {done ? (
          <p className="text-sm text-[#6B5E57]">
            Thank you. Our team will review your report shortly.
          </p>
        ) : (
          <>
            <label className="mb-3 block text-sm">
              Reason
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
              >
                {reasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Details (optional)
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#E8DFD6] px-3 py-2"
              />
            </label>
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
                disabled={mutation.isPending}
                onClick={() => mutation.mutate()}
                className="rounded-full bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                Submit Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
