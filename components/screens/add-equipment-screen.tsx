"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import type { ChecklistStep, Equipment } from "@/lib/types"
import { TopBar } from "@/components/ui-bits"
import { Button } from "@/components/ui/button"
import { Plus, Save, Trash2 } from "lucide-react"

interface DraftStep {
  id: string
  text: string
  yes: string
  no: string
}

let draftCounter = 0
function newDraftStep(): DraftStep {
  draftCounter += 1
  return { id: `s${draftCounter}`, text: "", yes: "ok", no: "escalate" }
}

const CUSTOM = "__custom__"

export function AddEquipmentScreen({
  existing,
  onBack,
  onSaved,
}: {
  existing?: Equipment
  onBack: () => void
  onSaved: (id: string) => void
}) {
  const { equipment, addEquipment, updateEquipment } = useStore()
  const isEdit = Boolean(existing)

  const [name, setName] = useState(existing?.name ?? "")
  const [brand, setBrand] = useState(existing?.brand ?? "")
  const [type, setType] = useState(existing?.type ?? "")
  const [category, setCategory] = useState(existing?.category ?? "")
  const [subcategory, setSubcategory] = useState(existing?.subcategory ?? "")
  const [steps, setSteps] = useState<DraftStep[]>(
    existing && existing.checklist.length > 0
      ? existing.checklist.map((s) => ({ id: s.id, text: s.text, yes: s.yes, no: s.no }))
      : [newDraftStep()],
  )

  // Derive selectable options from existing equipment.
  const categoryOptions = useMemo(
    () => Array.from(new Set(equipment.map((e) => e.category))).sort(),
    [equipment],
  )
  const typeOptions = useMemo(
    () => Array.from(new Set(equipment.map((e) => e.type))).sort(),
    [equipment],
  )
  const subcategoryOptions = useMemo(() => {
    const inCategory = equipment.filter((e) => !category || e.category === category)
    const base = inCategory.length > 0 ? inCategory : equipment
    return Array.from(new Set(base.map((e) => e.subcategory))).sort()
  }, [equipment, category])

  const stepIds = steps.map((s) => s.id)
  const targetOptions = [...stepIds, "ok", "escalate"]

  const canSave =
    name.trim() &&
    brand.trim() &&
    type.trim() &&
    category.trim() &&
    subcategory.trim() &&
    steps.some((s) => s.text.trim())

  function updateStep(id: string, patch: Partial<DraftStep>) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function removeStep(id: string) {
    setSteps((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev))
  }

  function save() {
    if (!canSave) return
    const checklist: ChecklistStep[] = steps
      .filter((s) => s.text.trim())
      .map((s) => ({ id: s.id, text: s.text.trim(), yes: s.yes, no: s.no }))

    const eq: Equipment = {
      id: existing?.id ?? `eq-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim(),
      type: type.trim(),
      category: category.trim(),
      subcategory: subcategory.trim(),
      checklist,
    }
    if (isEdit) updateEquipment(eq)
    else addEquipment(eq)
    onSaved(eq.id)
  }

  return (
    <div className="flex flex-1 flex-col pb-28">
      <TopBar title={isEdit ? "Edit equipment" : "Add equipment"} onBack={onBack} />

      <div className="flex flex-col gap-4 p-4">
        <Field label="Name" value={name} onChange={setName} placeholder="e.g. MultiPlus Inverter" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Brand" value={brand} onChange={setBrand} placeholder="Victron" />
          <ComboSelect
            label="Type"
            value={type}
            options={typeOptions}
            onChange={setType}
            placeholder="Inverter"
          />
        </div>
        <ComboSelect
          label="Category"
          value={category}
          options={categoryOptions}
          onChange={setCategory}
          placeholder="Inverters & Chargers"
        />
        <ComboSelect
          label="Subcategory"
          value={subcategory}
          options={subcategoryOptions}
          onChange={setSubcategory}
          placeholder="Inverter/Chargers"
        />

        <div className="mt-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Diagnostic steps</h2>
            <span className="text-xs text-muted-foreground">{steps.length} step(s)</span>
          </div>

          <div className="flex flex-col gap-3">
            {steps.map((step, i) => (
              <div key={step.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    Step ID: {step.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    disabled={steps.length === 1}
                    aria-label="Remove step"
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive disabled:opacity-40"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <textarea
                  value={step.text}
                  onChange={(e) => updateStep(step.id, { text: e.target.value })}
                  placeholder="Question shown to the technician…"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border bg-background p-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <BranchSelect
                    label="If YES →"
                    value={step.yes}
                    options={targetOptions}
                    onChange={(v) => updateStep(step.id, { yes: v })}
                  />
                  <BranchSelect
                    label="If NO →"
                    value={step.no}
                    options={targetOptions}
                    onChange={(v) => updateStep(step.id, { no: v })}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setSteps((prev) => [...prev, newDraftStep()])}
            className="mt-3 h-10 w-full rounded-xl"
          >
            <Plus className="size-4" />
            Add step
          </Button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-border bg-background/95 p-4 backdrop-blur">
        <Button onClick={save} disabled={!canSave} className="h-12 w-full rounded-xl text-base">
          <Save className="size-5" />
          {isEdit ? "Save changes" : "Save equipment"}
        </Button>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
      />
    </label>
  )
}

/**
 * A dropdown that lists existing options plus an "Other…" entry that reveals
 * a free-text input so new categories/types can still be created.
 */
function ComboSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
  placeholder?: string
}) {
  // Custom mode when the current value isn't one of the known options.
  const isKnown = value === "" || options.includes(value)
  const [custom, setCustom] = useState(!isKnown)

  const selectValue = custom ? CUSTOM : value

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <select
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value
          if (v === CUSTOM) {
            setCustom(true)
            onChange("")
          } else {
            setCustom(false)
            onChange(v)
          }
        }}
        className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
      >
        <option value="" disabled>
          Select {label.toLowerCase()}…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value={CUSTOM}>+ Other…</option>
      </select>
      {custom ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? `New ${label.toLowerCase()}`}
          className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
        />
      ) : null}
    </label>
  )
}

function BranchSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "ok" ? "System OK" : o === "escalate" ? "Escalate" : `Go to ${o}`}
          </option>
        ))}
      </select>
    </label>
  )
}
