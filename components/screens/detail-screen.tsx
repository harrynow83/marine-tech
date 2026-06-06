"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import type { Equipment, ErrorCode } from "@/lib/types"
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
  Plus,
  Save,
  Trash2,
  TriangleAlert,
  X,
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
  const [tab, setTab] = useState<"checklist" | "errors" | "records">("checklist")

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

      <div className="sticky top-[57px] z-10 mt-4 flex gap-1 overflow-x-auto border-b border-border bg-background/90 px-4 backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TabButton active={tab === "checklist"} onClick={() => setTab("checklist")} icon={<ClipboardList className="size-4" />}>
          Checklist
        </TabButton>
        <TabButton active={tab === "errors"} onClick={() => setTab("errors")} icon={<TriangleAlert className="size-4" />}>
          Error codes {equipment.errorCodes && equipment.errorCodes.length > 0 ? `(${equipment.errorCodes.length})` : ""}
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
        ) : tab === "errors" ? (
          <ErrorCodesPanel equipment={equipment} />
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
      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
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

let ecCounter = 0
function newErrorCodeId() {
  ecCounter += 1
  return `ec-${Date.now()}-${ecCounter}`
}

function ErrorCodesPanel({ equipment }: { equipment: Equipment }) {
  const { updateEquipment } = useStore()
  const codes = equipment.errorCodes ?? []
  const [editing, setEditing] = useState<ErrorCode | null>(null)
  const [showForm, setShowForm] = useState(false)

  function persist(next: ErrorCode[]) {
    updateEquipment({ ...equipment, errorCodes: next })
  }

  function handleSave(entry: ErrorCode) {
    const exists = codes.some((c) => c.id === entry.id)
    persist(exists ? codes.map((c) => (c.id === entry.id ? entry : c)) : [...codes, entry])
    setShowForm(false)
    setEditing(null)
  }

  function handleDelete(id: string) {
    persist(codes.filter((c) => c.id !== id))
  }

  if (showForm) {
    return (
      <ErrorCodeForm
        initial={editing}
        onCancel={() => {
          setShowForm(false)
          setEditing(null)
        }}
        onSave={handleSave}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {codes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <TriangleAlert className="size-8 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">
            No error codes recorded for this equipment yet.
          </p>
          <p className="max-w-[16rem] text-xs text-muted-foreground/80">
            Add fault codes with explanations, or any other repair help and notes.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {codes.map((c) => (
            <li key={c.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex shrink-0 items-center rounded-md bg-warning/20 px-2 py-1 text-xs font-semibold text-warning">
                  {c.code}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-foreground">{c.explanation}</p>
                  {c.note ? (
                    <p className="mt-1.5 rounded-lg bg-muted p-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Note: </span>
                      {c.note}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(c)
                      setShowForm(true)
                    }}
                    aria-label={`Edit ${c.code}`}
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    aria-label={`Delete ${c.code}`}
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="outline"
        onClick={() => {
          setEditing(null)
          setShowForm(true)
        }}
        className="h-10 w-full rounded-xl"
      >
        <Plus className="size-4" />
        Add error code or repair help
      </Button>
    </div>
  )
}

function ErrorCodeForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: ErrorCode | null
  onCancel: () => void
  onSave: (entry: ErrorCode) => void
}) {
  const [code, setCode] = useState(initial?.code ?? "")
  const [explanation, setExplanation] = useState(initial?.explanation ?? "")
  const [note, setNote] = useState(initial?.note ?? "")

  const canSave = code.trim() && explanation.trim()

  function submit() {
    if (!canSave) return
    onSave({
      id: initial?.id ?? newErrorCodeId(),
      code: code.trim(),
      explanation: explanation.trim(),
      note: note.trim() || undefined,
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {initial ? "Edit entry" : "New error code / repair help"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Code / title</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. E-12 or “No display”"
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Explanation</span>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="What it means and how to proceed…"
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-background p-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            Notes <span className="font-normal text-muted-foreground">(optional)</span>
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Field notes, parts used, observations…"
            rows={2}
            className="w-full resize-none rounded-xl border border-border bg-background p-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
          />
        </label>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="h-10 flex-1 rounded-xl">
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSave} className="h-10 flex-1 rounded-xl">
            <Save className="size-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
