# platform.sh — platform detection for session-orchestrator
# Sourced by callers, not executed directly.
# Detects Claude Code vs Codex CLI and exports normalized SO_* variables.

# detect_platform — sets SO_PLATFORM based on env vars or directory markers
detect_platform() {
  # Fast path: explicit env vars from the host CLI
  if [[ -n "${CLAUDE_PLUGIN_ROOT:-}" ]]; then
    SO_PLATFORM="claude"
    return
  fi
  if [[ -n "${CODEX_PLUGIN_ROOT:-}" ]]; then
    SO_PLATFORM="codex"
    return
  fi
  if [[ -n "${CURSOR_RULES_DIR:-}" ]]; then
    SO_PLATFORM="cursor"
    return
  fi

  # Slow path: walk up from CWD looking for plugin marker directories
  local dir
  dir="$(pwd)"
  while [[ "$dir" != "/" ]]; do
    if [[ -d "$dir/.claude-plugin" ]]; then
      SO_PLATFORM="claude"
      return
    fi
    if [[ -d "$dir/.codex-plugin" ]]; then
      SO_PLATFORM="codex"
      return
    fi
    if [[ -d "$dir/.cursor/rules" ]]; then
      SO_PLATFORM="cursor"
      return
    fi
    dir="$(dirname "$dir")"
  done

  # Default to claude for backward compatibility
  SO_PLATFORM="claude"
}

# resolve_plugin_root — sets SO_PLUGIN_ROOT to the session-orchestrator plugin directory
resolve_plugin_root() {
  if [[ "$SO_PLATFORM" == "claude" && -n "${CLAUDE_PLUGIN_ROOT:-}" && -d "$CLAUDE_PLUGIN_ROOT" ]]; then
    SO_PLUGIN_ROOT="$CLAUDE_PLUGIN_ROOT"
    return
  fi
  if [[ "$SO_PLATFORM" == "codex" && -n "${CODEX_PLUGIN_ROOT:-}" && -d "$CODEX_PLUGIN_ROOT" ]]; then
    SO_PLUGIN_ROOT="$CODEX_PLUGIN_ROOT"
    return
  fi
  if [[ "$SO_PLATFORM" == "cursor" && -n "${CURSOR_RULES_DIR:-}" && -d "$CURSOR_RULES_DIR" ]]; then
    SO_PLUGIN_ROOT="$CURSOR_RULES_DIR"
    return
  fi

  # Walk up from this script's location looking for skills/ directory
  local dir
  dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  while [[ "$dir" != "/" ]]; do
    if [[ -f "$dir/plugin.json" || -d "$dir/skills" ]]; then
      SO_PLUGIN_ROOT="$dir"
      return
    fi
    dir="$(dirname "$dir")"
  done

  SO_PLUGIN_ROOT=""
}

# resolve_project_dir — sets SO_PROJECT_DIR to the project root
resolve_project_dir() {
  # Trust the platform-specific env var first
  if [[ -n "${CLAUDE_PROJECT_DIR:-}" ]]; then
    SO_PROJECT_DIR="$CLAUDE_PROJECT_DIR"
    return
  fi
  if [[ -n "${CODEX_PROJECT_DIR:-}" ]]; then
    SO_PROJECT_DIR="$CODEX_PROJECT_DIR"
    return
  fi
  if [[ -n "${CURSOR_PROJECT_DIR:-}" ]]; then
    SO_PROJECT_DIR="$CURSOR_PROJECT_DIR"
    return
  fi

  # Walk up from CWD looking for platform markers
  local dir
  dir="$(pwd)"
  local config_file
  case "$SO_PLATFORM" in
    claude) config_file="CLAUDE.md" ;;
    codex)  config_file="AGENTS.md" ;;
    cursor) config_file="CLAUDE.md" ;;
    *)      config_file="CLAUDE.md" ;;
  esac

  while [[ "$dir" != "/" ]]; do
    if [[ -f "$dir/$config_file" || -d "$dir/.git" ]]; then
      SO_PROJECT_DIR="$dir"
      return
    fi
    dir="$(dirname "$dir")"
  done

  SO_PROJECT_DIR="$(pwd)"
}

# resolve_state_dir — sets SO_STATE_DIR to the platform-native transient state dir name
resolve_state_dir() {
  case "$SO_PLATFORM" in
    claude) SO_STATE_DIR=".claude" ;;
    codex)  SO_STATE_DIR=".codex" ;;
    cursor) SO_STATE_DIR=".cursor" ;;
    *)      SO_STATE_DIR=".claude" ;;
  esac
}

# resolve_config_file — sets SO_CONFIG_FILE to the platform config filename
resolve_config_file() {
  case "$SO_PLATFORM" in
    claude) SO_CONFIG_FILE="CLAUDE.md" ;;
    codex)  SO_CONFIG_FILE="AGENTS.md" ;;
    cursor) SO_CONFIG_FILE="CLAUDE.md" ;;
    *)      SO_CONFIG_FILE="CLAUDE.md" ;;
  esac
}

# resolve_shared_dir — sets SO_SHARED_DIR (always the same across platforms)
resolve_shared_dir() {
  SO_SHARED_DIR=".orchestrator"
}

# --- Auto-initialise when sourced ---

detect_platform
resolve_plugin_root
resolve_project_dir
resolve_state_dir
resolve_config_file
resolve_shared_dir

export SO_PLATFORM SO_PLUGIN_ROOT SO_PROJECT_DIR SO_STATE_DIR SO_CONFIG_FILE SO_SHARED_DIR
