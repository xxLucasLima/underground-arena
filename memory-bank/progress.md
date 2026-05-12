# Progress — Underground Arena

## Current Status
**Phase:** Polish / game-feel pass (`prompts/08-polish-and-retention.md`) + **combat readability micro-pass** on top of it — visual/haptic/audio feedback layer landed, themed base + screens, settings store, animated combat + rewards playback, DefenseBadge for dodge/block/parry/counter/miss, slower paced playback, enlarged MoveBanner, and stamina-during-playback bug fixed. Phase-05 *Opponents & Encounters* dev hub still in place. `npx tsc --noEmit` clean.

## Latest micro-pass (combat readability & stamina)
- **DefenseBadge** (`components/combat/DefenseBadge.tsx`): oversized colored call-out for `dodge`/`block`/`parry`/`counter`/`miss`, anchored to defender row, layered above MoveBanner. Driven by a new `defense` FeedbackCue produced by `combatToFeedback` (zero-damage hits + counter events).
- **Slower pacing** in `services/combat/combatPlayer.ts`: per-event dwell doubled, rarity dwell increased (Legendary +900ms), new `RECOVERY_MS` table for post-impact padding. Single source of truth — tune those three tables to retune feel.
- **Bigger MoveBanner** sized for mobile + long card names (2-line wrap, display font on Legendary).
- **Stamina playback fix**: engine doesn't emit `staminaChange` for card costs/regen, so the replay's HUD stayed at max forever. `applyEventToRuntimes` now mirrors engine math on `cardPlayed` (subtract `card.staminaCost`) and `roundStart` (regen via `staminaRegen(stats, config.staminaRegenPerTurn)`).

## What works
### Engine
- Pure, deterministic combat engine in `engine/combat/` (seeded RNG, stats, stamina, status effects, combos, criticals, victory checks, structured log).
- Card pipeline + simulator + mock fighters for debug.
- AI: personalities + `decide` action selection.

### Cards
- Card type model and full card dataset (`data/cards.ts`).
- Rarity-weighted pack system (`services/cards/packSystem.ts`).
- Discovery system (unseen → discovered → owned) with deterministic drip.
- `cardsStore` persists discovery + ownership.
- UI: `CardTile`, `CardCollectionScreen`, `CardDetailsScreen`, `PackOpeningScreen`, `DeckBuilderScreen`, `CardRarityBadge`.

### Progression
- XP curve, leagues, economy, energy, training, achievements, level rewards, daily rewards, unlocks, rewards aggregator.
- `progressionStore` + `postFight` orchestrator (drips card discoveries weighted by rarity).

### Opponents & encounters (phase 05)
- Data-driven archetypes, name pools, bosses, opponent config.
- Deck generator, fighter generator, matchmaking, rivals.
- Reward scaling (`data/opponents/rewardScaling.ts` + service).
- `encounterStore` persists tournament runs, survival, rivals, daily challenges, history, recents, boss victories.
- `runEncounterFight` orchestrator (combat + procedural event + post-fight + scaled reward preview).
- Dev hub UI: `EncounterHubScreen` + 7 dev mode screens, `OpponentPreview`, `FightResultPanel`.

### Modes
- Tournament engine + templates, survival, daily challenges, procedural events.

### Polish / game feel (this phase)
- **Themes**: `themes/{colors,typography,spacing,radii,shadows,motion}` + barrel.
- **Animation primitives**: `animations/transitions.ts`; hooks `usePressScale`, `useShake`, `useFlash`, `usePunch`, `useFadeIn`, `useReducedMotion`. All gated by `settingsStore`.
- **Settings**: `stores/settingsStore.ts` (`soundEnabled`, `hapticsEnabled`, `reducedMotion`, `visualEffectsEnabled`) persisted under `storageKeys.settings`; `SettingsScreen` exposes toggles.
- **Feedback bus** (`src/feedback/`): typed `FeedbackCue` union, sync pub/sub, pure adapter `combatEventToCues` (`light/medium/heavy/critical` thresholds).
- **Juice services**: `services/juice/haptics.ts` (expo-haptics, settings-gated), `services/juice/audio.ts` (scaffold, assets deferred). Both auto-subscribe to `feedbackBus`.
- **Combat UI**: `FloatingNumber` + pooled `FloatingNumberLayer`, `HitFlash`, `ComboCounter`, `KOOverlay`, `StatusChip`, `FighterPanel`.
- **Reward UI**: `XpBar`, `RewardPopup`, `LevelUpBanner`, `RarityReveal`.
- **Polished base components**: `AppButton` (press-scale), `AppCard` variants/elevation, `AnimatedPanel`, themed text/progress/energy/screen primitives.
- **Combat replay**: `services/combat/combatPlayer.ts` walks a finished `CombatState.log` and schedules cues onto `feedbackBus` using `transitions.ts` timings.
- **Polished session screens**: `MainMenuScreen`, `FightScreen`, `RewardsScreen`, `SettingsScreen` — themed and animated.
- **Navigation**: themed transitions in `RootNavigator`; routes extended for `Settings`/`Rewards`.

### Infra
- React Native / Expo app shell, navigation skeleton (`RootNavigator`, `screenRegistry`) — phase-05 dev routes + new player-facing routes.
- Persistence: AsyncStorage wrapper + SQLite client + migrations runner; central `services/persistence/keys.ts` with `encounters` + `settings` keys.
- Event bus (`events/eventBus`) for cross-store domain notifications, separate from the UI `feedbackBus`.
- `npx tsc --noEmit` passes with 0 errors.

## What's left to build
1. **Real audio + advanced visual assets.** `services/juice/audio.ts` and `RarityReveal` are scaffolded but use placeholders. Hook up SFX + (optional) lottie/spritesheets.
2. **Apply mode effects for real.**
   - Combat must honor daily-challenge `restriction` (today: rendered, not enforced).
   - Reward pipeline must apply procedural-event + reward-scaling multipliers as the *canonical* delta (today: shown only as a preview in the dev panel).
3. **Production mode screens.** Promote dev screens into real player flows reusing `FighterPanel` + `combatPlayer`.
4. **Player identity.** Stable `id` (uuid) in `playerStore`; drop the `name`-as-id stopgap in daily challenges.
5. **Save reliability** (phase 08 requirement): schema versioning + validation + safe fallback loads. Migrations runner exists; corruption guards do not.
6. **Legacy cleanup.** Remove `src/AI`, `src/combat-engine`, `src/game-engine`, `src/effects`.
7. **Tests.** Engine determinism, reward scaling composition/clamps, `combatEventToCues` mapping, encounter store reducers, settings persistence.
8. **Career/story flow** wiring matchmaking + leagues into a session loop.

## Known Issues
- Legacy folders (`AI/`, `combat-engine/`, `game-engine/`, `effects/`) still in tree, unused by the new engine.
- Mode effects (restrictions, event multipliers, reward scaling) computed but **not yet enforced** in combat/reward layers.
- `playerStore` lacks `id`.
- No automated tests yet.
- `services/juice/audio.ts` is a scaffold; no SFX play yet.
- Windows PowerShell: `&&` chaining unreliable — use `;`, redirect tsc output, check file size.

## Evolution of decisions
- Combat: scattered legacy folders → consolidated pure `engine/combat/` with seeded RNG.
- Cards: binary owned/not → tri-state discovery for retention drip.
- Modes: ad-hoc screens → pure `services/modes/*` returning descriptors (restrictions, multipliers) so combat stays mode-agnostic.
- Encounter state: per-mode stores → single `encounterStore`; per-screen fight calls → single `runEncounterFight` orchestrator.
- UI feel: started inline literals + ad-hoc animations → centralized `themes/*` tokens + `animations/transitions.ts` + hooks gated by `settingsStore`.
- Visual/haptic/audio: would have been wired straight from `eventBus` → split into a dedicated `feedbackBus` so domain events stay clean and per-hit cues can be throttled/muted independently.
- Combat→UI coupling: screens were going to parse `CombatEvent`s themselves → introduced `combatToFeedback` adapter + `combatPlayer` so engine stays pure and tuning the feel lives in two files.
- Memory Bank introduced per `.clinerules`; updated after phase-05 dev hub, now updated again after the polish/game-feel pass.
