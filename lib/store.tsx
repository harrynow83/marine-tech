"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { DiagnosticRecord, Equipment } from "./types"
import { SEED_EQUIPMENT } from "./seed-data"

const EQUIPMENT_KEY = "marinekit:equipment:v1"
const RECORDS_KEY = "marinekit:records:v1"

interface StoreContextValue {
  equipment: Equipment[]
  records: DiagnosticRecord[]
  ready: boolean
  addEquipment: (eq: Equipment) => void
  updateEquipment: (eq: Equipment) => void
  addRecord: (record: DiagnosticRecord) => void
  recordsForEquipment: (equipmentId: string) => DiagnosticRecord[]
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [records, setRecords] = useState<DiagnosticRecord[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const storedEq = localStorage.getItem(EQUIPMENT_KEY)
      setEquipment(storedEq ? (JSON.parse(storedEq) as Equipment[]) : SEED_EQUIPMENT)
      const storedRec = localStorage.getItem(RECORDS_KEY)
      setRecords(storedRec ? (JSON.parse(storedRec) as DiagnosticRecord[]) : [])
    } catch {
      setEquipment(SEED_EQUIPMENT)
      setRecords([])
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(equipment))
  }, [equipment, ready])

  useEffect(() => {
    if (ready) localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
  }, [records, ready])

  const addEquipment = useCallback((eq: Equipment) => {
    setEquipment((prev) => [eq, ...prev])
  }, [])

  const updateEquipment = useCallback((eq: Equipment) => {
    setEquipment((prev) => prev.map((e) => (e.id === eq.id ? eq : e)))
  }, [])

  const addRecord = useCallback((record: DiagnosticRecord) => {
    setRecords((prev) => [record, ...prev])
  }, [])

  const recordsForEquipment = useCallback(
    (equipmentId: string) =>
      records
        .filter((r) => r.equipmentId === equipmentId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [records],
  )

  return (
    <StoreContext.Provider
      value={{ equipment, records, ready, addEquipment, updateEquipment, addRecord, recordsForEquipment }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
