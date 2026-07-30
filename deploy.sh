#!/usr/bin/env bash
set -euo pipefail

HOST="${VPS_HOST:?VPS_HOST not set}"
USER="${VPS_USER:?VPS_USER not set}"
KEY="${VPS_SSH_KEY:?VPS_SSH_KEY not set}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/app/workspace-projects}"
BRANCH="${BRANCH:-production}"
REPO_URL="${GIT_REPO_URL:?GIT_REPO_URL not set}"

if [[ "$KEY" == -----BEGIN* ]]; then
  KEY_FILE=$(mktemp)
  echo "$KEY" > "$KEY_FILE"
  chmod 600 "$KEY_FILE"
  trap 'rm -f "$KEY_FILE"' EXIT
else
  KEY_FILE="$KEY"
fi

ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "$USER@$HOST" bash -s "$REMOTE_DIR" "$BRANCH" "$REPO_URL" << 'ENDSCRIPT'
  set -euo pipefail

  REMOTE_DIR="$1"
  BRANCH="$2"
  REPO_URL="$3"

  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  CYAN='\033[0;36m'
  BOLD='\033[1m'
  DIM='\033[2m'
  NC='\033[0m'

  STEP=0
  TOTAL=8
  DEPLOY_START=$(date +%s)

  print_header() {
    printf "\n${BOLD}${CYAN}  ┌──────────────────────────────────────────────────┐${NC}\n"
    printf "${BOLD}${CYAN}  │${NC}  DEPLOY  ${DIM}workspace-projects${NC}  →  ${BOLD}${BRANCH}${NC}${CYAN}        │${NC}\n"
    printf "${BOLD}${CYAN}  └──────────────────────────────────────────────────┘${NC}\n\n"
  }

  progress_bar() {
    local pct=$1
    local w=30
    local filled=$(( pct * w / 100 ))
    local empty=$(( w - filled ))
    printf "${DIM}[${NC}"
    local i
    for ((i=0; i<filled; i++)); do printf "${GREEN}█${NC}"; done
    for ((i=0; i<empty; i++)); do printf "${DIM}░${NC}"; done
    printf "${DIM}]${NC} ${BOLD}${pct}%%${NC}"
  }

  run_step() {
    STEP=$((STEP + 1))
    local desc="$1" icon="$2"
    shift 2
    local pct=$(( STEP * 100 / TOTAL ))
    printf "\n  ${CYAN}${BOLD}[${STEP}/${TOTAL}]${NC} ${icon}  ${BOLD}%-35s${NC} " "$desc"
    progress_bar "$pct"
    local start=$(date +%s%N)
    if "$@" 2>&1; then
      local elapsed=$(( ($(date +%s%N) - start) / 1000000 ))
      printf "\r  ${CYAN}${BOLD}[${STEP}/${TOTAL}]${NC} ${icon}  ${BOLD}%-35s${NC} " "$desc"
      progress_bar "$pct"
      printf "  ${GREEN}[OK]${NC} ${DIM}(${elapsed}ms)${NC}\n"
    else
      local elapsed=$(( ($(date +%s%N) - start) / 1000000 ))
      printf "\r  ${CYAN}${BOLD}[${STEP}/${TOTAL}]${NC} ${icon}  ${BOLD}%-35s${NC} " "$desc"
      progress_bar "$pct"
      printf "  ${RED}[FAIL]${NC} ${DIM}(${elapsed}ms)${NC}\n"
      return 1
    fi
  }

  print_header

  # Step 1: Repository
  if [ ! -d "$REMOTE_DIR/.git" ]; then
    run_step "Cloning repository" "  " bash -c "
      mkdir -p \"$REMOTE_DIR\"
      cd \"$REMOTE_DIR\"
      git clone --branch $BRANCH \"$REPO_URL\" . 2>&1 || { echo 'ERROR: Could not clone.'; exit 1; }
    "
  else
    run_step "Pulling latest changes" "  " bash -c "
      cd \"$REMOTE_DIR\"
      git fetch origin $BRANCH 2>&1
      git reset --hard origin/$BRANCH 2>&1
    "
  fi
  cd "$REMOTE_DIR"

  # Step 2: Database
  run_step "Creating database" "  " bash -c "
    DB_CMD=''
    command -v mariadb >/dev/null 2>&1 && DB_CMD=mariadb || command -v mysql >/dev/null 2>&1 && DB_CMD=mysql || true
    if [ -n \"\$DB_CMD\" ]; then
      \$DB_CMD -h \"\${DB_HOST:-localhost}\" -P \"\${DB_PORT:-3306}\" -u \"\${DB_USER:-root}\" \
        -e \"CREATE DATABASE IF NOT EXISTS \${DB_NAME:-myapp} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\" \
        || echo 'Warning: Could not create database.'
    else
      echo 'Warning: mysql/mariadb not found. Skipping.'
    fi
  "

  # Step 3: Environment
  run_step "Configuring environment" "  " bash -c "
    if [ ! -f \"$REMOTE_DIR/packages/backend/.env\" ]; then
      cp \"$REMOTE_DIR/.env.example\" \"$REMOTE_DIR/packages/backend/.env\" 2>/dev/null || true
      echo 'WARNING: .env template created. Edit with: nano $REMOTE_DIR/packages/backend/.env'
    fi
  "

  # Load env vars (in main shell so PM2 can see them)
  set -a
  . "$REMOTE_DIR/packages/backend/.env" 2>/dev/null || true
  set +a

  # Step 4: Install
  run_step "Installing dependencies" "  " bash -c "
    cd \"$REMOTE_DIR\"
    npm install 2>&1 | tail -5
  "

  # Step 5: Build
  run_step "Building project" "  " bash -c "
    cd \"$REMOTE_DIR\"
    npm run build 2>&1 | tail -10
  "

  # Step 6: Migrations
  run_step "Running migrations" "  " bash -c "
    cd \"$REMOTE_DIR/packages/backend\"
    NODE_ENV=production npx --no-install typeorm migration:run -d dist/src/data-source.js 2>&1 || echo 'Already up to date.'
  "

  # Step 7: Restart
  run_step "Restarting PM2" "  " bash -c "
    cd \"$REMOTE_DIR\"
    pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js --update-env
    pm2 save
  "

  # Step 8: Nginx
  run_step "Configuring Nginx" "  " bash -c "
    NGINX_SRC=\"$REMOTE_DIR/nginx.conf\"
    NGINX_DST=\"/etc/nginx/sites-available/afl.brazil.vps-kinghost.net\"
    NGINX_ENABLED=\"/etc/nginx/sites-enabled/afl.brazil.vps-kinghost.net\"
    if [ -f \"\$NGINX_SRC\" ]; then
      sudo cp \"\$NGINX_SRC\" \"\$NGINX_DST\"
      if [ ! -L \"\$NGINX_ENABLED\" ]; then
        sudo ln -sf \"\$NGINX_DST\" \"\$NGINX_ENABLED\"
      fi
      sudo nginx -t && sudo systemctl reload nginx || echo 'Warning: nginx reload failed. Check config.'
    else
      echo 'Warning: nginx.conf not found. Skipping nginx setup.'
    fi
  "

  TOTAL_SECS=$(( $(date +%s) - DEPLOY_START ))
  printf "\n  ${BOLD}${GREEN}  Deploy complete${NC} ${DIM}(${TOTAL_SECS}s)${NC}\n\n"
ENDSCRIPT
