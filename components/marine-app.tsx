"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import type { Equipment } from "@/lib/types"
import { HomeScreen } from "@/components/screens/home-screen"
import { CategoryScreen } from "@/components/screens/category-screen"
import { EquipmentListScreen } from "@/components/screens/equipment-list-screen"
import { DetailScreen } from "@/components/screens/detail-screen"
import { DiagnosticScreen } from "@/components/screens/diagnostic-screen"
import { AddEquipmentScreen } from "@/components/screens/add-equipment-screen"

export type View =
  | { name: "home" }
  | { name: "category"; category: string }
  | { name: "equipmentList"; category: string; subcategory: string }
  | { name: "detail"; equipmentId: string }
  | { name: "diagnostic"; equipmentId: string }
  | { name: "add" }
  | { name: "edit"; equipmentId: string }

export function MarineApp() {
  const { ready, equipment } = useStore()
  const [stack, setStack] = useState<View[]>([{ name: "home" }])

  const view = stack[stack.length - 1]
  const push = (v: View) => setStack((s) => [...s, v])
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))

  const findEquipment = (id: string): Equipment | undefined =>
    equipment.find((e) => e.id === id)

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      {!ready ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : view.name === "home" ? (
        <HomeScreen
          onOpenCategory={(category) => push({ name: "category", category })}
          onOpenEquipment={(id) => push({ name: "detail", equipmentId: id })}
          onAdd={() => push({ name: "add" })}
        />
      ) : view.name === "category" ? (
        <CategoryScreen
          category={view.category}
          onBack={back}
          onOpenSubcategory={(subcategory) =>
            push({ name: "equipmentList", category: view.category, subcategory })
          }
        />
      ) : view.name === "equipmentList" ? (
        <EquipmentListScreen
          category={view.category}
          subcategory={view.subcategory}
          onBack={back}
          onOpenEquipment={(id) => push({ name: "detail", equipmentId: id })}
        />
      ) : view.name === "detail" ? (
        <DetailScreen
          equipment={findEquipment(view.equipmentId)}
          onBack={back}
          onStart={() => push({ name: "diagnostic", equipmentId: view.equipmentId })}
          onEdit={() => push({ name: "edit", equipmentId: view.equipmentId })}
        />
      ) : view.name === "diagnostic" ? (
        <DiagnosticScreen
          equipment={findEquipment(view.equipmentId)}
          onBack={back}
          onDone={() => setStack((s) => s.slice(0, -1))}
        />
      ) : view.name === "add" ? (
        <AddEquipmentScreen
          onBack={back}
          onSaved={(id) => setStack([{ name: "home" }, { name: "detail", equipmentId: id }])}
        />
      ) : view.name === "edit" ? (
        <AddEquipmentScreen
          existing={findEquipment(view.equipmentId)}
          onBack={back}
          onSaved={() => back()}
        />
      ) : null}
    </div>
  )
}
