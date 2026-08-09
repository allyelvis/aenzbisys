"use client"

import type { ChainEvent } from "@/lib/types"
import { fmtAgo, fmtNum } from "@/lib/utils"
import { Panel } from "./ui-primitives"
import { Blocks, Cpu, HardDrive, Coins, ShieldAlert, LogIn, LogOut } from "lucide-react"

const ICONS: Record<ChainEvent["type"], typeof Blocks> = {
  block: Blocks,
  job: Cpu,
  storage: HardDrive,
  stake: Coins,
  slash: ShieldAlert,
  join: LogIn,
  leave: LogOut,
}

const TONE: Record<ChainEvent["type"], string> = {
  block: "text-muted",
  job: "text-primary",
  storage: "text-accent",
  stake: "text-primary",
  slash: "text-danger",
  join: "text-primary",
  leave: "text-warn",
}

export function EventFeed({ events }: { events: ChainEvent[] }) {
  return (
    <Panel
      title="chain event log"
      right={<span className="text-[10px] text-primary">● streaming</span>}
      className="flex h-full flex-col"
    >
      <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
        {events.map((ev) => {
          const Icon = ICONS[ev.type]
          return (
            <div key={ev.id} className="flex items-start gap-2 px-3 py-2 text-[11px]">
              <Icon className={`mt-0.5 size-3.5 shrink-0 ${TONE[ev.type]}`} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-foreground">{ev.message}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted">
                  <span className="tabular-nums">#{fmtNum(ev.blockHeight)}</span>
                  <span className="truncate">{ev.txHash}</span>
                  {ev.valueTokens !== undefined && (
                    <span className="text-primary/80">+{fmtNum(ev.valueTokens, 0)} MESH</span>
                  )}
                  <span className="ml-auto shrink-0">{fmtAgo(ev.secondsAgo)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
