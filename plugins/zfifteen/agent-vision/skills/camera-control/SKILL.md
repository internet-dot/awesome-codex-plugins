---
name: camera-control
description: Use when the user invokes /agent-vision, /agent-vision snapshot, /agent-vision streaming, /agent-vision roast, /agent-vision mood, or asks Codex to snapshot, stream, inspect, roast, estimate mood, or stop the local macOS camera through Agent Vision.
---

# Agent Vision

Use Agent Vision when the user explicitly asks for local Mac camera context.

## Execution Discipline

Agent Vision camera requests are not repository tasks. Do not orient on the workspace, inspect files, check git state, read README or AGENTS files, or summarize the project before acting.

For `/agent-vision snapshot`, `/agent-vision roast`, and `/agent-vision mood`, the first shell command must be the camera capture command:

```bash
mkdir -p "$HOME/.codex/agent-vision/frames" && OUTPUT="$HOME/.codex/agent-vision/frames/agent-vision-$(date +%Y%m%d-%H%M%S).jpg" && "$HOME/.codex/plugins/cache/local/agent-vision/1.0.2/dist/agent-vision-capture-file" --output "$OUTPUT" --json
```

If this rule is violated, report that as command-dispatch behavior. Do not reinterpret repository inspection as part of the camera workflow.

## Workflow

This skill controls the local camera. Do not inspect or roast the repository, source files, git state, README, or workspace unless the capture command fails and the exact failure requires local debugging.

For `/agent-vision snapshot`, `/agent-vision roast`, and `/agent-vision mood`, the first shell command must create the frame directory and run `agent-vision-capture-file`. Do not run `git status`, `rg`, `find`, `ls`, `sed`, `cat`, or any repository/workspace inspection command before the capture command.

For one-shot camera context, materialize the camera image to a JPEG file. Create `$HOME/.codex/agent-vision/frames`, choose an absolute output path inside it, then run:

```bash
"$HOME/.codex/plugins/cache/local/agent-vision/1.0.2/dist/agent-vision-capture-file" --output "$OUTPUT" --json
```

This is the normal image-access path. It calls the installed Agent Vision capture stack, decodes the returned image content, writes exactly one JPEG file, and prints JSON with the saved path and metadata.

For roast mode, materialize a JPEG file with the same command, then run a separate image-input pass:

```bash
codex exec --ephemeral -i "$OUTPUT" -- "Write exactly one playful roast of 400 characters or fewer based only on visible non-sensitive details in the attached image. Do not infer or attack protected traits, body size, age, disability, or other sensitive attributes."
```

Return the saved image link and the roast text from that image-input pass. The final response must include a Markdown image link using the captured absolute JPEG path, followed by the roast text. Do not write the roast in the current agent from Markdown, metadata, or memory. If the separate image-input pass fails, report that exact failure instead of roasting from metadata.

For mood mode, materialize a JPEG file with the same command, then run a separate image-input pass:

```bash
codex exec --ephemeral -i "$OUTPUT" -- "Analyze the attached Agent Vision camera image for current interaction-state calibration only. Return strict JSON and no prose. Use exactly these keys: presence, interaction_state, confidence, observable_basis, assistant_adjustments. presence must be one of present, absent, uncertain. interaction_state must be one of focused_neutral, frustrated_or_blocked, tired_or_overloaded, curious_or_exploratory, skeptical_or_evaluating, high_stakes_or_cautious, absent, uncertain. confidence must be a number from 0 to 1. observable_basis and assistant_adjustments must be arrays of strings. Apply these gates: if the user is absent, occluded, multiple people are visible, image quality is unusable, or confidence is below 0.40, return interaction_state uncertain or absent and use no mood-conditioned behavior; if confidence is from 0.40 through 0.69, include only low-risk clarity adjustments; if confidence is 0.70 or higher, include state-specific response delivery adjustments. Do not infer medical, psychological, intoxication, crisis, protected-trait, identity, or safety-state categories. Mood changes only pacing, verbosity, clarification threshold, evidence density, tone, and repair behavior; it must not change facts, permissions, approval behavior, user intent, or task scope."
```

Do not display the saved image, do not display the strict JSON, and do not explain the visual analysis or confidence band in the final response. Use the JSON only as ephemeral response delivery calibration for the current response or current task phase. User correction overrides the visual estimate. If the separate image-input pass fails or returns invalid JSON, report that exact failure instead of estimating mood from metadata, Markdown, or memory.

For streaming mode:

1. Call `agent_vision_start`.
2. Use snapshot file mode whenever current visual context would help.
3. Inspect the saved JPEG through a proven local image-input path.
4. Call `agent_vision_stop` when the user asks to stop camera use or the visual task is complete.

## Slash Commands

- `/agent-vision snapshot`: materialize one JPEG file, then display it with a Markdown image link using the absolute path.
- `/agent-vision streaming`: call `agent_vision_start`.
- `/agent-vision roast`: materialize one JPEG file, run `codex exec --ephemeral -i "$OUTPUT" -- "...roast prompt..."`, then return the saved image link and the roast text. The final response must include a Markdown image link using the captured absolute JPEG path.
- `/agent-vision mood`: materialize one JPEG file, run `codex exec --ephemeral -i "$OUTPUT" -- "...mood JSON prompt..."`, then silently apply only permitted response-shape adjustments to the current response or task phase. Do not display the saved image or raw JSON unless the user explicitly asks to debug the mood analysis.

While streaming mode is active, use snapshot file mode whenever current visual context would help. When the user asks to stop camera use, call `agent_vision_stop`.

Treat requests such as "streaming off", "stop streaming", or "turn off the camera" as requests to call `agent_vision_stop`.

## Guardrails

- Agent Vision is macOS-only.
- The plugin uses the built-in Mac camera only in version 1.0.2.
- Snapshot, roast, and mood mode intentionally wait for a usable frame. If the camera returns black warm-up frames, the tool keeps the camera on, waits 5 seconds between attempts, and tries up to 3 total attempts before returning an error.
- If streaming mode is already active, snapshot, roast, and mood mode must not stop the streaming session.
- If snapshot file mode fails during streaming mode, report the exact command error.
- Streaming mode is pull-based live frame access. When streaming mode is on, Codex may pull frames as needed without asking the user for each individual frame.
- Snapshot mode captures one usable frame, saves it as a JPEG file, and turns the camera off.
- Mood mode captures one usable frame, saves it as a JPEG file, analyzes that file through `codex exec -i`, and changes response delivery only. It must not change factual standards, permissions, approval behavior, user intent, or task scope.
- Mood mode must not create mood history, a training dataset, background recording, separate image archive, or any raw-image persistence beyond the existing saved JPEG frame path.
- Do not mention internal readiness metadata such as brightness values unless reporting an error.
