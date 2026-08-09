"use client"

import { useMemo, useState } from "react"
import type { NetworkNode, NodeRole } from "@/lib/types"
import { fmtCompact, truncMid } from "@/lib/utils"
import { Panel, NodeStatusBadge, Meter } from "./ui-primitives"

const ROLE_FILTERS: (NodeRole | "all")[] = ["all", "compute", "storage", "hybrid", "validator"]

export function NodesTable({ nodes }: { nodes: NetworkNode[] }) {
  const [filter, setFilter] = useState<NodeRole | "all">("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return nodes.filter((n) => {
      const roleOk = filter === "all" || n.role === filter
      const q = query.trim().toLowerCase()
      const qOk = !q || n.id.includes(q) || n.address.toLowerCase().includes(q) || n.region.includes(q)
      return roleOk && qOk
    })
  }, [nodes, filter, query])

  return (
    <Panel
      title={`node registry · ${filtered.length}`}
      right={
        <div className="flex items-center gap-1">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-1.5 py-0.5 text-[10px] uppercase tracking-wider transition-colors ${
                filter === r ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      }
    >
      <div className="border-b border-border px-3 py-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="grep node id / address / region…"
          className="w-full bg-background px-2 py-1.5 text-[11px] text-foreground outline-none placeholder:text-muted focus:ring-1 focus:ring-primary/50"
        />
      </div>

      <div className="max-h-[440px] overflow-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0 bg-surface">
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted">
              <th className="px-3 py-2 font-normal">node</th>
              <th className="px-3 py-2 font-normal">role</th>
              <th className="px-3 py-2 font-normal">status</th>
              <th className="px-3 py-2 font-normal">region</th>
              <th className="px-3 py-2 font-normal">cpu</th>
              <th className="px-3 py-2 font-normal">rep</th>
              <th className="px-3 py-2 text-right font-normal">staked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((n) => (
              <tr key={n.id} className="transition-colors hover:bg-surface-hover">
                <td className="px-3 py-2">
                  <div className="text-foreground">{n.id}</div>
                  <div className="text-[10px] text-muted">{truncMid(n.address, 8, 6)}</div>
                </td>
                <td className="px-3 py-2 uppercase text-muted">{n.role}</td>
                <td className="px-3 py-2">
                  <NodeStatusBadge status={n.status} />
                </td>
                <td className="px-3 py-2 text-muted">{n.region}</td>
                <td className="w-24 px-3 py-2">
                  <div className="tabular-nums text-foreground">{n.cpuLoad}%</div>
                  <Meter value={n.cpuLoad} tone={n.cpuLoad > 85 ? "danger" : n.cpuLoad > 60 ? "warn" : "primary"} />
                </td>
                <td className="px-3 py-2 tabular-nums text-foreground">{n.reputation}</td>
                <td className="px-3 py-2 text-right tabular-nums text-foreground">{fmtCompact(n.stakedTokens)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted">
                  no nodes match filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
