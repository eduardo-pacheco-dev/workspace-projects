#!/usr/bin/env bash
set -euo pipefail

HOST="${VPS_HOST:?VPS_HOST not set}"
USER="${VPS_USER:?VPS_USER not set}"
KEY="${VPS_SSH_KEY:?VPS_SSH_KEY not set}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/app/workspace-projects}"

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
npm install

echo "==> Building..."
npm run build

echo "==> Copying files to $USER@$HOST:$REMOTE_DIR..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "$USER@$HOST" "mkdir -p $REMOTE_DIR"
rsync -avz --delete \
  -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
  . \
  --exclude node_modules \
  --exclude pnpm-lock.yaml \
  --exclude .git \
  --exclude .gitignore \
  "$USER@$HOST:$REMOTE_DIR/"

echo "==> Installing production deps and restarting..."
REMOTE_SCRIPT=$(cat << ENDSCRIPT
  set -e
  cd $REMOTE_DIR

  echo "==> Creating database if not exists..."
  DB_CMD=""
  command -v mariadb >/dev/null 2>&1 && DB_CMD="mariadb" || command -v mysql >/dev/null 2>&1 && DB_CMD="mysql" || true
  if [ -n "\$DB_CMD" ]; then
    \$DB_CMD -h "\${DB_HOST:-localhost}" -P "\${DB_PORT:-3306}" -u "\${DB_USER:-root}" -e "CREATE DATABASE IF NOT EXISTS \`\${DB_NAME:-myapp}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || echo "Warning: Could not create database. Continuing..."
  else
    echo "Warning: mysql/mariadb client not found. Skipping database creation."
  fi

  echo "==> Checking environment variables..."
  if [ ! -f "$REMOTE_DIR/packages/backend/.env" ]; then
    echo "WARNING: .env file not found!"
    echo "Create it manually:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    echo "Required: DB_PASSWORD, JWT_SECRET"
  fi

  echo "==> Installing production dependencies..."
  npm install --omit=dev

  echo "==> Running database migrations..."
  cd packages/backend
  NODE_ENV=production node ./node_modules/typeorm/cli.js migration:run -d dist/data-source.js 2>&1 || echo "Migration step skipped (may already be up to date)."
  cd $REMOTE_DIR

  echo "==> Restarting application..."
  pm2 restart ecosystem.config.js
  pm2 save
ENDSCRIPT
)

ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "$USER@$HOST" "$REMOTE_SCRIPT"

echo "==> Done!"
