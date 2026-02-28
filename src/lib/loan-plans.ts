export const ITEMS_PER_PAGE = 9

/* ── Tier Classification ──────────────────────────────────── */
export type Tier = {
  label: string
  color: string
  bg: string
  border: string
  accent: string
}

export function getTier(maxAmount: number): Tier {
  if (maxAmount <= 1)
    return { label: "Starter", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", accent: "bg-blue-500" }
  if (maxAmount <= 5)
    return { label: "Growth", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", accent: "bg-purple-500" }
  return { label: "Premium", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", accent: "bg-amber-500" }
}

/* ── Filter Types ─────────────────────────────────────────── */
export type StatusFilter = "all" | "active" | "inactive"

export type ToastState = { type: "success" | "error"; message: string } | null

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "amount-desc", label: "Max Amount ↓" },
  { value: "amount-asc", label: "Min Amount ↑" },
  { value: "rate-desc", label: "Rate ↓" },
  { value: "rate-asc", label: "Rate ↑" },
  { value: "name", label: "A → Z" },
] as const
