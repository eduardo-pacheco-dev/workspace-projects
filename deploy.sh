#!/usr/bin/env bash
set -euo pipefail

HOST="${VPS_HOST:?VPS_HOST not set}"
USER="${VPS_USER:?VPS_USER not set}"
KEY="${VPS_SSH_KEY:?VPS_SSH_KEY not set}"

# Se VPS_SSH_KEY for o conteúdo da chave (GitHub Action), escreve em temp file
if [[ "$KEY" == -----BEGIN* ]]; then
  KEY_FILE=$(mktemp)
  echo "$KEY" > "$KEY_FILE"
  chmod 600 "$KEY_FILE"
  trap 'rm -f "$KEY_FILE"' EXIT
else
  KEY_FILE="$KEY"
fi

echo "==> Installing dependencies..."
pnpm install

echo "==> Building..."
pnpm build

echo "==> Copying files to $USER@$HOST:~/myapp..."
rsync -avz --delete \
  -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
  package.json \
  pnpm-workspace.yaml \
  pnpm-lock.yaml \
  ecosystem.config.js \
  packages/backend/package.json \
  packages/backend/dist/ \
  packages/frontend/package.json \
  packages/frontend/dist/ \
  "$USER@$HOST:~/myapp/"

echo "==> Installing production deps and restarting..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "$USER@$HOST" << 'REMOTE'
  set -e
  cd ~/myapp
  pnpm install --prod
  pm2 restart ecosystem.config.js
  pm2 save
REMOTE

echo "==> Done!"
