# 03 - Combat Engine and Battle System

Implement the complete combat engine for Underground Arena.

This is the core gameplay system of the entire game.

The combat engine must feel:

* fast,
* satisfying,
* strategic,
* replayable,
* readable,
* and rewarding.

Combat should resemble:

* classic Facebook MMA games,
* mixed with modern mobile auto battlers,
* and card-based combat systems.

The combat engine must be fully separated from the UI.

---

# Main Goal

Create:

* a standalone combat engine,
* turn processing,
* card execution,
* stamina systems,
* combo systems,
* critical hits,
* status effects,
* and victory conditions.

The combat engine should be scalable and reusable.

---

# Architecture Rules

The combat engine MUST:

* be independent from React screens
* be deterministic
* be modular
* be testable
* support future expansion
* avoid UI dependencies
* avoid hardcoded combat flows

The UI should ONLY render combat state.

---

# Combat Flow

Implement combat flow:

1. Match Intro
2. Fighter Presentation
3. Round Start
4. Card Selection Logic
5. Card Execution
6. Damage Calculation
7. Status Effect Processing
8. Combo Processing
9. Stamina Updates
10. KO or Submission Check
11. Match Result
12. Rewards Preparation

---

# Combat Style

Combat should be:

* automatic
* turn-based
* visually fast
* strategically influenced by deck building

The player does NOT manually press cards during combat.

The deck composition and fighter build determine combat behavior.

---

# Fighter Stats

Combat calculations should use:

* strength
* speed
* cardio
* technique
* defense
* chin
* aggression

Each stat must meaningfully affect combat.

Examples:

* strength affects damage
* speed affects combo frequency
* cardio affects stamina recovery
* technique affects accuracy
* chin affects knockout resistance

---

# Stamina System

Implement a stamina system.

Cards consume stamina.

Low stamina should:

* reduce damage
* reduce accuracy
* reduce combo chance
* increase vulnerability

Stamina recovery should occur:

* over turns
* through effects
* through passive abilities

---

# Card Execution System

Cards should support:

* direct damage
* status effects
* counters
* buffs
* debuffs
* combo triggers
* defensive effects

Card execution must be data-driven.

Avoid hardcoded card behaviors.

---

# Combo System

Implement combo mechanics.

Combos should:

* increase excitement
* reward aggressive builds
* create visual impact
* support synergies

Combo chances should depend on:

* speed
* aggression
* card synergy
* active effects

Examples:

* punch chains
* kick combinations
* grappling chains
* counter chains

---

# Critical Hits

Implement critical hit mechanics.

Critical hits should:

* feel impactful
* increase excitement
* create visual feedback

Critical chance should depend on:

* card stats
* fighter stats
* status effects
* combo momentum

---

# Status Effect System

Implement reusable status effects.

Examples:

* bleeding
* stun
* defense reduction
* stamina burn
* adrenaline
* exhaustion
* combo boost
* accuracy reduction

Effects must support:

* duration
* stacking rules
* expiration
* combat logs
* visual indicators

The architecture should support future effects without combat engine rewrites.

---

# Counter System

Implement counters and reversals.

Counter cards should:

* interrupt attacks
* reduce incoming damage
* trigger counter damage
* create momentum swings

Counter timing should depend on:

* fighter speed
* defensive stats
* card synergy

---

# Knockout System

Implement KO mechanics.

Knockouts should feel:

* dramatic
* rewarding
* visually impactful

KO chance should depend on:

* damage spikes
* chin stat
* exhaustion
* combo chains
* critical hits

Include:

* near KO states
* stagger moments
* knockout finishers

---

# Submission System

Implement submission mechanics.

Submissions should:

* feel tactical
* differ from knockouts
* use grappling stats
* use technique stats

Submission success should depend on:

* stamina
* technique
* grappling chains
* submission cards

---

# AI Combat Logic

Create AI combat decision logic.

AI should:

* evaluate stamina
* evaluate card cooldowns
* prefer synergistic cards
* react to status effects
* behave differently by archetype

AI personalities:

* aggressive
* defensive
* tactical
* reckless
* combo-focused
* counter-focused

AI should NOT feel random or brainless.

---

# Combat Pacing

Combat pacing is extremely important.

Fights should:

* start fast
* escalate naturally
* become more intense over time
* avoid feeling repetitive

Most fights should last:

* 30 to 90 seconds

---

# Combat Logs

Generate combat logs for:

* debugging
* UI display
* replay systems
* balancing

Examples:

* "Uppercut landed for 24 damage"
* "Bleeding applied"
* "Critical hit triggered"
* "Counter activated"

---

# Animation Hooks

Prepare animation hooks for:

* hits
* dodges
* counters
* critical hits
* knockouts
* submissions
* combo chains

Do NOT tightly couple animations to combat logic.

---

# Data Driven Design

Combat behavior must be driven by:

* card data
* fighter data
* effect data
* configuration values

Avoid hardcoded combat rules.

The system should support adding:

* new cards
* new effects
* new mechanics
  without rewriting the engine.

---

# Balance Goals

Combat should:

* reward strategy
* reward deck synergy
* avoid unfair randomness
* avoid infinite combos
* avoid repetitive dominant strategies

The player should constantly feel:

* tension
* progression
* excitement

---

# Debug Tools

Create developer-friendly debugging tools.

Include:

* combat simulator
* combat logging
* test battle mode
* adjustable fighter stats
* adjustable RNG seed

This will help balancing later.

---

# Persistence

Prepare support for:

* fight history
* combat statistics
* win/loss tracking
* knockout tracking
* submission tracking

---

# Deliverables

Generate:

* standalone combat engine
* combat state management
* stamina system
* combo system
* status effect system
* knockout system
* submission system
* AI combat logic
* combat logs
* reusable combat utilities
* combat debugging tools

The combat engine should run independently from the UI layer and be ready for future animation integration.
