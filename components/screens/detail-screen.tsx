"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import type { Equipment } from "@/lib/types"
import { TopBar, categoryColor } from "@/components/ui-bits"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ClipboardList,
  FolderClosed,
  Pencil,
  Play,
} from "lucide-react"

export function DetailScreen({
  equipment,
  onBack,
  onStart,
  onEdit,
}: {
  equipment?: Equipment
  onBack: () => void
  onStart: () => void
  onEdit: () => void
}) {
  const { recordsForEquipment } = useStore()
  const [tab, setTab] = useState<"checklist" | "records">("checklist")

  if (!equipment) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Not found" onBack={onBack} />
        <p className="p-6 text-sm text-muted-foreground">This equipment no longer exists.</p>
      </div>
    )
  }

  const records = recordsForEquipment(equipment.id)

  return (
    <div className="flex flex-1 flex-col pb-28">
      <TopBar
        title={equipment.name}
        subtitle={`${equipment.brand} · ${equipment.type}`}
        onBack={onBack}
        right={
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit equipment"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <Pencil className="size-[18px]" />
          </button>
        }
      />

      <div className="px-4 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: categoryColor(equipment.category) }}
              aria-hidden="true"
            />
            {equipment.category}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {equipment.subcategory}
          </span>
        </div>
      </div>

      <div className="sticky top-[57px] z-10 mt-4 flex gap-1 border-b border-border bg-background/90 px-4 backdrop-blur">
        <TabButton active={tab === "checklist"} onClick={() => setTab("checklist")} icon={<ClipboardList className="size-4" />}>
          Checklist
        </TabButton>
        <TabButton active={tab === "records"} onClick={() => setTab("records")} icon={<FolderClosed className="size-4" />}>
          Records {records.length > 0 ? `(${records.length})` : ""}
        </TabButton>
      </div>

      <div className="p-4">
        {tab === "checklist" ? (
          <>
            <ol className="flex flex-col gap-2">
              {equipment.checklist.map((step, i) => (
                <li
                  key={step.id}
                  className="flex gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-snug text-foreground">{step.text}</span>
                </li>
              ))}
            </ol>
            <Button
              variant="outline"
              onClick={onEdit}
              className="mt-3 h-10 w-full rounded-xl"
            >
              <Pencil className="size-4" />
              Edit diagnostic steps
            </Button>
          </>
        ) : (
          <RecordsList equipmentId={equipment.id} />
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-border bg-background/95 p-4 backdrop-blur">
        <Button onClick={onStart} className="h-12 w-full rounded-xl text-base">
          <Play className="size-5" />
          Start diagnostic
        </Button>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

function RecordsList({ equipmentId }: { equipmentId: string }) {
  const { recordsForEquipment } = useStore()
  const records = recordsForEquipment(equipmentId)
  const [open, setOpen] = useState<string | null>(null)

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <FolderClosed className="size-8 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">No diagnostics recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {records.map((r) => {
        const expanded = open === r.id
        const ok = r.outcome === "ok"
        return (
          <div key={r.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : r.id)}
              className="flex w-full items-center gap-3 p-3 text-left"
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                  ok ? "bg-success/15 text-success" : "bg-warning/20 text-warning"
                }`}
              >
                {ok ? <CheckCircle2 className="size-5" /> : <AlertTriangle className="size-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  {ok ? "System OK" : "Escalate"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {r.technician} · {formatDate(r.date)}
                </span>
              </span>
              <ChevronDown
                className={`size-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
            {expanded ? (
              <div className="border-t border-border px-3 pb-3 pt-2">
                <ol className="flex flex-col gap-2">
                  {r.answers.map((a, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span
                        className={`mt-0.5 inline-flex h-5 shrink-0 items-center rounded px-1.5 text-[11px] font-semibold uppercase ${
                          a.answer === "yes"
                            ? "bg-success/15 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {a.answer}
                      </span>
                      <span className="text-foreground">
                        {a.question}
                        {a.note ? (
                          <span className="mt-0.5 block text-xs italic text-muted-foreground">
                            “{a.note}”
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ol>
                {r.finalNote ? (
                  <p className="mt-3 rounded-lg bg-muted p-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Final note: </span>
                    {r.finalNote}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
