export type NodeStatus = "online" | "syncing" | "degraded" | "offline"
export type NodeRole = "compute" | "storage" | "hybrid" | "validator"

export interface NetworkNode {
  id: string
  address: string // wallet / peer address
  region: string
  role: NodeRole
  status: NodeStatus
  cpuCores: number
  ramGb: number
  storageTb: number
  storageUsedTb: number
  cpuLoad: number // 0-100
  peers: number
  uptimePct: number
  reputation: number // 0-1000
  stakedTokens: number
  lastSeenSecondsAgo: number
  earnings24h: number
}

export type JobStatus = "queued" | "scheduling" | "running" | "verifying" | "completed" | "failed"

export interface ComputeJob {
  id: string
  name: string
  submitter: string
  image: string
  status: JobStatus
  assignedNode: string | null
  cpuReq: number
  ramReqGb: number
  progress: number // 0-100
  costTokens: number
  submittedSecondsAgo: number
  durationSec: number
  replicas: number
}

export type CommitmentStatus = "committed" | "replicating" | "sealed" | "challenged"

export interface StorageCommitment {
  id: string
  cid: string // content identifier
  name: string
  owner: string
  sizeGb: number
  replicationFactor: number
  replicasHealthy: number
  status: CommitmentStatus
  redundancyPct: number
  pinnedNodes: string[]
  txHash: string
  blockHeight: number
  epochsRemaining: number
}

export type ChainEventType = "block" | "job" | "storage" | "stake" | "slash" | "join" | "leave"

export interface ChainEvent {
  id: string
  type: ChainEventType
  message: string
  txHash: string
  blockHeight: number
  secondsAgo: number
  valueTokens?: number
}

export interface NetworkStats {
  chainHeight: number
  totalNodes: number
  onlineNodes: number
  totalStaked: number
  activeJobs: number
  storedPetabytes: number
  networkTps: number
  avgBlockTimeSec: number
  gasPrice: number
  tokenPrice: number
  epoch: number
  epochProgressPct: number
}
