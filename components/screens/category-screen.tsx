"use client"

import { useMemo } from "react"
import { useStore } from "@/lib/store"
import { TopBar, categoryColor } from "@/components/ui-bits"
import { ChevronRight } from "lucide-react"

export function CategoryScreen({
  category,
  onBack,
  onOpenSubcategory,
}: {
  category: string
  onBack: () => void
  onOpenSubcategory: (subcategory: string) => void
}) {
  const { equipment } = useStore()

  const subcategories = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of equipment) {
      if (e.category === category) map.set(e.subcategory, (map.get(e.subcategory) ?? 0) + 1)
    }
    return [...map.entries()].map(([name, count]) => ({ name, count }))
  }, [equipment, category])

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={category} subtitle="Select a subcategory" onBack={onBack} />
      <div className="flex flex-col gap-2 p-4">
        {subcategories.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => onOpenSubcategory(s.name)}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/40"
          >
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: categoryColor(category) }}
              aria-hidden="true"
            />
            <span className="flex-1 text-sm font-medium text-foreground">{s.name}</span>
            <span className="text-xs text-muted-foreground">{s.count}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  )
}
