#!/usr/bin/env bash
# ============================================================================
# orion-publish.sh — Publica uma nova Fase do Projeto Orion
# Automatiza: commit + push (master + espelho main) + tag fase-N + release GitHub
#
# USO:
#   ./orion-publish.sh <FASE> "Mensagem do commit"
#   Ex: ./orion-publish.sh 8 "feat: Fase 8 - Modulo Indicadores + Construtor"
#
# REQUISITOS:
#   - .github_token com um GitHub PAT (scope 'repo') na raiz do projeto
# ===========================================================================
set -euo pipefail

REPO="clodoaldosilva608/Projeto-Orion"
BRANCH="master"
DEFAULT_REMOTE_BRANCH="main"

if [ "$#" -lt 2 ]; then
  echo "USO: ./orion-publish.sh <FASE> \"Mensagem do commit\"" >&2
  exit 1
fi
FASE="$1"
MSG="$2"
TAG="fase-${FASE}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOKEN_FILE="${SCRIPT_DIR}/.github_token"
if [ ! -f "$TOKEN_FILE" ]; then
  echo "ERRO: .github_token nao encontrado em ${SCRIPT_DIR}" >&2
  exit 1
fi
TOKEN="$(tr -d '[:space:]' < "$TOKEN_FILE")"

# URL remota com token embutido (funciona em ambientes sem credential helper)
AUTH_REMOTE="https://x-access-token:${TOKEN}@github.com/${REPO}.git"

# --- 1. commit ---
echo "==> git add ."
git add .
echo "==> git commit -m \"${MSG}\""
git -c user.name="clodoaldosilva608" -c user.email="clodoaldosilva608@users.noreply.github.com" commit -m "${MSG}" \
  || { echo "Nada para commitar (working tree limpa?)."; }

# --- 2. push master + manter main espelhada ---
echo "==> git push origin ${BRANCH}"
git -c http.version=HTTP/1.1 push "${AUTH_REMOTE}" "${BRANCH}"
echo "==> espelha ${BRANCH} -> ${DEFAULT_REMOTE_BRANCH} (branch padrao do GitHub)"
git -c http.version=HTTP/1.1 push "${AUTH_REMOTE}" "${BRANCH}:${DEFAULT_REMOTE_BRANCH}" \
  || echo "(aviso: nao foi possivel espelhar ${DEFAULT_REMOTE_BRANCH})"

# --- 3. tag ---
echo "==> criando tag ${TAG}"
git tag -a "${TAG}" -m "${MSG}"
echo "==> git push --tags"
git -c http.version=HTTP/1.1 push "${AUTH_REMOTE}" --tags

# --- 4. release via API do GitHub ---
NAME="Fase ${FASE} - ${MSG#*: }"
BODY="*${MSG}*

Publicado automaticamente via orion-publish.sh.

- Tag: ${TAG}
- Branch: ${BRANCH}"

echo "==> criando Release ${TAG} no GitHub"
RESP=$(curl -sS -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Content-Type: application/json" \
  -d "$(python -c "import json,sys; print(json.dumps({'tag_name':'''${TAG}''','name':'''${NAME}''','body':'''${BODY}''','draft':False,'prerelease':False}))")" \
  "https://api.github.com/repos/${REPO}/releases")

if echo "$RESP" | grep -q '"html_url"'; then
  URL=$(echo "$RESP" | python -c "import json,sys; print(json.load(sys.stdin).get('html_url',''))" 2>/dev/null || echo "")
  echo "==> Release criado: ${URL}"
else
  echo "==> ERRO ao criar release (resposta abaixo):"
  echo "$RESP" | head -c 500
fi

echo "CONCLUIDO: ${TAG}"
