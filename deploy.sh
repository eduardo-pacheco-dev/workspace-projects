#!/usr/bin/env bash
set -euo pipefail

HOST="${VPS_HOST:?VPS_HOST not set}"
USER="${VPS_USER:?VPS_USER not set}"
KEY="${VPS_SSH_KEY:?VPS_SSH_KEY not set}"

echo "==> Installing dependencies..."
pnpm install

echo "==> Building..."
pnpm build

echo "==> Copying files to $USER@$HOST:~/myapp..."
rsync -avz --delete \
  -e "ssh -i $KEY" \
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
ssh -i "$KEY" "$USER@$HOST" << 'REMOTE'
  set -e
  cd ~/myapp
  pnpm install --prod
  pm2 restart ecosystem.config.js
  pm2 save
REMOTE

echo "==> Done!"
