"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import { categoryColor } from "@/components/ui-bits"
import { ArrowUpDown, Plus, Search, Anchor } from "lucide-react"
import { Button } from "@/components/ui/button"

type SortKey = "name" | "brand" | "category"

export function HomeScreen({
  onOpenCategory,
  onOpenEquipment,
  onAdd,
}: {
  onOpenCategory: (category: string) => void
  onOpenEquipment: (id: string) => void
  onAdd: () => void
}) {
  const { equipment } = useStore()
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("name")
  const [sortOpen, setSortOpen] = useState(false)

  const categories = useMemo(() => {
    const set = new Map<string, number>()
    for (const e of equipment) set.set(e.category, (set.get(e.category) ?? 0) + 1)
    return [...set.entries()].map(([name, count]) => ({ name, count }))
  }, [equipment])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? equipment.filter((e) =>
          [e.name, e.brand, e.type, e.category, e.subcategory]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : equipment
    return [...list].sort((a, b) => a[sort].localeCompare(b[sort]))
  }, [equipment, query, sort])

  return (
    <div className="flex flex-1 flex-col pb-24">
      <header className="px-4 pb-2 pt-6">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Anchor className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-none tracking-tight text-foreground">
              MarineKit
            </h1>
            <p className="text-xs text-muted-foreground">Equipment diagnostics</p>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-10 bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search equipment, brand, type…"
              className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/30"
              aria-label="Search equipment"
            />
          </div>
          <div className="relative">
            <Button
              variant="outline"
              size="icon-lg"
              className="size-11 rounded-xl"
              aria-label="Sort"
              onClick={() => setSortOpen((o) => !o)}
            >
              <ArrowUpDown className="size-4" />
            </Button>
            {sortOpen ? (
              <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
                {(["name", "brand", "category"] as SortKey[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setSort(k)
                      setSortOpen(false)
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm capitalize hover:bg-muted ${
                      sort === k ? "font-medium text-primary" : "text-foreground"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {!query ? (
        <section className="px-4">
          <h2 className="sr-only">Categories</h2>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => onOpenCategory(c.name)}
                className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: categoryColor(c.name) }}
                  aria-hidden="true"
                />
                {c.name}
                <span className="text-xs text-muted-foreground">{c.count}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-2 px-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {query ? "Results" : "All equipment"}
          </h2>
          <span className="text-xs text-muted-foreground">{filtered.length}</span>
        </div>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No equipment matches “{query}”.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => onOpenEquipment(e.id)}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-ring/60 hover:bg-muted/40"
              >
                <span
                  className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: categoryColor(e.category) }}
                    aria-hidden="true"
                  />
                  {e.brand}
                </span>
                <span className="text-sm font-semibold leading-snug text-foreground text-balance">
                  {e.name}
                </span>
                <span className="mt-auto text-xs text-muted-foreground">{e.subcategory}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={onAdd}
        aria-label="Add equipment"
        className="fixed bottom-6 left-1/2 z-20 flex h-14 -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
      >
        <Plus className="size-5" />
        Add equipment
      </button>
    </div>
  )
}
