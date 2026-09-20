import { cn } from "@/lib/cn";

/**
 * Theme-aware shimmer placeholder used by route `loading.tsx` files.
 * Callers provide the size and shape; the shared `.skeleton` class supplies
 * the muted surface and sweeping sheen.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden="true" />;
}
