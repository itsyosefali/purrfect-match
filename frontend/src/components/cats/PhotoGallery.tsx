"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CatPhoto } from "@/types";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  photos: CatPhoto[];
  alt: string;
  className?: string;
}

export function PhotoGallery({ photos, alt, className }: PhotoGalleryProps) {
  const [index, setIndex] = useState(0);
  const items = photos.length ? photos : [];

  if (!items.length) {
    return (
      <div className={cn("flex aspect-[4/3] items-center justify-center bg-[#F3EBE3] text-[#6B5E57]", className)}>
        No photo
      </div>
    );
  }

  const current = items[index];

  return (
    <div className={cn("relative overflow-hidden bg-[#F3EBE3]", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={current.url} alt={alt} className="aspect-[4/3] h-full w-full object-cover" />
      {items.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => (i === 0 ? items.length - 1 : i - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i === items.length - 1 ? 0 : i + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
            aria-label="Next photo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {items.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 w-2 rounded-full",
                  i === index ? "bg-white" : "bg-white/50",
                )}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
            {index + 1} / {items.length}
          </div>
        </>
      ) : null}
    </div>
  );
}
