# Underground Arena - Game Design Document (GDD)

## Project Overview

Underground Arena is a singleplayer mobile MMA card battle game inspired by classic Facebook-era combat games from 2010–2014.

The game focuses on:

* fighter progression,
* collectible combat cards,
* AI battles,
* deck building,
* tournaments,
* ranking ladders,
* and addictive progression systems.

The experience should feel nostalgic, dark, rewarding, and optimized for short mobile gameplay sessions.

The MVP is fully offline and singleplayer only.

---

# Core Vision

The goal is to create:

* a highly replayable mobile game,
* with satisfying progression,
* strategic deck building,
* fast automated combat,
* and rewarding unlock systems.

The game should feel like:

* an old-school social combat game,
* mixed with modern mobile progression systems,
* but without multiplayer complexity.

---

# Target Platform

## Primary Platform

* Android

## Future Support

* iOS

---

# Target Audience

Players who enjoy:

* MMA/UFC-style themes,
* card battlers,
* progression systems,
* idle combat games,
* tournament systems,
* loot/reward gameplay,
* and nostalgic Facebook-era games.

---

# Design Pillars

## 1. Fast Gameplay

Fights should be:

* quick,
* exciting,
* visually satisfying,
* and easy to follow.

Most fights should last:

* 30 to 90 seconds.

---

## 2. Constant Progression

Players should constantly unlock:

* cards,
* rewards,
* leagues,
* equipment,
* cosmetics,
* and stronger opponents.

The first 30 minutes should feel highly rewarding.

---

## 3. Strategic Deck Building

The player should feel rewarded for:

* combining cards,
* creating synergies,
* managing stamina,
* and adapting builds.

---

## 4. Offline Accessibility

The entire MVP should work:

* offline,
* locally,
* without accounts,
* and without servers.

---

## 5. Expandable Architecture

The project should be structured to support future:

* multiplayer,
* cloud saves,
* live events,
* battle passes,
* and online rankings.

These features are NOT part of the MVP.

---

# Gameplay Loop

1. Open the game
2. Collect rewards
3. Train fighter
4. Open card packs
5. Upgrade cards
6. Build combat deck
7. Fight AI opponents
8. Earn rewards
9. Rank up
10. Unlock stronger leagues
11. Repeat

---

# Game Structure

## Main Systems

### Fighter Progression

Players improve:

* stats,
* leagues,
* rankings,
* and equipment.

---

### Card Collection

Players unlock:

* combat cards,
* passive cards,
* ultimate attacks,
* and status effect abilities.

---

### Combat System

Combat is:

* automatic,
* turn-based,
* fast-paced,
* and heavily influenced by deck composition.

---

### Tournament System

Players participate in:

* brackets,
* boss fights,
* survival modes,
* and ranked ladders.

---

### Reward System

Players receive:

* money,
* XP,
* cards,
* packs,
* and equipment.

---

# Fighter System

## Fighter Attributes

* Strength
* Speed
* Cardio
* Technique
* Defense
* Chin
* Aggression

These attributes influence:

* damage,
* stamina usage,
* critical hits,
* combo frequency,
* and survivability.

---

# Fight Styles

## Available Styles

* Boxer
* Muay Thai Fighter
* Wrestler
* BJJ Specialist
* Kickboxer
* Street Fighter
* Balanced Fighter

Each style affects:

* stat distribution,
* preferred cards,
* AI behavior,
* and combat pacing.

---

# Card System

## Card Categories

### Punch

Examples:

* Jab
* Cross
* Lead Hook
* Rear Hook
* Uppercut
* Superman Punch
* Spinning Back Fist
* Hammer Fist
* Liver Shot
* Overhand Right
* Backfist Combo
* Body Blow
* Elbow Strike
* Spinning Elbow
* Rapid Punch Combo

---

### Kick

Examples:

* Low Kick
* Calf Kick
* Roundhouse Kick
* High Kick
* Front Kick
* Side Kick
* Axe Kick
* Flying Knee
* Bicycle Kick
* Push Kick
* Spinning Heel Kick
* Question Mark Kick
* Jumping Roundhouse
* Knee Strike
* Tornado Kick

---

### Grappling

Examples:

* Double Leg Takedown
* Single Leg Takedown
* Body Slam
* Suplex
* Hip Throw
* Clinch Control
* Cage Slam
* Ground and Pound
* Trip Takedown
* Body Lock Takedown
* Shoulder Throw
* Mount Transition
* Sweep Reversal
* Slam Counter
* Clinch Knee Barrage

---

### Submission

Examples:

* Armbar
* Triangle Choke
* Rear Naked Choke
* Guillotine Choke
* Kimura Lock
* Americana
* Heel Hook
* Kneebar
* Anaconda Choke
* D'Arce Choke
* Omoplata
* Arm Triangle
* Wrist Lock
* Calf Slicer
* Bulldog Choke

---

### Counter

Examples:

* Slip Counter
* Counter Hook
* Dodge Counter
* Takedown Reversal
* Counter Elbow
* Counter Knee
* Parry Strike
* Sprawl Counter
* Counter Uppercut
* Intercepting Knee
* Cage Reversal
* Counter Clinch
* Feint Counter
* Roll Escape Counter
* Counter Cross

---

### Defense

Examples:

* High Guard
* Leg Check
* Defensive Roll
* Clinch Escape
* Shoulder Block
* Iron Chin
* Slip Movement
* Tight Guard
* Turtled Defense
* Footwork Reset
* Distance Control
* Defensive Clinch
* Emergency Recovery
* Stamina Recovery
* Focused Breathing

---

### Passive

Examples:

* Adrenaline Rush
* Iron Chin
* Predator Instinct
* Fast Recovery
* Cardio Machine
* Precision Striker
* Submission Expert
* Heavy Hands
* Granite Defense
* Counter Specialist
* Aggressive Pressure
* Tactical Mind
* Cage Dominance
* Relentless Pace
* Knockout Aura

---

### Ultimate

Examples:

* Rage Barrage
* Berserker Combo
* Final Elbow
* Knockout Instinct
* Fury Rush
* Last Stand
* Savage Combination
* Predator Assault
* Cage Breaker
* Sudden KO
* Endless Pressure
* Champion's Fury
* Death Combo
* Critical Barrage
* Finisher Sequence


# Deck Building

Players create combat decks before fights.

## Deck Rules

* Maximum 8 active cards
* Maximum 2 ultimate cards
* Cards use stamina
* Cards have cooldowns
* Deck synergy matters

---

# Combat System

## Combat Flow

1. Match Intro
2. Fighter Presentation
3. Round Start
4. Automatic Card Usage
5. Damage Resolution
6. Status Effects
7. KO or Submission
8. Rewards Screen

---

## Combat Features

* Health bars
* Stamina bars
* Combo chains
* Critical hits
* Dodge system
* KO animations
* Status effects
* Floating damage numbers
* Combat logs

---

# Status Effects

Examples:

* Bleeding
* Stun
* Defense Break
* Stamina Burn
* Accuracy Reduction
* Adrenaline Boost
* Exhaustion

Effects support:

* durations,
* stacking,
* animations,
* and combat indicators.

---

# AI System

AI opponents should:

* use generated names,
* have randomized decks,
* follow fighting archetypes,
* and scale with difficulty.

## AI Personalities

* Aggressive
* Defensive
* Tactical
* Reckless
* Combo-focused
* Counter-focused

---

# Game Modes

## Career Mode

Progress through leagues and tournaments.

---

## Tournament Mode

Bracket-style competitions.

---

## Boss Fights

Unique difficult opponents.

---

## Endless Survival

Fight continuously until defeated.

---

## Daily Challenges

Rotating objectives and rewards.

---

# League Progression

## Example Leagues

1. Amateur Circuit
2. Underground Cage
3. Regional League
4. National League
5. Elite Combat Federation
6. World Championship

---

# Energy System

Energy is consumed by:

* fights,
* training,
* and tournaments.

## Example

* Max Energy: 20
* Fight Cost: 2
* Recovery: 1 every 15 minutes

---

# Equipment System

## Equipment Slots

* Gloves
* Shorts
* Mouthguard
* Shin Guards
* Hand Wraps

## Equipment Bonuses

* Increased damage
* Defense boosts
* Critical chance
* Combo bonuses
* Stamina efficiency

---

# Reward System

Players can earn:

* Money
* XP
* Card packs
* Equipment
* Cosmetics
* Titles

---

# Card Packs

## Pack Types

* Bronze Pack
* Silver Pack
* Gold Pack
* Legendary Pack

Pack openings should feel:

* exciting,
* rewarding,
* and visually satisfying.

---

# Visual Direction

## Visual Style

The game should feel:

* dark,
* metallic,
* gritty,
* underground,
* and nostalgic.

---

## UI Style

Inspired by:

* old Facebook games,
* underground fight posters,
* gym culture,
* and combat sports broadcasts.

---

## Main Colors

* Black
* Dark Gray
* Deep Red

---

# Audio Direction

Placeholder audio should include:

* punches,
* kicks,
* crowd reactions,
* knockouts,
* menu clicks,
* victory sounds,
* and pack opening sounds.

---

# Technical Direction

## Mobile Stack

* React Native
* Expo
* TypeScript
* NativeWind

---

## State Management

* Zustand

---

## Local Persistence

* SQLite
* AsyncStorage

---

## Animations

* React Native Reanimated

---

## Navigation

* React Navigation

---

# Architecture Goals

The project should:

* separate gameplay logic from UI,
* use reusable systems,
* avoid giant components,
* use typed models,
* and support future expansion.

---

# Combat Engine

The combat engine must:

* be fully separated from the UI,
* be deterministic,
* be modular,
* and be testable.

The UI layer should only render combat state.

---

# Data-Driven Design

Cards, enemies, leagues, rewards, and tournaments should be:

* configurable,
* reusable,
* and data-driven.

Avoid hardcoded gameplay logic whenever possible.

---

# MVP Scope

## Included in MVP

* Offline gameplay
* AI fights
* Fighter progression
* Card collection
* Deck building
* Tournaments
* Rewards
* Training
* Basic animations
* Local save system

---

## NOT Included in MVP

* Multiplayer
* Cloud sync
* Guilds
* Live services
* Online ranking
* Real-time networking
* Monetization

---

# Development Strategy

The project should be developed incrementally.

## First Vertical Slice

Implement:

* one fighter,
* one AI opponent,
* one league,
* one deck builder,
* one fight screen,
* one reward screen,
* and one tournament.

Only expand after the gameplay loop is fully functional.

---

# Long-Term Vision

The project should eventually evolve into:

* a polished indie mobile game,
* with expandable systems,
* long-term progression,
* and optional future online functionality.
