"use client"

import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"

export function TopBar({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
  right?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/90 px-3 py-3 backdrop-blur">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </button>
      ) : (
        <div className="size-9 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold leading-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {right}
    </header>
  )
}

export function CategoryDot({ category, className }: { category: string; className?: string }) {
  return (
    <span
      className={cn("inline-block size-2 rounded-full", className)}
      style={{ backgroundColor: categoryColor(category) }}
      aria-hidden="true"
    />
  )
}

const CATEGORY_COLORS: Record<string, string> = {
  "Inverters & Chargers": "var(--chart-1)",
  Generators: "var(--chart-4)",
  "Hydraulic & Stabilizers": "var(--chart-2)",
  "HVAC & Climate": "var(--chart-3)",
  "Battery Banks": "var(--chart-5)",
  "Electrical Distribution": "var(--primary)",
}

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "var(--muted-foreground)"
}
