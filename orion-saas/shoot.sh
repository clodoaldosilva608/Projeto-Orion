#!/usr/bin/env bash
# Runs the Orion SaaS dev server, captures all screenshots, then shuts down.
set -u

cd /home/z/my-project/orion-saas

export DATABASE_URL="postgresql://postgres.iwadvrvdlpdjiclwvsgw:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
export DIRECT_URL="postgresql://postgres.iwadvrvdlpdjiclwvsgw:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
export NEXT_PUBLIC_SUPABASE_URL="https://iwadvrvdlpdjiclwvsgw.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3YWR2cnZkbHBkamljbHd2c2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NDMyMzcsImV4cCI6MjEwMDUxOTIzN30.qesG4GuR_Dbif_VwOXinBsC5Md7psIh_g7mtJR3xpXQ"
export SUPABASE_SECRET_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3YWR2cnZkbHBkamljbHd2c2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDk0MzIzNywiZXhwIjoyMTAwNTE5MjM3fQ.SfIoLTgymdxUl7K7lovNTh8KZdgkicQE8Ufg6MzTPsc"

OUT=/home/z/my-project/download
mkdir -p "$OUT"

echo "[1/8] Starting dev server..."
bun run dev > /tmp/orion.log 2>&1 &
DEV_PID=$!

cleanup() {
  echo "[cleanup] killing dev server (pid $DEV_PID)"
  kill "$DEV_PID" 2>/dev/null
  pkill -f "next dev -p 3000" 2>/dev/null
  pkill -f "next-server" 2>/dev/null
}
trap cleanup EXIT

echo "[2/8] Waiting for server to be ready..."
for i in $(seq 1 40); do
  if curl -s -o /dev/null http://localhost:3000/; then
    echo "  ready after ${i}s"
    break
  fi
  sleep 1
done

# Extra compile time for first request
curl -s -o /dev/null http://localhost:3000/ && sleep 2

echo "[3/8] Screenshot: landing"
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser open http://localhost:3000/ >/dev/null 2>&1
sleep 4
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser screenshot --full "$OUT/landing.png" >/dev/null 2>&1
echo "  saved landing.png"

echo "[4/8] Screenshot: login -> dashboard"
agent-browser open http://localhost:3000/login >/dev/null 2>&1
sleep 4
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser snapshot -i >/tmp/snap.txt 2>&1
# Fill email + password using the input ids directly via eval fallback
agent-browser eval "document.getElementById('email').value='clodoaldosilva608@gmail.com'; document.getElementById('password').value='Silva88677488'; 'ok'" >/dev/null 2>&1
sleep 1
agent-browser eval "document.getElementById('btn-login').click(); 'clicked'" >/dev/null 2>&1
sleep 20
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser get url
agent-browser screenshot --full "$OUT/dashboard.png" >/dev/null 2>&1
echo "  saved dashboard.png"

echo "[5/8] Screenshot: produtos"
agent-browser open http://localhost:3000/produtos >/dev/null 2>&1
sleep 4
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser screenshot --full "$OUT/produtos.png" >/dev/null 2>&1
echo "  saved produtos.png"

echo "[6/8] Screenshot: deployments"
agent-browser open http://localhost:3000/deployments >/dev/null 2>&1
sleep 4
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser screenshot --full "$OUT/deployments.png" >/dev/null 2>&1
echo "  saved deployments.png"

echo "[7/8] Done. Files:"
ls -la "$OUT"

echo "[8/8] Shutting down."
