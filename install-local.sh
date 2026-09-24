#!/bin/sh

set -e

if [ "${1:-}" = "--uninstall" ]; then
  BIN_DIR="${FLOWGRID_BIN_DIR:-${FORGEKIT_BIN_DIR:-$HOME/.local/bin}}"
  rm -f "$BIN_DIR/flowgrid" "$BIN_DIR/flowgrid-mcp" "$BIN_DIR/forgekit" "$BIN_DIR/forgekit-mcp"
  echo "✅ Đã gỡ bỏ symlink của flowgrid khỏi $BIN_DIR"
  exit 0
fi

echo "🚀 Bắt đầu cài đặt FlowGrid local..."

echo "📦 Đang cài đặt dependencies..."
pnpm install

echo "🛠️ Đang build project..."
pnpm run build

echo "🔗 Đang link package vào ~/.local/bin..."
BIN_DIR="${FLOWGRID_BIN_DIR:-${FORGEKIT_BIN_DIR:-$HOME/.local/bin}}"
mkdir -p "$BIN_DIR"

ln -sf "$(pwd)/bin/flowgrid.mjs" "$BIN_DIR/flowgrid"
ln -sf "$(pwd)/bin/flowgrid-mcp.mjs" "$BIN_DIR/flowgrid-mcp"
ln -sf "$(pwd)/bin/flowgrid.mjs" "$BIN_DIR/forgekit"
ln -sf "$(pwd)/bin/flowgrid-mcp.mjs" "$BIN_DIR/forgekit-mcp"
chmod +x ./bin/*.mjs

echo "✅ Đã link $BIN_DIR/flowgrid và $BIN_DIR/flowgrid-mcp thành công!"
echo "💡 Bạn có thể sử dụng các lệnh 'flowgrid' và 'flowgrid-mcp' ở bất kỳ đâu trên terminal của bạn."
