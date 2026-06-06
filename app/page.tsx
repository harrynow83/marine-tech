"use client"

import { StoreProvider } from "@/lib/store"
import { MarineApp } from "@/components/marine-app"

export default function Page() {
  return (
    <StoreProvider>
      <MarineApp />
    </StoreProvider>
  )
}
