"use client"

import { useLiveNetwork } from "@/lib/use-live-network"
import type { NetworkNode, ComputeJob, StorageCommitment, ChainEvent, NetworkStats } from "@/lib/types"
import { TopBar } from "./topbar"
import { StatGrid } from "./stat-grid"
import { Topology } from "./topology"
import { EventFeed } from "./event-feed"
import { NodesTable } from "./nodes-table"
import { JobsPanel } from "./jobs-panel"
import { StoragePanel } from "./storage-panel"
import { Panel } from "./ui-primitives"

interface Snapshot {
  nodes: NetworkNode[]
  jobs: ComputeJob[]
  commitments: StorageCommitment[]
  events: ChainEvent[]
  stats: NetworkStats
}

export function Dashboard({ snapshot }: { snapshot: Snapshot }) {
  const { data, paused, setPaused, submitJob } = useLiveNetwork(snapshot)

  return (
    <div className="min-h-screen">
      <TopBar stats={data.stats} paused={paused} onTogglePause={() => setPaused((p) => !p)} />

      <main className="mx-auto max-w-[1600px] space-y-4 p-4">
        <StatGrid stats={data.stats} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel
            title="mesh topology"
            className="flex flex-col lg:col-span-2"
            right={<span className="text-[10px] text-muted">{data.nodes.length} peers</span>}
          >
            <div className="grid-backdrop relative h-[420px] w-full">
              <Topology nodes={data.nodes} />
            </div>
          </Panel>
          <div className="h-[420px]">
            <EventFeed events={data.events} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <JobsPanel jobs={data.jobs} onSubmit={submitJob} />
          <StoragePanel commitments={data.commitments} />
        </div>

        <NodesTable nodes={data.nodes} />

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-4 text-[10px] text-muted">
          <span>MESHGRID protocol v0.9.2 · consensus: proof-of-storage + proof-of-compute</span>
          <span>rpc: mainnet.meshgrid.network · block time ~2.1s · simulated telemetry</span>
        </footer>
      </main>
    </div>
  )
}
