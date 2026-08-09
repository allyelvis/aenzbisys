"use client"

import type { StorageCommitment } from "@/lib/types"
import { fmtNum, truncMid } from "@/lib/utils"
import { Panel, CommitmentBadge, Meter } from "./ui-primitives"
import { FileDigit } from "lucide-react"

export function StoragePanel({ commitments }: { commitments: StorageCommitment[] }) {
  return (
    <Panel
      title={`storage commitments · ${commitments.length}`}
      right={<span className="text-[10px] text-muted">verifiable · on-chain</span>}
    >
      <div className="max-h-[440px] divide-y divide-border overflow-auto">
        {commitments.map((c) => (
          <div key={c.id} className="px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FileDigit className="size-3.5 shrink-0 text-accent" />
                  <span className="truncate text-[12px] text-foreground">{c.name}</span>
                  <CommitmentBadge status={c.status} />
                </div>
                <div className="mt-1 truncate font-mono text-[10px] text-muted">{c.cid}</div>
                <div className="mt-0.5 text-[10px] text-muted">
                  owner {truncMid(c.owner, 6, 4)} · tx {c.txHash} · #{fmtNum(c.blockHeight)}
                </div>
              </div>
              <div className="shrink-0 text-right text-[10px]">
                <div className="tabular-nums text-foreground">{fmtNum(c.sizeGb, 1)} GB</div>
                <div className="text-muted">{c.epochsRemaining} epochs left</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="w-28 shrink-0 text-[10px] text-muted">
                replicas {c.replicasHealthy}/{c.replicationFactor}
              </span>
              <div className="flex-1">
                <Meter
                  value={c.redundancyPct}
                  tone={c.redundancyPct >= 100 ? "primary" : c.redundancyPct >= 60 ? "warn" : "danger"}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-muted">{c.redundancyPct}%</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}
