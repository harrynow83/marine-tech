"use client"

import { useMemo } from "react"
import { useStore } from "@/lib/store"
import { TopBar, categoryColor } from "@/components/ui-bits"
import { ChevronRight } from "lucide-react"

export function EquipmentListScreen({
  category,
  subcategory,
  onBack,
  onOpenEquipment,
}: {
  category: string
  subcategory: string
  onBack: () => void
  onOpenEquipment: (id: string) => void
}) {
  const { equipment, recordsForEquipment } = useStore()

  const items = useMemo(
    () =>
      equipment
        .filter((e) => e.category === category && e.subcategory === subcategory)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [equipment, category, subcategory],
  )

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={subcategory} subtitle={category} onBack={onBack} />
      <div className="flex flex-col gap-2 p-4">
        {items.map((e) => {
          const count = recordsForEquipment(e.id).length
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onOpenEquipment(e.id)}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/40"
            >
              <span
                className="mt-1 size-2.5 shrink-0 self-start rounded-full"
                style={{ backgroundColor: categoryColor(category) }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{e.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {e.brand} · {e.type}
                </span>
              </span>
              {count > 0 ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {count} record{count > 1 ? "s" : ""}
                </span>
              ) : null}
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
