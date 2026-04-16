# Bootstrap Intensity Heuristic

> Tier + archetype recommendation logic for the bootstrap skill.
> Called from `skills/bootstrap/SKILL.md` Phase 1.

## Outputs

After executing this algorithm, report:

- `RECOMMENDED_TIER`: `fast` | `standard` | `deep`
- `RECOMMENDED_ARCHETYPE`: `static-html` | `node-minimal` | `nextjs-minimal` | `python-uv` | `null`
- `HEURISTIC_REASON`: one sentence explaining the recommendation (shown to user)
- `ARCHETYPE_CONFIDENCE`: `high` | `low` (used to decide whether to ask the optional second question)

## Step 1: Primary Tier Signal (from user prompt)

Scan the user's first prompt for these keyword groups. Match is case-insensitive; German and English terms are equivalent.

| Keywords | Tier |
|----------|------|
| demo, prototype, prototyp, spike, playground, spielwiese, test, versuch, probier, ausprobier, mini, schnell, quick, klein, small, simple, einfach, poc, proof-of-concept, draft, skizze, scratch | `fast` |
| mvp, minimum-viable, produkt, product, saas, app, application, service, platform, plattform, tool, fullstack, webapp, api, backend, frontend | `standard` |
| kunden, customer, production, produktiv, team, enterprise, skalierbar, scalable, compliance, soc2, gdpr, dsgvo, multi-tenant, long-term, langfristig, langlebig | `deep` |

**Match priority:** If multiple groups match, use the highest-intensity tier that matched. If no group matches → default to `standard`.

## Step 2: Secondary Signals (adjust recommendation)

Apply these modifiers after Step 1. Each modifier can shift the recommendation up or down one level.

| Signal | Adjustment |
|--------|-----------|
| Repo name starts with `demo-`, `playground-`, `scratch-`, `poc-`, `test-`, `spike-` | Force `fast`, regardless of prompt |
| Repo name starts with `demo-`, `playground-` AND prompt contains production signals | Hold at `fast` (name wins) |
| Prompt mentions specific integrations: Stripe, Auth0, Supabase, Postgres, Redis, Firebase, Clerk, Prisma | Minimum `standard` (shift up if currently `fast`) |
| Prompt mentions CI, pipeline, monitoring, observability, Sentry, Datadog, alerting | Shift up one level (fast→standard, standard→deep) |
| Prompt mentions CODEOWNERS, branch protection, multiple contributors, team review | Shift to `deep` |
| `plan-baseline-path` is configured and user names a specific baseline archetype | Minimum `standard` |
| Existing repo has `package.json`, `pyproject.toml`, or `Cargo.toml` already committed | Minimum `standard` (repo is already structured) |
| Existing repo has a CI file (`.github/workflows/`, `.gitlab-ci.yml`) | Minimum `deep` |

## Step 3: Resolve Final Tier

After applying all modifiers, clamp the result to `fast` | `standard` | `deep`.

Set `HEURISTIC_REASON` to one sentence that references the signals that drove the recommendation:

Examples:
- *"Basierend auf 'animiertes Glücksrad' (Signal: Demo/Spike) empfehle ich Fast."*
- *"Basierend auf 'SaaS mit Stripe-Integration' (Signal: Produkt + externe Integration) empfehle ich Standard."*
- *"Basierend auf 'Kundenprojekt mit Compliance-Anforderungen' (Signal: Production/Team) empfehle ich Deep."*

## Step 4: Archetype Selection

**Fast tier:** Always `RECOMMENDED_ARCHETYPE = null`, `ARCHETYPE_CONFIDENCE = high`. No stack needed — skip to output.

**Private path (baseline configured):** Always `RECOMMENDED_ARCHETYPE = null` at this stage. The baseline's own archetype selector is used during Standard/Deep scaffolding. Set `ARCHETYPE_CONFIDENCE = high`.

**Public path + Standard or Deep:** Scan the prompt for these signals:

| Prompt signals | Archetype | Confidence |
|----------------|-----------|------------|
| html, canvas, svg, animation, animier, static, statisch, landing, landingpage, visualization, visualisierung, glücksrad, wheel, chart, graph (no backend mention) | `static-html` | high |
| next.js, nextjs, react, saas fullstack, webapp, web app, app with frontend | `nextjs-minimal` | high |
| cli, command-line, script, utility, library, bibliothek, tool, npm package, node (no frontend) | `node-minimal` | high |
| python, py, data, daten, ml, machine learning, api (python context), django, fastapi, flask, pandas, numpy | `python-uv` | high |
| Ambiguous — prompt mentions multiple stacks, no clear frontend/backend split, or is too vague (e.g., "Ich brauche ein Projekt", "neues Repo", "etwas bauen") | `node-minimal` (safe default) | `low` |

When `ARCHETYPE_CONFIDENCE = low`, the bootstrap skill will ask a second `AskUserQuestion` to confirm the archetype. `node-minimal` is the pre-selected default for that question.

## Step 5: Output

Return all four values to `SKILL.md` Phase 1:

```
RECOMMENDED_TIER: fast | standard | deep
RECOMMENDED_ARCHETYPE: static-html | node-minimal | nextjs-minimal | python-uv | null
HEURISTIC_REASON: <one sentence>
ARCHETYPE_CONFIDENCE: high | low
```
