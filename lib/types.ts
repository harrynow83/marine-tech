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

export interface ErrorCode {
  id: string
  /** The fault/error code, or a short title for a repair tip (e.g. "E-12" or "No display") */
  code: string
  /** What the code means / explanation of the repair help */
  explanation: string
  /** Free-form technician notes, editable from the equipment view */
  note?: string
}

export interface Equipment {
  id: string
  name: string
  brand: string
  type: string
  category: string
  subcategory: string
  checklist: ChecklistStep[]
  /** Optional. Not every equipment has error codes; can also hold repair tips. */
  errorCodes?: ErrorCode[]
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
