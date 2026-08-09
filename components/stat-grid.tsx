"use client"

import type { NetworkStats } from "@/lib/types"
import { fmtCompact, fmtNum } from "@/lib/utils"
import { Meter } from "./ui-primitives"
import { Cpu, HardDrive, Server, Coins, Boxes, Gauge } from "lucide-react"

export function StatGrid({ stats }: { stats: NetworkStats }) {
  const cards = [
    {
      icon: Server,
      label: "active nodes",
      value: `${fmtNum(stats.onlineNodes)}/${fmtNum(stats.totalNodes)}`,
      sub: `${Math.round((stats.onlineNodes / stats.totalNodes) * 100)}% online`,
    },
    {
      icon: Cpu,
      label: "active jobs",
      value: fmtNum(stats.activeJobs),
      sub: "compute lanes",
    },
    {
      icon: HardDrive,
      label: "stored",
      value: `${stats.storedPetabytes} PB`,
      sub: "w/ replication",
    },
    {
      icon: Coins,
      label: "total staked",
      value: `${fmtCompact(stats.totalStaked)}`,
      sub: "MESH tokens",
    },
    {
      icon: Boxes,
      label: "avg block",
      value: `${stats.avgBlockTimeSec}s`,
      sub: `${fmtNum(stats.networkTps)} tps`,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="bg-surface p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted">{c.label}</span>
            <c.icon className="size-3.5 text-muted" />
          </div>
          <div className="tabular-nums text-xl text-foreground">{c.value}</div>
          <div className="text-[10px] text-muted">{c.sub}</div>
        </div>
      ))}

      <div className="col-span-2 bg-surface p-3 md:col-span-3 lg:col-span-5">
        <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted">
          <span className="flex items-center gap-1.5">
            <Gauge className="size-3.5" /> epoch {fmtNum(stats.epoch)} progress
          </span>
          <span className="tabular-nums text-foreground">{stats.epochProgressPct}%</span>
        </div>
        <Meter value={stats.epochProgressPct} tone="accent" />
      </div>
    </div>
  )
}
