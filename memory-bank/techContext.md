# Tech Context — Underground Arena

## Stack
- **Language:** TypeScript (strict).
- **Framework:** React Native via **Expo**.
- **State:** Zustand stores, persisted with AsyncStorage.
- **Database:** SQLite (`expo-sqlite` or `react-native-sqlite-storage`) for heavier persisted data; migrations under `src/database/migrations`.
- **Navigation:** React Navigation (stack), defined in `src/navigation/`.
- **Styling:** Custom theme tokens in `src/themes/` (colors, spacing, typography, shadows). No global CSS frameworks.
- **Animations:** RN Animated + `src/animations/transitions.ts`.
- **Linting/format:** ESLint + Prettier (configured in `underground-arena/.eslintrc.js`, `.prettierrc`).
- **Path alias:** `@/*` → `src/*` (see `tsconfig.json` + `babel.config.js`).

## Project root layout
```
.
├── .clinerules                # Cline / memory-bank instructions
├── memory-bank/               # This memory bank
├── prompts/                   # Staged build prompts (00..08) + GDD
└── underground-arena/         # The actual Expo app
    ├── App.tsx
    ├── index.ts
    ├── package.json
    ├── tsconfig.json
    ├── babel.config.js
    ├── .eslintrc.js / .prettierrc
    └── src/
        ├── app/               # AppBootstrap
        ├── animations/
        ├── components/        # base/, cards/
        ├── constants/
        ├── data/              # cards, opponents, tournaments, modes, progression
        ├── database/          # client, query, migrations
        ├── engine/combat/     # pure combat engine
        ├── events/            # event bus
        ├── navigation/
        ├── screens/
        ├── services/          # cards, opponents, progression, modes, tournaments, persistence
        ├── stores/            # Zustand
        ├── themes/
        ├── types/
        └── utils/, hooks/, assets/
```

Older legacy folders also exist under `src/`: `AI/`, `combat-engine/`, `game-engine/`, `effects/`. The **active** engine lives in `src/engine/combat/`; do not add to the legacy folders.

## Development setup
- Install: `cd underground-arena && npm install`
- Run (dev): `npm start` (Expo dev server) / `npm run android`
- Typecheck: `npx tsc --noEmit` (run from `underground-arena/`)
- Lint: `npx eslint src --ext .ts,.tsx`

Windows note: PowerShell does not support `&&` in older versions — use `;` or `cmd /c "... && ..."`.

## Technical constraints
- **Fully offline** for MVP — no network calls, no analytics SDKs, no auth.
- **No `Math.random()`** in `engine/` or `services/`. Always inject `RNG` from `engine/combat/rng.ts` for determinism.
- **No default exports** in shared modules (preferred). Use named exports.
- **No imports from screens into engine/services.** Dependency direction:
  `screens → stores/services → engine/data`. Never the reverse.
- **Persistence keys** are centralized in `services/persistence/keys.ts`. Don't sprinkle string keys.
- **SQLite migrations are append-only** — never edit an applied migration; add a new one.

## Tool usage patterns
- When designers want to tune balance: edit `src/data/**`. No engine changes needed.
- When adding a new game mode: add a `data/modes/<mode>.ts` config + a `services/modes/<mode>.ts` orchestration + reuse the combat simulator. Re-export from `services/modes/index.ts`.
- When adding a new card category or status effect: extend `types/cards.ts` and the relevant engine module (`combos`, `statusEffects`) — keep it pure.
- When adding a new screen: register it in `navigation/screenRegistry.tsx` and add its route to `types/navigation.ts`.

## Dependencies (high level — see `underground-arena/package.json` for the source of truth)
- `react`, `react-native`, `expo`
- `zustand`
- `@react-navigation/*`
- `@react-native-async-storage/async-storage`
- `expo-sqlite` (or equivalent)
- `typescript`, `eslint`, `prettier`
