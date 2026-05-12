# Progress — Underground Arena

## Current Status
**Phase:** Polish & retention (`prompts/08-polish-and-retention.md`).
All foundational systems are implemented in `underground-arena/src/`. Memory Bank is fully initialized (all 6 core files present).

## What works
### Engine
- Pure, deterministic combat engine in `engine/combat/` (seeded RNG, stats, stamina, status effects, combos, criticals, victory checks, structured log).
- Card pipeline + simulator + mock fighters for debug.
- AI: personalities + `decide` action selection.

### Cards
- Card type model and full card dataset (`data/cards.ts`).
- Rarity-weighted pack system (`services/cards/packSystem.ts`).
- Discovery system (unseen → discovered → owned) with deterministic drip (`services/cards/discovery.ts`, `data/cards/discoveryConfig.ts`).
- `cardsStore` persists discovery + ownership.
- UI: `CardTile`, `CardCollectionScreen`, `CardDetailsScreen`, `PackOpeningScreen`, `DeckBuilderScreen`, `CardRarityBadge`.

### Progression
- XP curve, leagues, economy, energy, training, achievements, level rewards, daily rewards, unlocks, rewards aggregator.
- `progressionStore` + `postFight` orchestrator (drips card discoveries weighted by rarity).

### Opponents
- Data-driven archetypes, name pools, bosses, opponent config.
- Deck generator, fighter generator, matchmaking, rivals.

### Modes
- Tournament engine + templates.
- Survival mode service.
- Daily challenges (data + service, returns restrictions).
- Procedural events (data + service, returns reward/risk multipliers).

### Infra
- React Native / Expo app shell, navigation skeleton (`RootNavigator`, `screenRegistry`).
- Themed base components (AppText, AppButton, AppCard, AppModal, ProgressBar, EnergyBar, CurrencyDisplay, ScreenHeader, AnimatedPanel, ScreenContainer).
- Persistence: AsyncStorage wrapper + SQLite client + migrations runner.
- Event bus (`events/eventBus`) for cross-store notifications.
- Typecheck passes.

## What's left to build
1. **Wire modes into UI.** SurvivalScreen, DailyChallengesScreen, TournamentScreen + register in navigation.
2. **Apply mode effects.** Combat must honor daily-challenge `restriction`; reward pipeline must apply procedural-event multipliers.
3. **Reward/achievement feedback UI.** Toast/modal layer driven by `eventBus`.
4. **Legacy cleanup.** Remove or migrate `src/AI`, `src/combat-engine`, `src/game-engine`, `src/effects` (predate current `engine/combat/`).
5. **Tests.** Unit tests for engine purity (RNG determinism, stamina curve, criticals, victory conditions) and for discovery drip.
6. **Polish.** Animations, haptics, sound hooks (assets deferred).
7. **Career/story flow.** Connect opponent matchmaking + leagues into a session loop.

## Known Issues
- Legacy folders (`AI/`, `combat-engine/`, `game-engine/`, `effects/`) still in tree and not used by the new engine — risk of confusion.
- Mode effects (restrictions, event multipliers) are computed but **not yet enforced** by the combat/reward layers.
- No automated tests yet.
- Windows PowerShell: `&&` chaining unreliable — use `;` or `cmd /c` and redirect tsc output to a file.

## Evolution of decisions
- Started with scattered combat code (`src/AI`, `src/combat-engine`, `src/game-engine`) → consolidated into a single pure `engine/combat/` module with seeded RNG. Legacy folders kept temporarily for reference.
- Card visibility evolved from binary (owned/not) to tri-state (unseen/discovered/owned) to support the retention drip.
- Modes started as ad-hoc screens; refactored into `services/modes/` returning pure descriptors (restrictions, multipliers) so the combat layer stays mode-agnostic.
- Memory Bank introduced this session per `.clinerules`; will be the canonical session bootstrap going forward.
