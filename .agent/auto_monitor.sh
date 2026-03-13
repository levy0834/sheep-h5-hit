#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

now() { date '+%Y-%m-%d %H:%M:%S'; }

{
  echo "[auto_monitor] $(now)"
  echo "--- git status ---"
  git status --short --branch || true
  echo "--- latest mtimes (src/design-art) ---"
  find src design-art -type f -print0 2>/dev/null | xargs -0 stat -f '%Sm %N' -t '%Y-%m-%d %H:%M:%S' | sort -r | head -20 || true
  echo "--- iteration state (tail) ---"
  if [ -f .agent/iteration-state.json ]; then
    python3 - <<'PY'
import json
from pathlib import Path
p=Path('.agent/iteration-state.json')
data=json.loads(p.read_text())
print('state:', data.get('status',{}).get('state'))
print('current_iteration:', data.get('status',{}).get('current_iteration'))
its=data.get('iterations',[])
if its:
  last=its[-1]
  print('last_result:', last.get('result'))
  print('last_goal:', (last.get('goal') or '')[:160])
  print('ended_at:', last.get('ended_at'))
PY
  else
    echo "(missing .agent/iteration-state.json)"
  fi
  echo "--- codex processes ---"
  ps aux | egrep -i 'codex exec|python3 .*run_iteration_loop|codex-safe exec' | grep -v egrep || true
  echo
} | tee .agent/auto_monitor.log
