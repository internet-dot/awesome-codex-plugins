# Council FAIL Patterns

> Compiled from 946 council verdicts across 14,753 production sessions. 124 FAIL verdicts analyzed for root causes.
> The #1 failure mode is missing mechanical verification — plans that rely on human vigilance instead of automated gates.

## Top 8 Failure Patterns (by frequency)

### 1. Missing Mechanical Verification (38% of FAILs)

Plans assume correctness through convention rather than enforcement.

**Signals:**
- Acceptance criteria say "verify" or "confirm" without a runnable command
- Integration points lack automated conformance checks
- Configuration boundaries have no consistency assertion
- Retry/fallback paths silently diverge from primary paths

**Pre-mortem check:** For each issue, can I run a command that returns 0 (pass) or non-zero (fail)? If not, the acceptance criteria are incomplete.

**Example:** ArgoCD CMP timeout mismatch — three layers (CMP, repo-server, application) with independent timeouts. No test verified alignment. Cache poisoning was invisible for weeks.

---

### 2. Self-Assessment Instead of External Gates (22% of FAILs)

Workers or agents declare their own work complete without independent validation.

**Signals:**
- Issues closed by the same person/agent who implemented them
- "It works on my machine" as the only validation
- Unit tests pass but no integration/E2E coverage
- Manual QA as the sole acceptance gate

**Pre-mortem check:** Is there a validation step performed by a different agent, tool, or process than the implementer?

**Example:** Unit tests found zero production bugs across all analyzed sessions. L3+ tests (integration, E2E) found all real bugs. Self-grading is confirmation bias.

---

### 3. Context Rot and Hallucination (15% of FAILs)

Long sessions or compacted contexts produce incorrect assumptions treated as facts.

**Signals:**
- Session context above 40% causes quality degradation
- Session context above 60% causes 99% information loss
- Multi-phase work in a single session (research -> plan -> implement)
- Learnings or references not verified against current code

**Pre-mortem check:** Does the plan enforce fresh sessions at phase boundaries? Are knowledge artifacts verified before citation?

**Example:** 7 hallucination-contaminated learning files found after a TDD sprint — forensic retro caught 23% baseline hallucination rate.

---

### 4. Propagation Surface Blindness (14% of FAILs)

Changes to shared abstractions (namespaces, directories, CLI surfaces) miss downstream consumers.

**Signals:**
- Renaming or restructuring without full surface enumeration
- Changes to Go source without checking: tests, embedded hooks, external hooks, SKILL.md, docs, scripts
- CLI flag changes without regenerating docs
- Skill directory changes without syncing counts

**Pre-mortem check:** For each structural change, is the full propagation surface enumerated? (Go source, tests, hooks, skills, docs, scripts, CI)

**Contract-atomic namespace/refactor gate:** If the plan renames or flattens a
CLI namespace, skill path, schema field, artifact directory, or other shared
contract, require one atomic change set that includes:
- an old->new mapping for every public name and artifact path
- a full downstream inventory across code, tests, hooks, embedded artifacts,
  skills, docs, scripts, CI, and generated files
- an executable sweep or parity gate that fails on stale references
- an explicit compatibility or rollback decision for old names

**Example:** CLI namespace restructuring touched 182 files. Missed files caused silent breakage in hooks and embedded skills.

---

### 5. Plan Oscillation (11% of FAILs)

Direction reverses mid-execution, doubling the mechanical cost of propagation.

**Signals:**
- "Create X" in one wave, "flatten X" in a later wave
- Architecture decisions reconsidered after propagation work begins
- Multiple pivots without shipping code between them (pivot-heavy, zero-code delivery)

**Pre-mortem check:** Has the architectural direction been validated (via council or user confirmation) BEFORE propagation work begins?

**Example:** Namespace flattening reversed a prior namespace creation — opposite direction, double the file changes, identical propagation surface.

---

### 6. Dead Infrastructure Activation (8% of FAILs)

Plan provisions infrastructure (VMs, clusters, services) without activation tests. Infrastructure exists on paper but has never handled real traffic or been validated under production conditions.

**Signals:**
- Provisioning issues with no corresponding smoke test or health check issue
- "Deploy X" without "Verify X handles traffic"
- Infrastructure created in earlier waves but first used in much later waves
- No readiness probe or traffic test in acceptance criteria

**Pre-mortem check:** For every provisioned resource, is there an activation/smoke test issue that proves it handles real traffic?

**Example:** Bootstrap cluster provisioned but never validated under load — DNS and NIC mismatches only discovered during first real workload, causing multi-day debugging. *(Source: bootstrap-idempotent-design, core-hardening-postmortem)*

---

### 7. Missing Rollback/Rescue Map (6% of FAILs)

Plan modifies production state (deployments, configs, data migrations) without specifying how to undo changes if something goes wrong.

**Signals:**
- Production-state changes with no rollback procedure
- Data migrations without a reverse migration path
- Config changes without a "revert to previous" step
- Deployment plans without a rescue/rollback section

**Pre-mortem check:** Does every production-state change have a documented rollback procedure? Can you undo each step independently?

**Example:** Velero backup configuration deployed without specifying how to restore previous state if the new config broke DR workflows. *(Source: uds-velero-dr-session, zero-context-smoke-testing)*

---

### 8. Four-Surface Closure Gap (5% of FAILs)

Implementation covers code but skips docs, examples, or proof surfaces. Incomplete closure causes downstream confusion and regression.

**Signals:**
- Code changes without corresponding doc updates
- New features without usage examples
- Missing proof artifacts (test results, benchmark data, demo output)
- "Will update docs later" in issue descriptions

**Pre-mortem check:** Does the plan address all 4 surfaces (Code, Docs, Examples, Proof) for every feature? Are doc/example/proof tasks explicitly tracked?

**Example:** CLI namespace restructuring shipped code changes but skipped doc regeneration and example updates — downstream users hit stale references for weeks. *(Source: four-surface-closure pattern, repo-history-retro)*

---

## Pre-Mortem Integration

When running pre-mortem validation, each judge should evaluate the plan against these 8 patterns. Add to the judge prompt:

> Review this plan for the top 8 council FAIL patterns:
> 1. Missing mechanical verification — are all gates automated?
> 2. Self-assessment — is validation external to the implementer?
> 3. Context rot — are phase boundaries enforced with fresh sessions?
> 4. Propagation blindness — is the full change surface enumerated?
> 5. Plan oscillation — is direction validated before propagation?
> 6. Dead infrastructure activation — does every provisioned resource have an activation test?
> 7. Missing rollback map — does every production-state change have a rollback procedure?
> 8. Four-surface closure — does the plan address Code + Docs + Examples + Proof?

## Severity Calibration

| Pattern | Blast Radius | Detection Difficulty | Recommended Gate |
|---------|-------------|---------------------|-----------------|
| Missing mechanical verification | HIGH | LOW (grep for "verify manually") | Rewrite acceptance criteria as commands |
| Self-assessment | HIGH | MEDIUM | Add external validator step |
| Context rot | MEDIUM | HIGH (invisible until too late) | Enforce fresh sessions per phase |
| Propagation blindness | HIGH | MEDIUM | Enumerate surface pre-implementation |
| Plan oscillation | HIGH | LOW (visible in plan diff) | Council validate direction first |
| Dead infrastructure activation | HIGH | MEDIUM | Require activation/smoke test issue for every provisioned resource |
| Missing rollback/rescue map | HIGH | LOW | Require rollback procedure for any production-state change |
| Four-surface closure gap | MEDIUM | LOW | Verify plan addresses all 4 surfaces (Code, Docs, Examples, Proof) |
