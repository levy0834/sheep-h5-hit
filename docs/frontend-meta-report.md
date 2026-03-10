# Frontend Meta Report

## What changed
- Added a modular `src/meta` layer with typed commands/events for WS-1 integration.
- Implemented two original comeback mechanics:
  - `Pressure Twist`: a pressure meter that unlocks timed twist choices at max pressure, including a fake-safe option (`Quick Patch`) that can backfire.
  - `Rescue Deck`: rescue charge from high-pressure play that converts into clutch cards during near-fail moments.
- Added Phaser-ready UI modules:
  - `MetaHudPanel` for pressure, rescue charge, held card, and comeback chain.
  - `TwistChoicePanel` for timed two-choice twist decisions.
- Added integration-ready `MetaOverlayScene` that listens to core events and emits `meta:command` payloads back to the game loop.
- Added concise product copy in `src/meta/content/product-copy.ts` for start/result/share prompts.

## Validation
- Confirmed branch is not `main/master` (`feat/sheep-h5-hit-frontend-meta-`).
- Verified generated files and imports by repository scan (`rg --files`, `find . -maxdepth 3 -type f`).
- Build/test command could not be executed because the worktree currently has no `package.json`, Vite config, or TS build pipeline yet.

## Risks
- Event payload contracts may need small adjustments once WS-1 finalizes exact field names.
- Rescue card command effects (`meta/use-card`, `meta/modify-core`) require core-loop handlers to be implemented on integration.
- UI layout uses placeholder fonts/colors and should be aligned with design-art polish pass.

## Next steps
1. Hook core scene events to `CORE_EVENTS` and consume `META_EVENTS.COMMAND`.
2. Map each command to concrete gameplay effects in the core state machine.
3. Tune pressure/charge numbers with playtest telemetry after WS-1 merge.
