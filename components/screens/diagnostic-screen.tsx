"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import type { DiagnosticRecord, Equipment, Outcome, RecordAnswer } from "@/lib/types"
import { TopBar } from "@/components/ui-bits"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, Save, User, X } from "lucide-react"

type Phase = "tech" | "steps" | "final" | "result"

export function DiagnosticScreen({
  equipment,
  onBack,
  onDone,
}: {
  equipment?: Equipment
  onBack: () => void
  onDone: () => void
}) {
  const { addRecord } = useStore()
  const [phase, setPhase] = useState<Phase>("tech")
  const [technician, setTechnician] = useState("")
  const [currentStepId, setCurrentStepId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<RecordAnswer[]>([])
  const [note, setNote] = useState("")
  const [finalNote, setFinalNote] = useState("")
  const [outcome, setOutcome] = useState<Outcome>("ok")

  const stepMap = useMemo(() => {
    const m = new Map(equipment?.checklist.map((s) => [s.id, s]) ?? [])
    return m
  }, [equipment])

  if (!equipment) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Not found" onBack={onBack} />
        <p className="p-6 text-sm text-muted-foreground">This equipment no longer exists.</p>
      </div>
    )
  }

  const total = equipment.checklist.length
  const progress = Math.min(answers.length, total)
  const currentStep = currentStepId ? stepMap.get(currentStepId) : null

  function startSteps() {
    if (!technician.trim()) return
    setCurrentStepId(equipment!.checklist[0]?.id ?? null)
    setPhase("steps")
  }

  function resolveTarget(target: string): { kind: "step" | "outcome"; value: string } {
    if (target === "ok" || target === "escalate") return { kind: "outcome", value: target }
    if (stepMap.has(target)) return { kind: "step", value: target }
    // Unknown target → treat as OK to avoid dead ends
    return { kind: "outcome", value: "ok" }
  }

  function answer(value: "yes" | "no") {
    if (!currentStep) return
    const newAnswer: RecordAnswer = {
      stepId: currentStep.id,
      question: currentStep.text,
      answer: value,
      note: note.trim() || undefined,
    }
    const nextAnswers = [...answers, newAnswer]
    setAnswers(nextAnswers)
    setNote("")

    const target = value === "yes" ? currentStep.yes : currentStep.no
    const resolved = resolveTarget(target)
    if (resolved.kind === "outcome") {
      setOutcome(resolved.value as Outcome)
      setPhase("final")
    } else {
      setCurrentStepId(resolved.value)
    }
  }

  function save() {
    const record: DiagnosticRecord = {
      id: `rec-${Date.now()}`,
      equipmentId: equipment!.id,
      technician: technician.trim(),
      date: new Date().toISOString(),
      outcome,
      answers,
      finalNote: finalNote.trim() || undefined,
    }
    addRecord(record)
    setPhase("result")
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Diagnostic"
        subtitle={equipment.name}
        onBack={onBack}
        right={
          phase !== "result" ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Cancel diagnostic"
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          ) : undefined
        }
      />

      {/* Progress bar */}
      {phase === "steps" ? (
        <div className="px-4 pt-3">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>
              Step {progress + 1} of ~{total}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.round((progress / Math.max(total, 1)) * 100)}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-4">
        {phase === "tech" ? (
          <div className="flex flex-1 flex-col">
            <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="tech">
              Technician name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="tech"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="h-12 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
                autoFocus
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              You&apos;ll be guided through {total} checks. Each answer may branch the flow.
            </p>
            <div className="mt-auto pt-6">
              <Button
                onClick={startSteps}
                disabled={!technician.trim()}
                className="h-12 w-full rounded-xl text-base"
              >
                Begin
              </Button>
            </div>
          </div>
        ) : null}

        {phase === "steps" && currentStep ? (
          <div className="flex flex-1 flex-col">
            <p className="mt-4 text-lg font-medium leading-snug text-foreground text-balance">
              {currentStep.text}
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note for this step…"
              rows={3}
              className="mt-4 w-full resize-none rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
            />
            <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
              <Button
                onClick={() => answer("no")}
                variant="destructive"
                className="h-14 rounded-xl text-base font-semibold"
              >
                NO
              </Button>
              <Button
                onClick={() => answer("yes")}
                className="h-14 rounded-xl bg-success text-base font-semibold text-primary-foreground hover:bg-success/90"
              >
                YES
              </Button>
            </div>
          </div>
        ) : null}

        {phase === "final" ? (
          <div className="flex flex-1 flex-col">
            <div
              className={`flex items-center gap-3 rounded-2xl border p-4 ${
                outcome === "ok"
                  ? "border-success/30 bg-success/10"
                  : "border-warning/40 bg-warning/15"
              }`}
            >
              {outcome === "ok" ? (
                <CheckCircle2 className="size-8 text-success" />
              ) : (
                <AlertTriangle className="size-8 text-warning" />
              )}
              <div>
                <p className="text-base font-semibold text-foreground">
                  {outcome === "ok" ? "System OK" : "Escalate"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {outcome === "ok"
                    ? "Checks passed within normal parameters."
                    : "A check failed — escalate for further service."}
                </p>
              </div>
            </div>

            <label className="mb-2 mt-6 block text-sm font-medium text-foreground" htmlFor="final">
              Final notes
            </label>
            <textarea
              id="final"
              value={finalNote}
              onChange={(e) => setFinalNote(e.target.value)}
              placeholder="Summary, parts needed, follow-up…"
              rows={4}
              className="w-full resize-none rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
            />

            <div className="mt-auto pt-6">
              <Button onClick={save} className="h-12 w-full rounded-xl text-base">
                <Save className="size-5" />
                Save record
              </Button>
            </div>
          </div>
        ) : null}

        {phase === "result" ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div
              className={`flex size-20 items-center justify-center rounded-full ${
                outcome === "ok" ? "bg-success/15 text-success" : "bg-warning/20 text-warning"
              }`}
            >
              {outcome === "ok" ? (
                <CheckCircle2 className="size-10" />
              ) : (
                <AlertTriangle className="size-10" />
              )}
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">Record saved</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {answers.length} check{answers.length === 1 ? "" : "s"} logged by {technician}.
            </p>
            <Button onClick={onDone} className="mt-8 h-12 w-full rounded-xl text-base">
              Done
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
