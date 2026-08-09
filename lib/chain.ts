import { defineChain } from "viem"

// The custom MESHGRID chain, defined from genesis.json (chainId 65690).
export const meshgrid = defineChain({
  id: 65690,
  name: "MESHGRID",
  nativeCurrency: { name: "Mesh", symbol: "MESH", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.RPC_URL || "http://127.0.0.1:8545"] },
  },
})

// Server-side RPC endpoint. Never exposed to the client.
export const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545"

// Deployed MeshRegistry contract address (from scripts/deploy.mjs).
export const REGISTRY_ADDRESS = (process.env.MESH_REGISTRY_ADDRESS || "") as `0x${string}` | ""

export const CHAIN_ID = 65690
