#!/usr/bin/env bash
# flowgrid installer (Linux / WSL) — git clone + npm/pnpm build (needs Node ≥ 22).
#
#   curl -fsSL https://raw.githubusercontent.com/ShanYuCoder/flowgrid/main/install.sh | bash
#
# Upgrade: re-run the same command.
# Uninstall: bash install.sh --uninstall
#
# Env:
#   FLOWGRID_REPO          default: ShanYuCoder/flowgrid
#   FLOWGRID_INSTALL_DIR   default: ~/.flowgrid-cli
#   FLOWGRID_BIN_DIR       default: ~/.local/bin
#   FLOWGRID_REF           git ref (default: main)
set -euo pipefail

REPO="${FLOWGRID_REPO:-${FORGEKIT_REPO:-ShanYuCoder/flowgrid}}"
INSTALL_DIR="${FLOWGRID_INSTALL_DIR:-${FORGEKIT_INSTALL_DIR:-$HOME/.flowgrid-cli}}"
BIN_DIR="${FLOWGRID_BIN_DIR:-${FORGEKIT_BIN_DIR:-$HOME/.local/bin}}"

if [ -z "${FLOWGRID_REF:-${FORGEKIT_REF:-}}" ]; then
  LATEST_TAG=$(git ls-remote --tags --sort="v:refname" "https://github.com/$REPO.git" | grep -v "\^{}" | tail -n1 | awk -F/ '{print $3}' || true)
  if [ -n "$LATEST_TAG" ]; then
    REF="$LATEST_TAG"
  else
    REF="main"
  fi
else
  REF="${FLOWGRID_REF:-${FORGEKIT_REF}}"
fi

if [ "${1:-}" = "--uninstall" ]; then
  rm -f "$BIN_DIR/flowgrid" "$BIN_DIR/flowgrid-mcp" "$BIN_DIR/forgekit" "$BIN_DIR/forgekit-mcp"
  rm -rf "$INSTALL_DIR"
  
  # Remove path from shell configs
  for rc in "$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.bash_profile"; do
    if [ -f "$rc" ] && (grep -q "# --- flowgrid start ---" "$rc" || grep -q "# --- forgekit start ---" "$rc"); then
      sed -i.bak '/# --- flowgrid start ---/,/# --- flowgrid end ---/d' "$rc"
      sed -i.bak '/# --- forgekit start ---/,/# --- forgekit end ---/d' "$rc"
      rm -f "${rc}.bak"
      echo "Removed flowgrid PATH from $rc"
    fi
  done
  
  echo "flowgrid uninstalled ($INSTALL_DIR)."
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  echo "flowgrid: Node.js ≥ 22 required (node not found)." >&2
  exit 1
fi
if ! command -v git >/dev/null 2>&1; then
  echo "flowgrid: git required." >&2
  exit 1
fi

echo "Installing flowgrid from github.com/$REPO @$REF → $INSTALL_DIR"

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

git clone --depth 1 --branch "$REF" "https://github.com/$REPO.git" "$tmpdir/src"

rm -rf "$INSTALL_DIR"
mkdir -p "$(dirname "$INSTALL_DIR")"
mv "$tmpdir/src" "$INSTALL_DIR"

cd "$INSTALL_DIR"
if command -v pnpm >/dev/null 2>&1; then
  pnpm install
  pnpm build
elif command -v npm >/dev/null 2>&1; then
  npm install
  npm run build
else
  echo "flowgrid: pnpm or npm required." >&2
  exit 1
fi

mkdir -p "$BIN_DIR"
ln -sf "$INSTALL_DIR/bin/flowgrid.mjs" "$BIN_DIR/flowgrid"
ln -sf "$INSTALL_DIR/bin/flowgrid-mcp.mjs" "$BIN_DIR/flowgrid-mcp"
ln -sf "$INSTALL_DIR/bin/flowgrid.mjs" "$BIN_DIR/forgekit"
ln -sf "$INSTALL_DIR/bin/flowgrid-mcp.mjs" "$BIN_DIR/forgekit-mcp"
chmod +x "$INSTALL_DIR/bin/"*.mjs

echo "Linked $BIN_DIR/flowgrid"

case ":$PATH:" in
  *":$BIN_DIR:"*) ;;
  *)
    echo ""
    echo "$BIN_DIR is not on PATH. Attempting to add to shell config..."
    ADDED=0
    for rc in "$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.bash_profile"; do
      if [ -f "$rc" ]; then
        if ! grep -q "$BIN_DIR" "$rc"; then
          echo "" >> "$rc"
          echo "# --- flowgrid start ---" >> "$rc"
          echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$rc"
          echo "# --- flowgrid end ---" >> "$rc"
          echo "  -> Added to $rc"
          ADDED=1
        fi
      fi
    done
    
    if [ "$ADDED" -eq 1 ]; then
      echo "  Please restart your terminal or run 'source ~/.zshrc' (or your respective shell config) to apply."
    else
      echo "  Could not automatically add to shell config. Please add manually:"
      echo "  export PATH=\"$BIN_DIR:\$PATH\""
    fi
    ;;
esac

echo ""
echo "Done. Next:"
echo "  flowgrid"
