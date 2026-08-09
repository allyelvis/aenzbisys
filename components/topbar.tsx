"use client"

import type { NetworkStats } from "@/lib/types"
import { fmtNum } from "@/lib/utils"
import { Activity, Pause, Play } from "lucide-react"

export function TopBar({
  stats,
  paused,
  onTogglePause,
}: {
  stats: NetworkStats
  paused: boolean
  onTogglePause: () => void
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center border border-primary/60 text-primary">
            <Activity className="size-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-[0.2em] text-foreground">MESHGRID</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted">decentralized data &amp; compute</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <ChainStat label="block" value={`#${fmtNum(stats.chainHeight)}`} live />
          <ChainStat label="tps" value={fmtNum(stats.networkTps)} />
          <ChainStat label="gas" value={`${stats.gasPrice.toFixed(4)}`} />
          <ChainStat label="mesh" value={`$${stats.tokenPrice.toFixed(2)}`} />
          <ChainStat label="epoch" value={fmtNum(stats.epoch)} />
          <button
            onClick={onTogglePause}
            className="inline-flex items-center gap-1.5 border border-border px-2 py-1 text-[10px] uppercase tracking-wider text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
            {paused ? "resume" : "live"}
          </button>
        </div>
      </div>
    </header>
  )
}

function ChainStat({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted">{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
      {live && <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-hidden />}
    </div>
  )
}
