# Full Skill Catalog

Pick what you need. Every skill works standalone. `$swarm` multiplies any of them.

## Composition Map — What Calls What

```
$evolve ──► $rpi (per fitness gap, loops until goals met)
    │
    ▼
$rpi ──► $research → $plan → $pre-mortem → $crank → $vibe → $post-mortem
    │
    ▼
$crank ──► $swarm ──► $implement (×N per wave, fresh context each)
    │
    ▼
$swarm ──► parallelize anything: research, brainstorm, implement, council
    │
    ▼
┌─────────────────────────────────────────────────┐
│               STANDALONE PRIMITIVES             │
│                                                 │
│  $research ─────► may trigger $brainstorm       │
│  $brainstorm ───► may spawn $swarm              │
│  $plan ─────────► may call $pre-mortem          │
│  $implement ────► research + plan + build + vibe│
│  $vibe ─────────► $complexity + $council        │
│  $pre-mortem ───► $council (failure simulation) │
│  $post-mortem ──► $council + knowledge lifecycle│
│  $council ──────► parallel judges (multi-model) │
└─────────────────────────────────────────────────┘
```

## Skills by Category

```
THE MULTIPLIER                   VALIDATE
$swarm      - parallelize        $vibe        - code quality check
              anything           $pre-mortem  - plan validation
                                 $post-mortem - full retro + knowledge lifecycle
BUILD                            $council     - multi-model judges
$implement  - single task        $release     - tag + changelog
$crank      - multi-issue epic
$plan       - decompose work     KNOWLEDGE
$rpi        - full lifecycle     $knowledge   - query learnings
                                 $retro       - quick-capture
EXPLORE                          $post-mortem - full retro + knowledge
$research   - deep dive          $trace       - decision provenance
$brainstorm - explore ideas      $flywheel    - health monitoring
$bug-hunt   - investigate
$complexity - code metrics       SESSION
$doc        - generate docs      $handoff     - save + resume
                                 $recover     - restore after compaction
PRODUCT                          $status      - dashboard
$product    - define mission
$goals      - fitness specs
$evolve     - goal-driven loop   CONTRIBUTE (upstream PRs)
$readme     - generate README    $pr-research, $pr-plan, $pr-implement
                                 $pr-validate, $pr-prep, $pr-retro
META                             $oss-docs
$quickstart - onboarding
$update     - reinstall skills   CROSS-VENDOR
$converter  - export to Codex,   $codex-team  - parallel Codex agents
              Cursor             $openai-docs - OpenAI docs lookup
```
