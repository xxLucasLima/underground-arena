# Active Context — Underground Arena

## Current focus
The polish pass from `prompts/08-polish-and-retention.md` is in. This session was a **combat readability + pacing micro-pass on top of it**: defensive outcomes now have their own badge, fight pacing was doubled, MoveBanner was upsized for mobile, and a long-standing bug where stamina stayed pinned at max during playback was fixed. `npx tsc --noEmit` is clean.

## Recent changes (this session — combat readability & stamina fix)
- **New `defense` FeedbackCue** + adapter mapping (`feedback/types.ts`, `feedback/combatToFeedback.ts`). Zero-damage `damageDealt` events (engine emits these on accuracy fails) are mapped to `dodge`/`miss`, and `counter` events also surface a defense cue. `block`/`parry` reserved for future engine signals.
- **`DefenseBadge` component** (`components/combat/DefenseBadge.tsx`) — large uppercase call-out (DODGED / BLOCKED / PARRIED / COUNTERED / MISSED) with distinct color + ASCII glyph per outcome (colorblind-safe). Anchored to the defender's row (`bottom 12%` for player, `top 14%` for opponent) so it never collides with the centered `MoveBanner`. Self-subscribes to `feedbackBus`, light haptic on entry (medium for counters).
- **FightScreen layering fix** — `DefenseBadge` now renders *after* `MoveBanner` (above it in z-order). Banner is a fullscreen pointerEvents=none overlay so layering matters; original mount had the badge hidden behind the banner.
- **Slower combat pacing** (`services/combat/combatPlayer.ts`):
  - Doubled per-event base dwell (cardPlayed 260→520, damageDealt 320→520, critical 480→760, stagger 280→480, counter 360→560, statusApplied 200→360, knockout/submission 900→1100).
  - Rarity dwell on `cardPlayed` increased: Rare +200, Epic +480, Legendary +900. Ultimates +300. Heavy hits (≥22 dmg) +180.
  - New `RECOVERY_MS` table adds post-event padding (critical/KO/stagger/counter) so the next move can't crowd them.
- **Bigger MoveBanner** (`components/combat/MoveBanner.tsx`) — 92% width / max 560, min-height 96 (128 on Legendary), bigger padding/glow, name supports `numberOfLines={2}`, font scales by rarity (subtitle → title → display). Legendary tints the screen ~26% with thicker border and longer 1800ms dwell.
- **Stamina playback fix** (`services/combat/combatPlayer.ts`) — *the* big bug this session. The engine emits no `staminaChange` events for card costs or per-round regen, so the replay HUD's stamina bar stayed at max forever. Replay now mirrors the engine math directly inside `applyEventToRuntimes`:
  - `cardPlayed` → deduct `card.staminaCost` from actor (card looked up via `state.profiles[actorId].deck`).
  - `roundStart` → regen for actor using `staminaRegen(profile.stats, DEFAULT_COMBAT_CONFIG.staminaRegenPerTurn)`, capped at `maxStamina`.
  - Numbers stay identical to the engine because we reuse `staminaRegen` + the same config — no drift.

## Prior session changes (phase 08 polish baseline — preserved)
- **Theme tokens** under `src/themes/` — `colors`, `typography`, `spacing`, `radii`, `shadows`, `motion`, single `theme` barrel. All polish components/screens consume these instead of literals.
- **Animation primitives** under `src/animations/`:
  - `transitions.ts` (durations + easings, motion-token-aware).
  - Hooks: `usePressScale`, `useShake`, `useFlash`, `usePunch`, `useFadeIn`, `useReducedMotion`. All respect `settingsStore.reducedMotion` and `visualEffectsEnabled`.
- **Settings**
  - New `stores/settingsStore.ts` (`soundEnabled`, `hapticsEnabled`, `reducedMotion`, `visualEffectsEnabled`) persisted to `storageKeys.settings`.
  - `screens/SettingsScreen.tsx` exposes the four toggles.
- **Feedback bus** (`src/feedback/`):
  - `types.ts` discriminated union (`hit`, `critical`, `combo`, `counter`, `stagger`, `status`, `stamina`, `ko`, `submission`, `matchStart`, `matchEnd`).
  - `feedbackBus.ts` — synchronous pub/sub, isolated from `events/eventBus` (domain events stay clean, UI cues live on their own bus).
  - `combatToFeedback.ts` — pure adapter `CombatEvent → FeedbackCue[]` with damage thresholds (`light < 12 ≤ medium < 22 ≤ heavy`, criticals escalate to `'critical'` impact).
- **Juice services** (`src/services/juice/`):
  - `haptics.ts` — thin wrapper around `expo-haptics`, gated by `settingsStore.hapticsEnabled` + reducedMotion; maps feedback cues to impact levels.
  - `audio.ts` — placeholder hooks (assets deferred), gated by `soundEnabled`.
  - Both subscribe to `feedbackBus` at module-init via the `services/juice` barrel.
- **Combat UI components** (`src/components/combat/`):
  - `FloatingNumber` + `FloatingNumberLayer` (Animated.Value pool, no list re-renders).
  - `HitFlash`, `ComboCounter`, `KOOverlay`, `StatusChip`, `FighterPanel`.
  - All consume cues from `feedbackBus`, not the raw combat log.
- **Reward UI components** (`src/components/rewards/`): `XpBar` (animated fill), `RewardPopup`, `LevelUpBanner`, `RarityReveal`.
- **Base components** were polished — `AppButton` got `usePressScale`, `AppCard` got elevation/variant tokens, `AnimatedPanel` for entrance fades.
- **Combat replay service** — `services/combat/combatPlayer.ts` walks a finished `CombatState.log`, schedules cues via `transitions.ts` durations, and emits them onto `feedbackBus` so screens animate deterministically off the engine output.
- **Polished player-facing screens**:
  - `screens/MainMenuScreen.tsx` — themed hub.
  - `screens/FightScreen.tsx` — wires `combatPlayer` + `FighterPanel` + `FloatingNumberLayer` + overlays.
  - `screens/RewardsScreen.tsx` — XP bar, level-up banner, reward popups, rarity reveal.
- **Navigation** — `RootNavigator` now uses themed transitions; `types/navigation.ts` extended for `Settings`/`Rewards` routes.
- **Typecheck:** `npx tsc --noEmit` produces empty `tsc.log` → 0 errors. (Use the `if ((Get-Item tsc.log).Length -eq 0) { "TSC CLEAN" }` PowerShell trick to verify.)

## Next steps (likely priorities)
1. **Real assets** — audio cues + spritesheets/lottie. `services/juice/audio.ts` and `RarityReveal` are scaffolded but use placeholders.
2. **Apply mode effects in the engine/reward pipeline** (still outstanding from phase 05): daily-challenge `restriction` enforcement, procedural-event multipliers as canonical reward delta, reward-scaling composed inside `processFightResult`.
3. **Promote dev screens** (`screens/dev/*`) into production mode screens reusing `FighterPanel`/`combatPlayer`.
4. **Player identity** — add stable `id` (uuid) to `playerStore`, drop the `name`-as-id stopgap in `DevDailyChallengesScreen`.
5. **Legacy cleanup** — delete `src/AI`, `src/combat-engine`, `src/game-engine`, `src/effects`.
6. **Tests** — engine determinism, reward scaling composition/clamps, `combatEventToCues` mapping, settings persistence.
7. **Save validation / migrations** — phase 08 calls for save-corruption guards; not yet implemented.

## Active decisions & considerations
- **Replay must mirror the engine for any stat the HUD displays.** The engine deliberately doesn't emit chatter events for every stat change (stamina spend, regen, cooldown decay) — that's a perf/log-size choice. Therefore `combatPlayer.applyEventToRuntimes` is allowed (and required) to import engine helpers (`staminaRegen`, `DEFAULT_COMBAT_CONFIG`) and reproduce the math. If a new HUD field is added, ask: does the engine emit an event for it? If not, mirror the deduction here.
- **Layer order in FightScreen is load-bearing.** From bottom to top: floaters → HitFlash → StatusToast → MoveBanner → DefenseBadge → KOOverlay. Re-ordering will hide overlays behind the banner — DefenseBadge specifically *must* render after MoveBanner.
- **Defense cues live separately from `hit` cues.** Adapter routes zero-damage hits to `defense`, not `hit`, so the HitFlash / floating numbers never fire for dodges/misses. Keeps the screen quiet when nothing landed.
- **Pacing knobs are concentrated in `combatPlayer.ts`.** `EVENT_DURATION_MS` + `RARITY_DWELL_MS` + `RECOVERY_MS` are the three tables to touch. Speed multiplier still composes on top.
- **Two buses, on purpose.** `events/eventBus` carries domain events (fight resolved, card unlocked, level up) consumed by stores/services. `feedback/feedbackBus` carries UI-only cues at hit frequency. Keeping them separate prevents UI re-renders from leaking into progression logic and lets us throttle/batch the feedback channel later without touching domain code.
- **Engine is still pure.** Everything visual is driven by walking `CombatState.log` through `combatToFeedback` → `feedbackBus`. No animation state lives inside the engine.
- **`combatPlayer` is the canonical playback driver.** Screens should not parse `CombatEvent`s themselves; subscribe to `feedbackBus` cues. Centralizing here means tuning timing/feel only touches `transitions.ts` + `combatToFeedback.ts`.
- **Settings are gates, not branches.** `reducedMotion` collapses animation durations to ~0 and disables shake/flash; `visualEffectsEnabled` is a harder kill switch (a11y/perf). Hooks consume settings directly so individual components never re-implement the gate.
- **Damage→impact thresholds live in one place** (`combatToFeedback.ts`). Retuning the feel of combat = editing one file.
- **Pure data-driven theming.** Components must consume `themes/*` tokens, never inline literals. New visual states get a token first.

## Important patterns & preferences
- Path alias `@/...` everywhere. Always re-export through local `index.ts` barrels (`animations/`, `animations/hooks/`, `feedback/`, `services/juice/`, `components/combat/`, `components/rewards/`, `themes/`).
- Animated.Values: prefer pooling (`FloatingNumberLayer`) over remounting; never animate via `setState` in a hot loop.
- Hooks named `use*`; pure data named with nouns (`motion`, `colors`).
- Stores expose actions, not raw setters. Settings persisted via `services/persistence/storage.ts` + centralized `storageKeys`.
- Each new feedback cue must: (a) be added to `feedback/types.ts`, (b) be produced by `combatToFeedback`, (c) be consumed somewhere (visual + haptic + audio), (d) honor `reducedMotion`/`visualEffectsEnabled`.

## Learnings & insights
- A "0 damage" floating number is not a readable signal for a miss/dodge — players read it as "the hit landed for 0", not "the attack didn't connect". Replacing it with a labelled DefenseBadge fixed the ambiguity instantly.
- Centered fullscreen overlays (MoveBanner) compete for screen real-estate with anything else trying to be the focal point. Solution: anchor secondary call-outs (DefenseBadge) to the defender's row, *outside* the banner's footprint, and put them above in z-order.
- Replay-driven HUDs are only as accurate as the events the engine emits. When an engine deliberately omits chatter events for perf reasons (no `staminaChange` per card play / per regen), the replay layer must mirror that math — otherwise the UI silently drifts from truth. Always cross-check HUD fields against the actual engine event types.
- Doubling dwell times made fights feel *more* exciting, not slower — anticipation lets the player register cause→effect. The previous pacing was rushing past hits before the damage number rendered.
- A pub/sub `feedbackBus` decoupled from `eventBus` made it trivial to add haptics + audio + visuals as independent listeners — each can be muted by settings without coordinating with the others.
- Pooling Animated.Values inside `FloatingNumberLayer` is the cheapest way to render many floating numbers on mobile without re-mounting and without driving `setState` per hit.
- Centralizing all timing in `animations/transitions.ts` (durations + easings tied to motion tokens) means reduced-motion is a single multiplier instead of N component branches.
- Mapping damage to impact tiers in the adapter (not the engine) keeps the engine pure and makes "make crits feel heavier" a one-line tweak.
- Windows PowerShell still mangles inline tsc output. Redirect to a file and check size: `npx tsc --noEmit 2>&1 | Out-File tsc.log; if ((Get-Item tsc.log).Length -eq 0) { "TSC CLEAN" }`.
