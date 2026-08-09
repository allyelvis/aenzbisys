import type {
  NetworkNode,
  ComputeJob,
  StorageCommitment,
  ChainEvent,
  NetworkStats,
  NodeRole,
  NodeStatus,
} from "./types"

// Seeded pseudo-random so server + client agree on the first render.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const REGIONS = ["us-east", "us-west", "eu-central", "eu-west", "ap-south", "ap-east", "sa-east", "af-south"]
const ROLES: NodeRole[] = ["compute", "storage", "hybrid", "validator"]

function hexAddr(rnd: () => number, len = 40) {
  const chars = "0123456789abcdef"
  let out = "0x"
  for (let i = 0; i < len; i++) out += chars[Math.floor(rnd() * 16)]
  return out
}

function shortHash(rnd: () => number) {
  return hexAddr(rnd, 8) + "…" + Array.from({ length: 4 }, () => "0123456789abcdef"[Math.floor(rnd() * 16)]).join("")
}

export function generateNodes(count = 24, seed = 42): NetworkNode[] {
  const rnd = mulberry32(seed)
  const nodes: NetworkNode[] = []
  for (let i = 0; i < count; i++) {
    const role = ROLES[Math.floor(rnd() * ROLES.length)]
    const roll = rnd()
    const status: NodeStatus =
      roll > 0.9 ? "offline" : roll > 0.8 ? "degraded" : roll > 0.68 ? "syncing" : "online"
    const storageTb = role === "compute" || role === "validator" ? 2 + Math.floor(rnd() * 6) : 8 + Math.floor(rnd() * 40)
    nodes.push({
      id: `node-${String(i + 1).padStart(3, "0")}`,
      address: hexAddr(rnd),
      region: REGIONS[Math.floor(rnd() * REGIONS.length)],
      role,
      status,
      cpuCores: [8, 16, 32, 64, 128][Math.floor(rnd() * 5)],
      ramGb: [32, 64, 128, 256, 512][Math.floor(rnd() * 5)],
      storageTb,
      storageUsedTb: +(storageTb * (0.2 + rnd() * 0.7)).toFixed(1),
      cpuLoad: status === "offline" ? 0 : Math.floor(rnd() * 95),
      peers: status === "offline" ? 0 : 6 + Math.floor(rnd() * 40),
      uptimePct: +(97 + rnd() * 3).toFixed(2),
      reputation: Math.floor(400 + rnd() * 600),
      stakedTokens: Math.floor(5000 + rnd() * 250000),
      lastSeenSecondsAgo: status === "offline" ? 120 + Math.floor(rnd() * 3000) : Math.floor(rnd() * 20),
      earnings24h: +(rnd() * 480).toFixed(2),
    })
  }
  return nodes
}

const JOB_NAMES = [
  "llm-finetune-7b",
  "genome-align-batch",
  "render-frames-8k",
  "monte-carlo-risk",
  "zk-proof-gen",
  "video-transcode",
  "protein-fold-sim",
  "vector-index-build",
  "climate-model-run",
  "fraud-detect-train",
]
const IMAGES = ["ghcr.io/mesh/cuda-torch:2.4", "ghcr.io/mesh/ffmpeg:6", "ghcr.io/mesh/zk-circom:1.2", "ghcr.io/mesh/bio-tools:3"]

export function generateJobs(nodes: NetworkNode[], count = 14, seed = 7): ComputeJob[] {
  const rnd = mulberry32(seed)
  const jobs: ComputeJob[] = []
  const statuses: ComputeJob["status"][] = [
    "running",
    "running",
    "running",
    "queued",
    "scheduling",
    "verifying",
    "completed",
    "failed",
  ]
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(rnd() * statuses.length)]
    const assigned =
      status === "queued" || status === "scheduling"
        ? null
        : nodes[Math.floor(rnd() * nodes.length)].id
    jobs.push({
      id: `job-${hexAddr(rnd, 6)}`,
      name: JOB_NAMES[Math.floor(rnd() * JOB_NAMES.length)],
      submitter: hexAddr(rnd),
      image: IMAGES[Math.floor(rnd() * IMAGES.length)],
      status,
      assignedNode: assigned,
      cpuReq: [4, 8, 16, 32][Math.floor(rnd() * 4)],
      ramReqGb: [16, 32, 64, 128][Math.floor(rnd() * 4)],
      progress:
        status === "completed" ? 100 : status === "queued" || status === "scheduling" ? 0 : Math.floor(rnd() * 96) + 2,
      costTokens: +(rnd() * 900 + 20).toFixed(2),
      submittedSecondsAgo: Math.floor(rnd() * 7200),
      durationSec: Math.floor(rnd() * 9000) + 60,
      replicas: 1 + Math.floor(rnd() * 3),
    })
  }
  return jobs
}

const DATASET_NAMES = [
  "training-corpus-v4.tar",
  "satellite-imagery-2026",
  "ledger-snapshot.parquet",
  "genome-refseq.fa",
  "market-ticks-q1.bin",
  "model-weights-70b.safetensors",
  "archive-cold-2025.zip",
]

export function generateCommitments(nodes: NetworkNode[], count = 10, seed = 99): StorageCommitment[] {
  const rnd = mulberry32(seed)
  const storageNodes = nodes.filter((n) => n.role === "storage" || n.role === "hybrid")
  const out: StorageCommitment[] = []
  const statuses: StorageCommitment["status"][] = ["sealed", "sealed", "committed", "replicating", "challenged"]
  for (let i = 0; i < count; i++) {
    const rf = 3 + Math.floor(rnd() * 4)
    const healthy = Math.max(1, rf - Math.floor(rnd() * 3))
    const pinned = Array.from(
      { length: Math.min(rf, storageNodes.length) },
      () => storageNodes[Math.floor(rnd() * storageNodes.length)]?.id,
    ).filter(Boolean) as string[]
    out.push({
      id: `sc-${hexAddr(rnd, 6)}`,
      cid: "bafy" + Array.from({ length: 20 }, () => "abcdefghijklmnopqrstuvwxyz234567"[Math.floor(rnd() * 32)]).join(""),
      name: DATASET_NAMES[Math.floor(rnd() * DATASET_NAMES.length)],
      owner: hexAddr(rnd),
      sizeGb: +(rnd() * 4000 + 10).toFixed(1),
      replicationFactor: rf,
      replicasHealthy: healthy,
      status: statuses[Math.floor(rnd() * statuses.length)],
      redundancyPct: Math.round((healthy / rf) * 100),
      pinnedNodes: [...new Set(pinned)],
      txHash: shortHash(rnd),
      blockHeight: 8_400_000 + Math.floor(rnd() * 90000),
      epochsRemaining: Math.floor(rnd() * 180) + 1,
    })
  }
  return out
}

const EVENT_TEMPLATES: { type: ChainEvent["type"]; make: (r: () => number) => string; val?: boolean }[] = [
  { type: "block", make: (r) => `Block sealed by validator ${hexAddr(r, 6)} · ${1 + Math.floor(r() * 400)} txns` },
  { type: "job", make: (r) => `Compute job job-${hexAddr(r, 6)} settled`, val: true },
  { type: "storage", make: (r) => `Storage proof accepted for sc-${hexAddr(r, 6)}` },
  { type: "stake", make: (r) => `Node ${hexAddr(r, 6)} increased stake`, val: true },
  { type: "slash", make: (r) => `Slashing event: node ${hexAddr(r, 6)} missed proof`, val: true },
  { type: "join", make: (r) => `New node ${hexAddr(r, 6)} joined the mesh` },
  { type: "leave", make: (r) => `Node ${hexAddr(r, 6)} left gracefully` },
]

export function generateEvents(count = 30, seed = 123): ChainEvent[] {
  const rnd = mulberry32(seed)
  const events: ChainEvent[] = []
  let height = 8_492_113
  let ago = 0
  for (let i = 0; i < count; i++) {
    const tpl = EVENT_TEMPLATES[Math.floor(rnd() * EVENT_TEMPLATES.length)]
    ago += Math.floor(rnd() * 40) + 2
    if (rnd() > 0.5) height -= 1
    events.push({
      id: `ev-${i}-${Math.floor(rnd() * 1e6)}`,
      type: tpl.type,
      message: tpl.make(rnd),
      txHash: shortHash(rnd),
      blockHeight: height,
      secondsAgo: ago,
      valueTokens: tpl.val ? +(rnd() * 5000).toFixed(2) : undefined,
    })
  }
  return events
}

export function computeStats(
  nodes: NetworkNode[],
  jobs: ComputeJob[],
  commitments: StorageCommitment[],
): NetworkStats {
  const online = nodes.filter((n) => n.status === "online" || n.status === "syncing").length
  const totalStaked = nodes.reduce((s, n) => s + n.stakedTokens, 0)
  const activeJobs = jobs.filter((j) => j.status === "running" || j.status === "verifying" || j.status === "scheduling").length
  const storedGb = commitments.reduce((s, c) => s + c.sizeGb * c.replicationFactor, 0)
  return {
    chainHeight: 8_492_113,
    totalNodes: nodes.length,
    onlineNodes: online,
    totalStaked,
    activeJobs,
    storedPetabytes: +(storedGb / 1_000_000).toFixed(3),
    networkTps: 1240,
    avgBlockTimeSec: 2.1,
    gasPrice: 0.0042,
    tokenPrice: 3.87,
    epoch: 14092,
    epochProgressPct: 63,
  }
}

// Full snapshot used to seed the client store.
export function buildSnapshot() {
  const nodes = generateNodes()
  const jobs = generateJobs(nodes)
  const commitments = generateCommitments(nodes)
  const events = generateEvents()
  const stats = computeStats(nodes, jobs, commitments)
  return { nodes, jobs, commitments, events, stats }
}
