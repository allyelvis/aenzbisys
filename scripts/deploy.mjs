// Compile and deploy contracts/MeshRegistry.sol to the MESHGRID chain (65690).
//
// Usage:
//   RPC_URL=http://localhost:8545 DEPLOYER_PRIVATE_KEY=0x... node scripts/deploy.mjs
//
// The deployer account must be funded on the target chain. On the genesis chain
// that is the pre-funded account 0x1b6f...02e3; on the `--dev` quick-start node
// fund any address from the dev account first.

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import solc from "solc"
import { createWalletClient, createPublicClient, http, defineChain } from "viem"
import { privateKeyToAccount } from "viem/accounts"

const __dirname = dirname(fileURLToPath(import.meta.url))
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545"
const PK = process.env.DEPLOYER_PRIVATE_KEY

if (!PK) {
  console.error("Missing DEPLOYER_PRIVATE_KEY env var (0x-prefixed private key).")
  process.exit(1)
}

const chain = defineChain({
  id: 65690,
  name: "MESHGRID",
  nativeCurrency: { name: "Mesh", symbol: "MESH", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
})

// --- Compile ---------------------------------------------------------------

const source = readFileSync(join(__dirname, "../contracts/MeshRegistry.sol"), "utf8")

const input = {
  language: "Solidity",
  sources: { "MeshRegistry.sol": { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
}

console.log("[deploy] compiling MeshRegistry.sol ...")
const output = JSON.parse(solc.compile(JSON.stringify(input)))

if (output.errors) {
  const fatal = output.errors.filter((e) => e.severity === "error")
  for (const e of output.errors) console.log(e.formattedMessage)
  if (fatal.length) process.exit(1)
}

const artifact = output.contracts["MeshRegistry.sol"].MeshRegistry
const abi = artifact.abi
const bytecode = "0x" + artifact.evm.bytecode.object

// --- Deploy ----------------------------------------------------------------

const account = privateKeyToAccount(PK.startsWith("0x") ? PK : `0x${PK}`)
const wallet = createWalletClient({ account, chain, transport: http(RPC_URL) })
const publicClient = createPublicClient({ chain, transport: http(RPC_URL) })

console.log(`[deploy] deploying from ${account.address} to ${RPC_URL} (chainId 65690) ...`)
const hash = await wallet.deployContract({ abi, bytecode, args: [] })
console.log(`[deploy] tx: ${hash}`)

const receipt = await publicClient.waitForTransactionReceipt({ hash })
console.log("")
console.log("  MeshRegistry deployed")
console.log("  ----------------------------------------------------")
console.log(`  address:  ${receipt.contractAddress}`)
console.log(`  block:    ${receipt.blockNumber}`)
console.log("")
console.log("  Set this in your project environment:")
console.log(`  MESH_REGISTRY_ADDRESS=${receipt.contractAddress}`)
console.log("")
