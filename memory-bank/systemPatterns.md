# System Patterns — Underground Arena

## High-level architecture
React Native (Expo) app. **TypeScript everywhere.** Strict separation between:

```
src/
  data/         → static, designer-tunable config (cards, leagues, archetypes, tournaments, modes…)
  engine/       → pure deterministic game logic (combat sim, RNG, stamina, combos, victory)
  services/     → orchestration on top of engine + data (progression, opponents, modes, persistence)
  stores/       → Zustand stores (UI-facing state, persisted via AsyncStorage)
  database/     → SQLite client + migrations for heavier persisted data
  screens/      → React Native screens
  components/   → reusable UI (base/, cards/, etc.)
  navigation/   → React Navigation graph + screen registry
  themes/       → colors, spacing, typography, shadows
  events/       → in-process event bus
  hooks/, utils/, animations/, types/
```

## Key technical decisions

### 1. Pure engine, impure shell
`src/engine/combat/*` is pure: takes input (fighters, decks, seed), returns deterministic output (events, log, winner). No imports from stores, navigation, or React. This enables replays, daily-shared seeds, and unit testing.

### 2. Seeded RNG everywhere randomness matters
`engine/combat/rng.ts` exports `createRng(seed)` (mulberry32-style) and helpers like `pickWeighted`. Daily challenges hash `daily:YYYY-MM-DD`; matchmaking hashes `(dailySeed XOR playerId)` so each player sees a unique-feeling fight but design is reproducible.

### 3. Data-driven design
Designers can add cards, archetypes, leagues, tournament templates, daily challenge templates, procedural events, and name pools by editing `src/data/**` files — no engine changes required.

### 4. Stores = Zustand, persisted manually
Each store (player, inventory, energy, combat, cards, progression, settings) owns its own slice and persistence key (`services/persistence/keys.ts`). Persistence uses AsyncStorage via `services/persistence/storage.ts`. Heavier relational data uses SQLite via `database/`.

### 5. Card discovery state machine
Every card is `unseen → discovered → owned`. `services/cards/discovery.ts` drips discoveries rarity-weighted on post-fight. UI (`CardTile`, `CardDetailsScreen`) renders the three states distinctly.

### 6. Opponent generation pipeline
`services/opponents/`:
- `fighterGenerator` builds an `AIFighter` from `(seed, league, effectiveLevel, archetype?, difficultyDrift)`.
- `deckGenerator` assembles a legal deck from card pools weighted by archetype.
- `matchmaking` chooses an archetype + drift for the player's current league.
- `rivals` tracks recurring named opponents.
- `bosses` are hand-tuned overrides (data-driven).

### 7. Modes layer
`services/modes/`:
- `survival.ts` — escalating waves, persistent run state.
- `dailyChallenges.ts` — daily-seeded roster of restricted fights with rewards.
- `proceduralEvents.ts` — rare modifiers attached to any fight via RNG roll.

### 8. Post-fight orchestration
`services/progression/postFight.ts` is the single funnel after a fight: XP, coins, energy spend, achievements check, card discovery drip, level rewards.

### 9. Navigation
`navigation/RootNavigator.tsx` + `screenRegistry.tsx` keep screens discoverable. `types/navigation.ts` types the param list.

## Critical implementation paths
- **Fight execution:** `simulator.runFight(playerFighter, opponent, seed)` → events + log + result → `postFight()` applies rewards/state.
- **Pack opening:** `services/cards/packSystem.openPack(packId, rng)` → cards → store update → discovery flips to owned.
- **Tournament:** `services/tournaments/tournamentEngine` runs bracket; each match reuses the same fight pipeline.

## Conventions
- Path alias: `@/...` maps to `src/...` (see `tsconfig.json`).
- Prettier + ESLint enforced (`.prettierrc`, `.eslintrc.js`).
- No default exports for utility modules; named exports preferred.
- All randomness must accept an injected `RNG` — no `Math.random()` in engine/services.
