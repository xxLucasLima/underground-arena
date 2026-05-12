# Active Context — Underground Arena

## Current focus
The project is in the **polish & retention** phase (see `prompts/08-polish-and-retention.md`). Most core systems exist in `underground-arena/src/`:

- Combat engine (pure, seeded) ✅
- Card system + discovery + packs ✅
- Progression: XP, energy, economy, training, daily rewards, achievements, level rewards ✅
- Opponent generation (archetypes, name pools, bosses, rivals, matchmaking) ✅
- Tournaments (`services/tournaments/tournamentEngine.ts`) ✅
- Modes: survival, daily challenges, procedural events ✅
- Persistence (AsyncStorage + SQLite migrations) ✅
- Navigation skeleton ✅

The **memory bank itself was just initialized** in this session.

## Recent changes
- Added `services/modes/` (survival, dailyChallenges, proceduralEvents) and `services/tournaments/index.ts`.
- Added `data/modes/dailyChallenges.ts` and `data/modes/proceduralEvents.ts`.
- Initialized this memory bank from scratch.
- **Closed the prompt 05 persistence gap:** added `stores/encounterStore.ts` which persists tournament progress, survival runs, rivals, daily challenge state, opponent history, recent fight results, and boss victories under `storageKeys.encounters`. Services stay pure; the store wires them to AsyncStorage.
- Added `data/opponents/rewardScaling.ts` + `services/opponents/rewardScaling.ts` — data-driven reward multipliers (tier, boss, tournament round, survival streak, daily completion) with clamps. Exported through the opponents barrel.

## Next steps (likely priorities)
1. Wire the modes layer into screens (DailyChallengesScreen, SurvivalScreen, TournamentScreen) and into navigation.
2. Hook procedural events into the post-fight / pre-fight pipeline so they actually affect rewards.
3. Connect achievements + level rewards UI feedback (toasts, modals) using `events/eventBus`.
4. Audit legacy folders (`src/AI`, `src/combat-engine`, `src/game-engine`, `src/effects`) — either delete or migrate anything still useful into `engine/combat/`.
5. Add unit tests for the pure engine (RNG, stamina, criticals, victory).
6. Polish: animations, sounds (deferred — assets not in repo yet), haptics.

## Active decisions & considerations
- **Determinism over convenience.** Every random source must accept a seeded RNG. This keeps daily challenges fair and replays possible.
- **Data-driven everything.** Resist hardcoding balance in TS logic — push it to `src/data/**`.
- **Don't touch legacy folders.** They predate the current `engine/combat/` design and will be removed.
- **Modes are advisory, not enforced (yet).** `dailyChallenges` returns a `restriction` object; the combat layer must honor it when it consumes the instance. `proceduralEvents` returns multipliers; the post-fight/pre-fight code must apply them.

## Important patterns & preferences
- Always re-export new service modules through their `index.ts` barrel.
- Use `@/` path alias, not relative `../../..` chains.
- Keep functions small and pure where possible; orchestration belongs in `services/`, not in stores.
- Stores expose actions, not raw setters, so persistence and event emission stay centralized.

## Learnings & insights
- Mixing daily seed with player ID hash is a cheap way to get "shared design, personal feel."
- Card discovery (unseen → discovered → owned) is a strong retention hook; the rarity-weighted drip makes commons feel cheap and legendaries feel mythical even before they're owned.
- Windows PowerShell does **not** support `&&` reliably — when running shell commands here, prefer `;` chains or wrap in `cmd /c`. Redirect tsc output to a file to avoid mangled console output.
