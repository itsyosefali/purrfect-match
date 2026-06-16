"use client";

import { Suspense } from "react";
import { BrowsePage } from "@/components/cats/BrowsePage";

export default function Home() {
  return (
    <Suspense fallback={<div className="animate-pulse text-[#6B5E57]">Loading cats…</div>}>
      <BrowsePage />
    </Suspense>
  );
}
