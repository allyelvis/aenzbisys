# MESHGRID Chain (chainId 65690)

Tooling to run the custom EVM chain defined in `genesis.json` and expose a
JSON-RPC endpoint the dashboard reads from.

## Files

- `genesis.json` — your genesis, verbatim. chainId **65690**, `london`/post-merge
  (`terminalTotalDifficultyPassed: true`), gas limit `0x5f5e0ff` (~100M), and a
  pre-funded account `0x1b6f312ce04866c793177264d73cf2a0141702e3`
  (1,000,000,000 MESH).
- `entrypoint.sh` — inits the datadir from genesis (once) and runs geth with HTTP
  (`:8545`) + WS (`:8546`) RPC.
- `docker-compose.yml` — two services: the canonical `meshgrid-node` and a
  `dev` quick-start.

## Option A — Quick start (recommended for the demo)

Instant blocks + an auto-unlocked, pre-funded dev account. Great for seeing the
dashboard advance in real time:

```bash
cd chain
docker compose --profile dev up meshgrid-dev
```

RPC: `http://localhost:8545` (HTTP), `ws://localhost:8546` (WS).

## Option B — Canonical chainId 65690 node

Initializes from your exact `genesis.json`:

```bash
cd chain
docker compose up meshgrid-node
```

> Note: this genesis is **post-merge** (`terminalTotalDifficultyPassed: true`),
> so execution-layer geth alone will not seal new blocks — a post-merge network
> needs a consensus-layer (CL) client driving the Engine API. The node will serve
> state and RPC (chainId, balances, contract reads/calls) correctly; to produce
> blocks either (a) pair it with a CL such as Lighthouse/Prysm against this
> genesis, or (b) use Option A for local development.

## Without Docker (native geth)

```bash
geth init --datadir ./data genesis.json
geth --datadir ./data --networkid 65690 \
  --http --http.addr 0.0.0.0 --http.api eth,net,web3,txpool,debug \
  --http.corsdomain '*' --ws --ws.addr 0.0.0.0 --ws.api eth,net,web3
```

## Point the dashboard at it

Set these env vars for the Next.js app (see project root `.env.example`):

```bash
RPC_URL=http://localhost:8545          # server-side RPC the API route uses
MESH_REGISTRY_ADDRESS=0x...            # from the deploy step (../scripts/deploy.mjs)
```

## Exposing to a deployed app

A deployed Vercel app cannot reach `localhost`. Expose your node with a tunnel
(`cloudflared tunnel --url http://localhost:8545`) or host it, then set `RPC_URL`
to that public HTTPS URL in the project's environment variables.
