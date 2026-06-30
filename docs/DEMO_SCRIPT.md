# Demo Script: Legacy Modernization Commander

Target length: ~3 minutes. Recorded in agent mode against the synthetic `CLAIMS-BATCH` module.

## One-line pitch

Legacy Modernization Commander is a Slack-native command center for enterprise legacy modernization teams. The agent proposes a grounded modernization assessment; the deterministic application layer owns SME validation. Model proposes, app validates — enforced at the type level.

## Credibility anchor (say this first, on camera)

"I've spent 22 years in COBOL, OLTP, and mainframe modernization. The hard part of these programs was never code conversion — it's coordinating business rules, dependencies, and SME sign-off. This agent operates on exactly that seam."

## Pre-flight (before recording — not on camera)

- [ ] Bot renders as **Legacy Commander** in Slack, not Incident Commander. (Rename in api.slack.com → reinstall to workspace.)
- [ ] `ANTHROPIC_API_KEY` **set** — required for Beat 1. Explicit `--agent` *throws* without it (it does not fall back; only bare auto mode falls back to fixture).
- [ ] `npx tsc --noEmit` clean. Tests green.
- [ ] Demo channel `#all-nafsgerman` open, App Home reachable.
- [ ] Warm the path once: run `/legacy assess claims-batch --agent` before recording, confirm live grounding renders and the graph PNG posts.

## Beat 1 — Run it (~30s)

In `#all-nafsgerman`, type:

    /legacy assess claims-batch

The assessment card renders: module, language, platform, risk level, business rules, dependencies, SME questions, recommended path, draft work packages.

Say: "This ran live. The model just read real COBOL source and produced this — but watch what it's *not* allowed to do."

## Beat 2 — Show the grounding (~40s)

Click **Show trace** on the card.

Point at one business rule and its `EV-###` evidence reference. Show that it resolves to a real paragraph and line range in `src/demo/source/claims-batch.cbl`.

Say: "Every claim carries an evidence reference that resolves to an actual source line. The model proposed the citation; a pure verification step — no model in the loop — resolved it against the real file and minted the catalog entry. A citation that doesn't resolve doesn't get to stand as a claim."

## Beat 3 — The boundary payoff (~50s)

Point at the validation status on a claim: `machine_inferred` or `sme_required`.

Say: "Nothing here is validated. The model cannot mark its own work validated — the output type literally can't express it. We have adversarial tests that assert the model can never reach that state."

Click **SME follow-up**, then resolve it as an SME would (mark reviewed / record the decision).

Switch to **App Home**. Show the dashboard reflecting the newly validated item, and the refreshed **traceability graph PNG** posted to the channel.

Say: "The SME decision — not the model — advanced this to validated. The dashboard reflects validated workflow state. The application owns that transition; the agent never touches it."

## Beat 4 — The one sentence for judges (~20s)

"The agent produces a grounded, traceable assessment. The deterministic application layer owns the validation workflow. Model proposes, app validates, and `sme_validated` is structurally unreachable by the model. That separation is the product."

## Honest boundary (~10s, on camera or as a closing card)

"This is a synthetic claims module, clearly labeled. No production COBOL parsing, no live enterprise integration. Work packages are drafts for human review — nothing is auto-filed. Outputs are case-file-ready: grounded, traceable, and built to be validated, not to replace validation."

## Fallback if the live call fails mid-record

Re-run with `--fixture`. Same card shape, deterministic. Say: "Same workflow, deterministic mode — agent off." Do not present fixture output as live grounding.

## What the response shows (reference)

- Module / language / platform: CLAIMS-BATCH · COBOL · z/OS batch
- Business purpose
- Modernization risk + drivers
- Extracted business rules (with EV-### evidence)
- Critical dependencies
- SME questions
- Recommended migration path
- Draft work packages (proposed, not filed)
- Tool-call / evidence trace