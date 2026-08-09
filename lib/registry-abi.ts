// ABI for contracts/MeshRegistry.sol. Shared by the app (reads/writes) and the
// deploy script. Keep in sync with the Solidity source.
export const MESH_REGISTRY_ABI = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    name: "counts",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "nodeCount", type: "uint256" },
      { name: "jobCount", type: "uint256" },
      { name: "commitmentCount", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "getNodes",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "operator", type: "address" },
          { name: "region", type: "string" },
          { name: "role", type: "uint8" },
          { name: "cpuCores", type: "uint32" },
          { name: "ramGb", type: "uint32" },
          { name: "storageTb", type: "uint32" },
          { name: "stakedTokens", type: "uint256" },
          { name: "registeredAt", type: "uint64" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getJobs",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "submitter", type: "address" },
          { name: "name", type: "string" },
          { name: "image", type: "string" },
          { name: "cpuReq", type: "uint32" },
          { name: "ramReqGb", type: "uint32" },
          { name: "assignedNode", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "progress", type: "uint8" },
          { name: "costTokens", type: "uint256" },
          { name: "submittedAt", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getCommitments",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "owner", type: "address" },
          { name: "cid", type: "string" },
          { name: "name", type: "string" },
          { name: "sizeGb", type: "uint256" },
          { name: "replicationFactor", type: "uint8" },
          { name: "replicasHealthy", type: "uint8" },
          { name: "status", type: "uint8" },
          { name: "committedAt", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "registerNode",
    stateMutability: "nonpayable",
    inputs: [
      { name: "region", type: "string" },
      { name: "role", type: "uint8" },
      { name: "cpuCores", type: "uint32" },
      { name: "ramGb", type: "uint32" },
      { name: "storageTb", type: "uint32" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    type: "function",
    name: "submitJob",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "image", type: "string" },
      { name: "cpuReq", type: "uint32" },
      { name: "ramReqGb", type: "uint32" },
      { name: "costTokens", type: "uint256" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    type: "function",
    name: "createCommitment",
    stateMutability: "nonpayable",
    inputs: [
      { name: "cid", type: "string" },
      { name: "name", type: "string" },
      { name: "sizeGb", type: "uint256" },
      { name: "replicationFactor", type: "uint8" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
] as const
