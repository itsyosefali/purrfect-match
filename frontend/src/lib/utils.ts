import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFee(cents: number, freeLabel = "Free"): string {
  if (cents === 0) return freeLabel;
  return `$${(cents / 100).toFixed(0)}`;
}
