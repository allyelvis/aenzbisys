import { cn } from "@/lib/utils"
import type { NodeStatus, JobStatus, CommitmentStatus } from "@/lib/types"

export function Panel({
  title,
  right,
  children,
  className,
}: {
  title?: string
  right?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("border border-border bg-surface", className)}>
      {title && (
        <header className="flex items-center justify-between border-b border-border px-3 py-2">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted">{title}</h2>
          {right}
        </header>
      )}
      {children}
    </section>
  )
}

const NODE_COLORS: Record<NodeStatus, string> = {
  online: "text-primary",
  syncing: "text-accent",
  degraded: "text-warn",
  offline: "text-danger",
}

export function StatusDot({ status, className }: { status: NodeStatus; className?: string }) {
  const color =
    status === "online"
      ? "bg-primary"
      : status === "syncing"
        ? "bg-accent"
        : status === "degraded"
          ? "bg-warn"
          : "bg-danger"
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        color,
        (status === "online" || status === "syncing") && "pulse-dot",
        className,
      )}
      aria-hidden
    />
  )
}

export function NodeStatusBadge({ status }: { status: NodeStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider", NODE_COLORS[status])}>
      <StatusDot status={status} />
      {status}
    </span>
  )
}

const JOB_COLORS: Record<JobStatus, string> = {
  queued: "border-muted/40 text-muted",
  scheduling: "border-accent/50 text-accent",
  running: "border-primary/50 text-primary",
  verifying: "border-warn/50 text-warn",
  completed: "border-primary/30 text-primary/80",
  failed: "border-danger/50 text-danger",
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
        JOB_COLORS[status],
      )}
    >
      {status}
    </span>
  )
}

const COMMIT_COLORS: Record<CommitmentStatus, string> = {
  sealed: "border-primary/40 text-primary",
  committed: "border-accent/40 text-accent",
  replicating: "border-warn/40 text-warn",
  challenged: "border-danger/50 text-danger",
}

export function CommitmentBadge({ status }: { status: CommitmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
        COMMIT_COLORS[status],
      )}
    >
      {status}
    </span>
  )
}

export function Meter({ value, tone = "primary" }: { value: number; tone?: "primary" | "accent" | "warn" | "danger" }) {
  const bar =
    tone === "primary" ? "bg-primary" : tone === "accent" ? "bg-accent" : tone === "warn" ? "bg-warn" : "bg-danger"
  return (
    <div className="h-1.5 w-full bg-background">
      <div className={cn("h-full transition-all duration-500", bar)} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted">{children}</kbd>
  )
}
