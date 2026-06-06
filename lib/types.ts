export type Branch = "next" | "escalate" | "ok" | string

export interface ChecklistStep {
  id: string
  /** The question/instruction shown to the technician */
  text: string
  /** Step id (or outcome keyword) to go to when the answer is YES */
  yes: Branch
  /** Step id (or outcome keyword) to go to when the answer is NO */
  no: Branch
}

export interface Equipment {
  id: string
  name: string
  brand: string
  type: string
  category: string
  subcategory: string
  checklist: ChecklistStep[]
}

export interface RecordAnswer {
  stepId: string
  question: string
  answer: "yes" | "no"
  note?: string
}

export type Outcome = "ok" | "escalate"

export interface DiagnosticRecord {
  id: string
  equipmentId: string
  technician: string
  date: string
  outcome: Outcome
  answers: RecordAnswer[]
  finalNote?: string
}
