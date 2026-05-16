# AGENTS.md — Personal Data Protection Compliance Skill

> ⚠ **Reference material only — not legal advice.** See [DISCLAIMER.md](DISCLAIMER.md). Verify against the official statute and consult a qualified DPO / lawyer.
>
> **Source-text posture:** this skill **does not reproduce or republish any of the underlying statutes**. It provides engineer-facing interpretation and short attributed quotations of operative phrases under fair-dealing principles, with links to the official sources. If you intend to package or redistribute this content beyond similar engineering-reference use, see [DISCLAIMER.md § Copyright in source materials](DISCLAIMER.md#copyright-in-source-materials) — Malaysia's PNMB-published Act 709 / Act A1727 carry the strictest publisher's notice of the populated jurisdictions.

This file is the **Codex CLI / Cursor / Copilot-friendly entry point** to the same content surfaced to Claude Code via [`skills/personal-data-protection/SKILL.md`](skills/personal-data-protection/SKILL.md). The two files mirror each other; if you edit one, mirror the change to the other.

The skill content lives under [`skills/personal-data-protection/`](skills/personal-data-protection/) — required by the Claude Code plugin format. All internal links in this file point into that subdirectory.

If you are an agent and the user is working on code that touches personal data — signup, auth, consent, profile fields, notifications, friends, chat, media uploads, location, account deletion, data export, admin tooling, retention/cron, third-party processors, or privacy/T&C documents — follow the steps below.

## Step 1 — Identify the active jurisdiction(s)

**On first use in a project, check for `.pdp-compliance.json` at the project root.** If present, use `personalDataProtection.jurisdictions` and load only the matching `skills/personal-data-protection/jurisdictions/<code>/README.md` files. If absent, ask the user which jurisdiction(s) apply. The answer depends on where the application's *users* are located, not where the company is registered.

> *"Which personal-data-protection regimes does this application need to comply with? Pick all that apply: Singapore (PDPA 2012), Thailand (PDPA B.E. 2562), Indonesia (UU PDP 27/2022), Malaysia (PDPA 2010 with 2024 Amendments), Philippines (DPA / RA 10173). If users span multiple jurisdictions, pick all relevant — the strictest rule will usually win."*

Once the user has chosen, suggest creating `.pdp-compliance.json` in the project root so future sessions and local guardrails do not need to re-ask:

```json
{
  "personalDataProtection": {
    "jurisdictions": ["sg-pdpa"],
    "mode": "strictest-wins",
    "reviewPolicy": "warn"
  }
}
```

Then load only the relevant `skills/personal-data-protection/jurisdictions/<code>/README.md` files for the rest of the session. If the project cannot accept `.pdp-compliance.json`, persist the choice somewhere project-specific (a comment in the project's `AGENTS.md`, `CLAUDE.md`, or equivalent project-instruction file) so subsequent sessions don't need to re-ask.

| Code | Jurisdiction | Status |
|---|---|---|
| `sg-pdpa` | Singapore PDPA 2012 (post-2020 Amendments) | ✅ populated |
| `th-pdpa` | Thailand PDPA B.E. 2562 (2019) | ✅ populated |
| `id-pdp` | Indonesia UU PDP No. 27/2022 | ✅ populated |
| `my-pdpa` | Malaysia PDPA 2010 (with 2024 Amendments — Act A1727) | ✅ populated |
| `ph-dpa` | Philippines Data Privacy Act 2012 (RA 10173) | ✅ populated |
| `vn-pdpd` | Vietnam PDP Decree 13/2023/ND-CP | 🚧 planned for v0.5 (deferred — full PDP Law in draft) |

Cross-jurisdiction comparison lives in [`skills/personal-data-protection/jurisdictions/_index.md`](skills/personal-data-protection/jurisdictions/_index.md).

## Step 2 — Pick the right entry point

**You're starting work on something.** Open the matching checklist:

| Task | Checklist |
|---|---|
| Adding or modifying a feature that touches personal data | [`checklists/new-feature.md`](skills/personal-data-protection/checklists/new-feature.md) |
| Adding a column / field that holds personal data | [`checklists/new-data-field.md`](skills/personal-data-protection/checklists/new-data-field.md) |
| Adding a third-party SDK or vendor that will process personal data | [`checklists/new-vendor.md`](skills/personal-data-protection/checklists/new-vendor.md) |
| Responding to a security incident | [`checklists/breach-response.md`](skills/personal-data-protection/checklists/breach-response.md) |

**You want depth on a specific layer.** Open the matching layer file:

| Layer | What it covers |
|---|---|
| [01 Non-technical](skills/personal-data-protection/layers/01-non-technical.md) | DPO, staff acceptable-use, vendor contracts, complaint handling |
| [02 Architecture](skills/personal-data-protection/layers/02-architecture.md) | Data residency, isolation, encryption, secret handling, defence-in-depth |
| [03 Data model](skills/personal-data-protection/layers/03-data-model.md) | Consent records, audit records, retention markers, deletion conventions, PII inventory |
| [04 Controls and processes](skills/personal-data-protection/layers/04-controls-and-processes.md) | Access control, retention sweeps, log hygiene, breach detection signals |
| [05 Feature / UX](skills/personal-data-protection/layers/05-feature-ux.md) | Signup consent, settings, account deletion, data export, primer dialogs, EXIF strip |
| [06 Disclosure](skills/personal-data-protection/layers/06-disclosure.md) | Privacy policy, T&C, OS permission strings, contextual notices |
| [07 Operational](skills/personal-data-protection/layers/07-operational.md) | Incident response, retention sweeps, backups, vendor reviews, monitoring |

Layer files are **universal across all populated jurisdictions** — implementation patterns are shared. Jurisdiction-specific obligations live in `skills/personal-data-protection/jurisdictions/<code>/obligations/`.

## Critical thresholds (load-bearing on every PDP question)

These vary by jurisdiction — only the active one(s) apply.

| | Singapore PDPA | Thailand PDPA | Indonesia UU PDP | Malaysia PDPA | Philippines DPA |
|---|---|---|---|---|---|
| Breach notification window to authority | **3 calendar days** after assessing as notifiable (s26D(1)) | **72 hours** from awareness (s37(4)) | **72 hours** from awareness — to **both** subject AND regulator (Pasal 46(1)) | **72 hours** from discovery to Commissioner (s12B(1) + JPDP Guideline 25 Feb 2025); **7 days** post-Commissioner to affected subject | **72 hours** from knowledge / reasonable belief — to **both** NPC AND affected subject (§ 38 IRR + NPC Circular 16-03 § 12) |
| Significant-scale / risk threshold | ≥ 500 affected individuals | "Risk to rights and freedoms"; "high risk" triggers individual notification | Always notify subject; "certain circumstances" trigger public notification (Pasal 46(3)) | "Significant harm" triggers subject notification (s12B(2)) — no fixed scale threshold | Information-type-driven: SPI or identity-fraud-enabling info, acquired by unauthorised person, real risk of serious harm (NPC Circular 16-03 § 11); ≥ 100 persons triggers § 35 penalty aggravation |
| Maximum financial penalty cap | SGD 1M / 10% SG turnover (s48J(3)) | THB 1M / 3M / 5M tiered (s82–84); plus criminal up to 1 year + THB 1M (s79) | **2% of annual revenue per violation** (Pasal 57(3)); plus corporate criminal — fines up to 10× + suspension / **dissolution** (Pasal 70) | **RM 1M / 3 years per principle breach** (s5(2), raised by A1727 from RM 300k / 2y); per-offence not turnover-based; offences stack | **₱5M / 6 years** for combination or series (§ 33); **₱4M / 6 years** for SPI offences (§§ 25(b), 26(b)); ≥ 100 persons triggers maximum-period aggravation (§ 35) |
| Individual criminal liability | Yes (s48D/E/F) — SGD 5,000 / 2 years | Yes (s79–81); s81 catches director / manager **omissions**, broader than SG | Yes (Pasal 67–68): up to 6 years + IDR 6B; corporate liability extends to dissolution (Pasal 70(4)) | Yes (s130 unlawful collecting RM 500k / 3y); **s133 deeming liability** for directors / managers unless they prove no-knowledge + due diligence | Yes — **§ 34 makes responsible officers personally liable** for the prison terms of corporate offences (in addition to the corporate fine); **§ 30 concealment is its own offence** (1.5–5 years + ₱500k–₱1M) |

## How to use the layer ↔ obligation split

The pattern is **implement once, check against multiple jurisdictions**:

1. Identify what personal data the feature touches.
2. Walk the universal `skills/personal-data-protection/layers/` to plan the implementation (data model, access controls, UX, disclosure, operational).
3. For each active jurisdiction, walk `skills/personal-data-protection/jurisdictions/<code>/obligations/` to verify the implementation satisfies the statute-level obligations. Note where multiple jurisdictions disagree — usually the strictest rule controls.
4. Update the project's privacy policy / consent records / runbook as needed.

## Differences from the Claude Code version

The content (`layers/`, `jurisdictions/`, `checklists/`, `templates/`) is identical between agents. The only Claude-specific element is the `templates/pdp-nudge.sh.template` PostToolUse hook — Codex CLI does not have an equivalent hook system at time of writing, so that template is Claude-only. If you are using Codex, manual diligence on PDP-sensitive paths replaces the hook.

## Statute version + verification dates

Each jurisdiction's `README.md` records:
- Which version of the statute the obligation files reflect
- When the content was last verified against official sources
- Pending amendments to watch for

When statutes amend, this skill is updated and tagged. See [CHANGELOG.md](CHANGELOG.md) and pin to a specific tag if you need stability.
