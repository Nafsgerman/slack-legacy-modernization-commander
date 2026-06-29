# ADR-0002: App Home Dashboard + Traceability Graph

- Status: Accepted
- Date: 2026-06-29
- Deciders: Nafees (architect), Codex/Claude (lead staff engineer)
- Related: ADR-0001 (agent grounding boundary). This ADR is the *visual* enforcement of the same discipline.

## Context

The slash-command card answers "assess this module." It does not give a team a standing, glanceable picture of *where modernization validation stands*. Track A adds that surface.

Constraints from the program brief: fully Slack-native, **zero external infrastructure** (no web app, no DB, no AWS for this track), deterministic and snapshot-testable, GCP-like light theme. The differentiator is line-cited, human-gated evidence; the surface must make that legible at a glance and must not be able to display a connection that isn't real.

## Decision

1. **App Home is the dashboard surface.** Not a new channel message, not a modal. `views.publish` gives each user a persistent, re-publishable home tab. Actions (`Mark reviewed`, `SME follow-up`) re-publish Home so the picture updates in place — the same mutate-in-place principle as the interactive card, one level up.

2. **The traceability graph has exactly three node kinds: EV, BR, LMC.**
   - `EV-*` — evidence items from `evidenceCatalog.evidence`. Ground truth. Neutral styling, no validation color (evidence is not a claim).
   - `BR-*` — extracted business rules. Claim nodes, colored by `validationStatus`.
   - `LMC-*` — ticket-draft work packages. Claim nodes, colored by `validationStatus`.
   - Edges run claim → evidence, one per entry in the claim's `evidenceRefs`.

3. **The graph renders ONLY from resolved evidence refs.** An edge is drawn iff the ref string is a member of `evidenceCatalog.evidence[].id`. A claim citing an id not in the catalog (e.g. `EV-999`) produces **no edge** and is recorded in `unresolvedRefs`. This is the graph-layer analog of ADR-0001's citation verification: the surface cannot draw a line to evidence that does not exist, exactly as grounding cannot stamp a citation that does not resolve.

4. **Color grammar = validation state, on claim nodes only.**
   | status | meaning | fill / stroke |
   |---|---|---|
   | `machine_inferred` | model proposed, code-verified citation, not yet human-checked | amber `#fef7e0` / `#f9ab00` |
   | `sme_required` | needs a human | blue `#e8f0fe` / `#1a73e8` |
   | `sme_validated` | human confirmed | green `#e6f4ea` / `#34a853` |
   | `rejected` | human rejected | red `#fce8e6` / `#ea4335` |
   | evidence (EV) | ground truth, not a claim | neutral `#f1f3f4` / `#5f6368` |

   The demo wow-moment falls out of this: as SMEs press `Mark reviewed`, claim nodes flip amber/blue → green and the graph visibly greens up. The graph is a live validation-coverage instrument, not decoration. App Home's scalar "validation progress" and "evidence coverage" metrics are the same signal in numbers.

5. **Deterministic layered layout, not force-directed.** Two columns: claims left (BR-* then LMC-*, sorted by id), evidence right (EV-* sorted). Positions are a pure function of sorted index. Force-directed layout is reserved for Track B (React Flow / dagre, off the same assessment object) and is explicitly out of scope here — it is non-deterministic and not snapshot-testable.

6. **Render path: pure SVG → PNG → Slack file → image block.** A pure `renderTraceabilityGraphSvg(model)` produces a deterministic SVG string. `@resvg/resvg-js` rasterizes it to PNG. The PNG is uploaded via `files.uploadV2` and referenced in an App Home `image` block. Only the upload/publish steps touch Slack; the model and SVG are pure and tested without network or Slack.

7. **Demo workflow state is in-memory and honestly labeled.** Keyed by `userId:moduleId`, re-published on each action. No DB, consistent with zero-infra. Surfaced with the existing "No persistent enterprise state changed" framing — the graph greening up is a demo-session view, not an enterprise mutation.

## Module layout

| Path | Purpose | Layer |
|---|---|---|
| `src/domain/graph/model.ts` | `resolveTraceabilityGraph(assessment)` → `{ nodes, edges, unresolvedRefs }`. Pure, portable (Track B reuses it). | domain |
| `src/app/graph/svg.ts` | `renderTraceabilityGraphSvg(model)` → deterministic SVG string. Exports `STATUS_FILL`. | app |
| `tests/graph.test.ts` | Model resolution, unresolved-ref exclusion, color grammar, determinism. | test |

Subsequent (Sonnet): `src/app/graph/png.ts` (resvg), App Home `views.publish` in the Slack app, action-handler wiring to re-publish.

## Consequences

**Positive**
- The grounding moat is now visible, not just typed. A reviewer sees evidence-anchored claims and a validation frontier in one image.
- The graph derivation is a pure domain function, so Track B (React Flow deep-dive) lifts the same `resolveTraceabilityGraph` output with no DB coupling.
- Deterministic layout → real snapshot tests → safe to iterate before the video.

**Negative / accepted**
- Two-column layout with many-to-many edges will have crossing lines. Honest (traceability is many-to-many) and legible at this node count; edge-bundling is a later refinement, not a blocker.
- App Home image blocks require an uploaded file round-trip per publish. Acceptable for demo cadence; noted for future caching.

## Non-goals

- Dependencies, modernization-risk, and SME-checklist items are **not** graph nodes (kept in App Home text sections and drill-downs). Adding them pushes the graph past a glanceable node count and dilutes the evidence→claim spine.
- No force-directed layout, no web surface, no database, no AWS in this track.
- The graph never invents an edge: unresolved refs are recorded and excluded, never rendered.
