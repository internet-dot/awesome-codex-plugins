---
name: oc-codex-setup
description: Install or refresh oc-codex-multi-auth in OpenCode, choose the right config mode, and verify Codex OAuth with ChatGPT Plus or Pro access.
---

# oc-codex-setup

Use this skill when the user wants to install, reinstall, upgrade, or troubleshoot `oc-codex-multi-auth` in OpenCode.

## Default install

```bash
npx -y oc-codex-multi-auth@latest
```

Use this when the user wants the full catalog config, including base entries like `gpt-5.5` and explicit preset entries like `gpt-5.5-medium`.

## Modern compact install

```bash
npx -y oc-codex-multi-auth@latest --modern
```

Use this on OpenCode `v1.0.210+` when the user wants the compact variant-based config.

## Login and verification

1. Run `opencode auth login`.
2. Run a quick verification request:

```bash
opencode run "Explain this repository" --model=openai/gpt-5.5-medium
```

3. For a Codex-focused workflow, try:

```bash
opencode run "Refactor the retry logic and update the tests" --model=openai/gpt-5-codex --variant=high
```

## Troubleshooting

- Confirm `"plugin": ["oc-codex-multi-auth"]` is present in the OpenCode config.
- Re-run `opencode auth login` if tokens expired or the wrong workspace was selected.
- Inspect `~/.opencode/logs/codex-plugin/` after a failed request.
- Set `ENABLE_PLUGIN_REQUEST_LOGGING=1` for deeper request logging.
- For full docs, see `docs/getting-started.md`, `docs/configuration.md`, `docs/troubleshooting.md`, and `docs/faq.md`.

## Usage boundaries

This project is for personal development use with your own ChatGPT Plus or Pro subscription. For production or shared services, prefer the OpenAI Platform API.
