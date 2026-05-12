# Project Brief — Underground Arena

## What this is
Underground Arena is a **singleplayer, offline mobile MMA card battle game** inspired by Facebook-era combat games (2010–2014). The vibe: nostalgic, dark, rewarding, optimized for short mobile sessions.

The MVP is fully offline, no accounts, no servers, no multiplayer.

## Core requirements (MVP scope)
- React Native (Expo) app targeting **Android first**, iOS later.
- **Fast automated fights** driven by a deck of combat cards (30–90s per fight).
- **Collectible card system** (Common → Rare → Epic → Legendary) with rarity-weighted drops, discovery state (unseen / discovered / owned), pack opening.
- **Deck builder** with synergies between Punch / Kick / Grappling / Submission / Counter / Defense / Passive / Ultimate categories.
- **Fighter progression**: XP, levels, stats (strength/speed/cardio/technique/defense/chin/aggression), training, energy system.
- **Economy**: coins, gems, daily rewards, level rewards, achievements.
- **Leagues**: Amateur → Underground → Regional → National → Elite → World, with unlock gates.
- **Opponent system**: data-driven archetypes, deterministic seeded generation, bosses, rivals.
- **Game modes**: story/career fights, tournaments (bracket), survival mode, daily challenges, procedural events.
- **Persistence**: local-only (AsyncStorage + SQLite migrations) — no cloud sync in MVP.

## What we are NOT building (yet)
- No multiplayer, no PvP, no realtime, no chat.
- No monetization plumbing.
- No cloud save / account system.
- No live ops dashboards.

## Source of truth
The canonical design lives in `prompts/game-design-doc.md`. Implementation is staged through numbered prompts in `prompts/` (e.g. `08-polish-and-retention.md`).

## Success criteria
- The first 30 minutes feel highly rewarding (constant unlocks).
- Fights are quick, satisfying, easy to follow.
- Deck building has meaningful choices and synergies.
- Entire game playable with airplane mode on.
