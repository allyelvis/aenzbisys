"use client"

import { useState } from "react"
import type { ComputeJob } from "@/lib/types"
import { fmtNum } from "@/lib/utils"
import { Panel, JobStatusBadge, Meter } from "./ui-primitives"
import { Plus, X } from "lucide-react"

export function JobsPanel({
  jobs,
  onSubmit,
}: {
  jobs: ComputeJob[]
  onSubmit: (job: ComputeJob) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Panel
      title={`compute scheduler · ${jobs.length}`}
      right={
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 border border-primary/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="size-3" /> submit job
        </button>
      }
    >
      <div className="max-h-[440px] divide-y divide-border overflow-auto">
        {jobs.map((j) => (
          <div key={j.id} className="px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[12px] text-foreground">{j.name}</span>
                  <JobStatusBadge status={j.status} />
                </div>
                <div className="mt-0.5 truncate text-[10px] text-muted">
                  {j.id} · {j.image} · {j.cpuReq}vCPU/{j.ramReqGb}GB ·{" "}
                  {j.assignedNode ? `→ ${j.assignedNode}` : "unassigned"}
                </div>
              </div>
              <div className="shrink-0 text-right text-[10px]">
                <div className="tabular-nums text-primary">{fmtNum(j.costTokens, 0)} MESH</div>
                <div className="text-muted">{j.replicas}× replica</div>
              </div>
            </div>
            {(j.status === "running" || j.status === "verifying" || j.status === "completed") && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1">
                  <Meter
                    value={j.progress}
                    tone={j.status === "verifying" ? "warn" : "primary"}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-muted">
                  {Math.round(j.progress)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {open && <SubmitDialog onClose={() => setOpen(false)} onSubmit={onSubmit} />}
    </Panel>
  )
}

function SubmitDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (job: ComputeJob) => void
}) {
  const [name, setName] = useState("")
  const [image, setImage] = useState("ghcr.io/mesh/cuda-torch:2.4")
  const [cpu, setCpu] = useState(8)
  const [ram, setRam] = useState(32)
  const [replicas, setReplicas] = useState(1)

  const handleSubmit = () => {
    const rand = (n: number) =>
      Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")
    const job: ComputeJob = {
      id: `job-${rand(6)}`,
      name: name.trim() || "untitled-job",
      submitter: `0x${rand(40)}`,
      image,
      status: "scheduling",
      assignedNode: null,
      cpuReq: cpu,
      ramReqGb: ram,
      progress: 0,
      costTokens: +(cpu * 12 + ram * 2.4 + replicas * 30).toFixed(2),
      submittedSecondsAgo: 0,
      durationSec: 0,
      replicas,
    }
    onSubmit(job)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md border border-border bg-surface">
        <header className="flex items-center justify-between border-b border-border px-3 py-2">
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">submit compute job</h3>
          <button onClick={onClose} className="text-muted hover:text-foreground" aria-label="close">
            <X className="size-4" />
          </button>
        </header>
        <div className="space-y-3 p-4 text-[11px]">
          <Field label="job name">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="llm-finetune-7b"
              className="w-full bg-background px-2 py-1.5 text-foreground outline-none placeholder:text-muted focus:ring-1 focus:ring-primary/50"
            />
          </Field>
          <Field label="container image">
            <select
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-background px-2 py-1.5 text-foreground outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option>ghcr.io/mesh/cuda-torch:2.4</option>
              <option>ghcr.io/mesh/ffmpeg:6</option>
              <option>ghcr.io/mesh/zk-circom:1.2</option>
              <option>ghcr.io/mesh/bio-tools:3</option>
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="vCPU">
              <NumberInput value={cpu} onChange={setCpu} options={[4, 8, 16, 32, 64]} />
            </Field>
            <Field label="RAM GB">
              <NumberInput value={ram} onChange={setRam} options={[16, 32, 64, 128, 256]} />
            </Field>
            <Field label="replicas">
              <NumberInput value={replicas} onChange={setReplicas} options={[1, 2, 3, 5]} />
            </Field>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3 text-muted">
            <span>
              est. cost{" "}
              <span className="text-primary">{fmtNum(cpu * 12 + ram * 2.4 + replicas * 30, 0)} MESH</span>
            </span>
            <button
              onClick={handleSubmit}
              className="border border-primary/60 bg-primary px-3 py-1.5 uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
            >
              broadcast tx
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted">{label}</span>
      {children}
    </label>
  )
}

function NumberInput({
  value,
  onChange,
  options,
}: {
  value: number
  onChange: (v: number) => void
  options: number[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full bg-background px-2 py-1.5 text-foreground outline-none focus:ring-1 focus:ring-primary/50"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
