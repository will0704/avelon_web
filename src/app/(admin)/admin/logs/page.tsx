"use client"

import dynamic from "next/dynamic"

const Logs = dynamic(() => import("@/components/pages/Logs"), { ssr: false })

export default function LogsPage() {
  return <Logs />
}
