#!/bin/sh
set -e

DATADIR=${DATADIR:-/data}
GENESIS=${GENESIS:-/genesis/genesis.json}

# Initialize the datadir from genesis exactly once.
if [ ! -d "$DATADIR/geth/chaindata" ]; then
  echo "[meshgrid] initializing chain 65690 from $GENESIS"
  geth init --datadir "$DATADIR" "$GENESIS"
fi

echo "[meshgrid] starting geth (chainId 65690) with HTTP + WS RPC"
exec geth \
  --datadir "$DATADIR" \
  --networkid 65690 \
  --http --http.addr 0.0.0.0 --http.port 8545 \
  --http.api "eth,net,web3,txpool,debug" \
  --http.corsdomain "*" --http.vhosts "*" \
  --ws --ws.addr 0.0.0.0 --ws.port 8546 \
  --ws.api "eth,net,web3,txpool" --ws.origins "*" \
  --nodiscover \
  --dev.period 2 \
  "$@"
