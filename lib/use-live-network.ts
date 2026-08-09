"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { NetworkNode, ComputeJob, StorageCommitment, ChainEvent, NetworkStats } from "./types"

interface Snapshot {
  nodes: NetworkNode[]
  jobs: ComputeJob[]
  commitments: StorageCommitment[]
  events: ChainEvent[]
  stats: NetworkStats
}

const EVENT_POOL: { type: ChainEvent["type"]; msg: () => string; val?: boolean }[] = [
  { type: "block", msg: () => `Block sealed · ${1 + Math.floor(Math.random() * 400)} txns` },
  { type: "job", msg: () => `Compute job job-${rand(6)} settled`, val: true },
  { type: "storage", msg: () => `Storage proof accepted for sc-${rand(6)}` },
  { type: "stake", msg: () => `Node 0x${rand(6)} increased stake`, val: true },
  { type: "slash", msg: () => `Slashing: node 0x${rand(6)} missed proof`, val: true },
  { type: "join", msg: () => `New node 0x${rand(6)} joined the mesh` },
]

function rand(len: number) {
  return Array.from({ length: len }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")
}

export function useLiveNetwork(initial: Snapshot) {
  const [data, setData] = useState<Snapshot>(initial)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) return
      setData((prev) => {
        // Advance chain
        const stats: NetworkStats = {
          ...prev.stats,
          chainHeight: prev.stats.chainHeight + 1,
          networkTps: Math.max(600, Math.round(prev.stats.networkTps + (Math.random() - 0.5) * 120)),
          gasPrice: +Math.max(0.001, prev.stats.gasPrice + (Math.random() - 0.5) * 0.0006).toFixed(4),
          tokenPrice: +Math.max(0.1, prev.stats.tokenPrice + (Math.random() - 0.5) * 0.05).toFixed(2),
          epochProgressPct: (prev.stats.epochProgressPct + 1) % 100,
        }

        // Jitter node loads
        const nodes = prev.nodes.map((n) => {
          if (n.status === "offline") return n
          return {
            ...n,
            cpuLoad: clamp(n.cpuLoad + Math.round((Math.random() - 0.5) * 14), 2, 99),
            peers: clamp(n.peers + Math.round((Math.random() - 0.5) * 3), 3, 64),
            lastSeenSecondsAgo: Math.floor(Math.random() * 8),
          }
        })

        // Advance running jobs
        const jobs = prev.jobs.map((j) => {
          if (j.status === "running") {
            const progress = Math.min(100, j.progress + Math.random() * 6)
            return { ...j, progress, status: progress >= 100 ? ("verifying" as const) : j.status }
          }
          if (j.status === "verifying" && Math.random() > 0.7) {
            return { ...j, status: "completed" as const, progress: 100 }
          }
          if (j.status === "scheduling" && Math.random() > 0.6) {
            return { ...j, status: "running" as const }
          }
          return j
        })

        // Push a new chain event occasionally
        let events = prev.events
        if (Math.random() > 0.4) {
          const tpl = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)]
          const ev: ChainEvent = {
            id: `ev-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
            type: tpl.type,
            message: tpl.msg(),
            txHash: `0x${rand(8)}…${rand(4)}`,
            blockHeight: stats.chainHeight,
            secondsAgo: 0,
            valueTokens: tpl.val ? +(Math.random() * 5000).toFixed(2) : undefined,
          }
          events = [ev, ...prev.events.map((e) => ({ ...e, secondsAgo: e.secondsAgo + 2 }))].slice(0, 60)
        } else {
          events = prev.events.map((e) => ({ ...e, secondsAgo: e.secondsAgo + 2 }))
        }

        return { ...prev, nodes, jobs, events, stats }
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const submitJob = useCallback((job: ComputeJob) => {
    setData((prev) => ({ ...prev, jobs: [job, ...prev.jobs] }))
  }, [])

  return { data, paused, setPaused, submitJob }
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
