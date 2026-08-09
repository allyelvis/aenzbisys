import { Dashboard } from "@/components/dashboard"
import { buildSnapshot } from "@/lib/network"

export default function Page() {
  const snapshot = buildSnapshot()
  return <Dashboard snapshot={snapshot} />
}
