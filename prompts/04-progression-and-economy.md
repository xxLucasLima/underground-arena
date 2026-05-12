# 04 - Progression, Rewards, Economy and Training Systems

Implement the progression systems for Underground Arena.

The progression systems are responsible for:

* long-term player retention,
* reward pacing,
* fighter growth,
* and gameplay motivation.

The player must constantly feel:

* progression,
* improvement,
* unlock excitement,
* and reward anticipation.

The first 30 minutes should feel highly rewarding.

---

# Main Goal

Create:

* XP systems
* level systems
* economy systems
* reward systems
* training systems
* energy systems
* progression pacing
* unlock systems

The game should feel addictive without becoming frustrating.

---

# Architecture Rules

All progression systems must:

* be modular
* be data-driven
* support balancing
* avoid hardcoded progression values
* support future expansion

Keep progression logic separated from UI.

---

# Fighter Progression

Implement fighter progression systems.

Fighters should gain:

* XP
* levels
* stats
* league progression
* unlocks

Leveling up should feel meaningful.

---

# Fighter Stats

Support progression for:

* strength
* speed
* cardio
* technique
* defense
* chin
* aggression

Stats should influence combat performance.

Higher stats should feel noticeable.

---

# Experience System

Implement:

* XP gain
* level curves
* level rewards
* progression scaling

XP should be rewarded from:

* fights
* tournaments
* challenges
* achievements

Higher leagues should reward more XP.

---

# Level Rewards

Leveling up should reward:

* money
* packs
* cards
* energy refills
* cosmetics
* titles
* new features

Level ups should feel exciting.

---

# Economy System

Implement an in-game economy.

Currencies:

* soft currency (money)
* premium currency placeholder

Soft currency should be earned through:

* fights
* tournaments
* rewards
* achievements

Premium currency is NOT monetized yet.
Only prepare the architecture.

---

# Economy Balance

The economy should:

* avoid excessive grinding
* avoid inflation
* reward active play
* encourage progression
* encourage experimentation

The player should frequently feel rewarded.

---

# Reward System

Implement a modular reward system.

Rewards may include:

* XP
* money
* cards
* packs
* cosmetics
* equipment
* titles
* temporary bonuses

Rewards should scale with difficulty.

---

# Reward Generation

Create procedural reward generation.

Reward generation should consider:

* league
* opponent difficulty
* player level
* fight performance
* streaks

Higher risk should produce better rewards.

---

# Daily Rewards

Implement:

* login rewards
* daily bonuses
* streak rewards

Rewards should increase across streaks.

Missing a day should NOT feel excessively punishing.

---

# Energy System

Implement an energy/stamina system outside combat.

Energy is consumed by:

* fights
* tournaments
* training

Example:

* max energy: 20
* fight cost: 2
* recovery: 1 every 15 minutes

---

# Energy Recovery

Support:

* passive regeneration
* reward refills
* level-up refills

The player should rarely feel completely blocked from playing.

---

# Training System

Implement fighter training systems.

Training categories:

* strength
* speed
* cardio
* technique
* defense

Training should:

* consume energy
* increase stats
* use timers
* scale progressively

---

# Training Design

Training should feel:

* rewarding
* strategic
* meaningful

The player should decide:

* which stats to prioritize
* which builds to pursue

Different builds should feel viable.

---

# Build Diversity

Support different fighter archetypes:

* heavy striker
* fast combo fighter
* defensive counter fighter
* grappler
* submission specialist
* balanced fighter

Avoid one dominant strategy.

---

# League Progression

Implement league progression.

Example leagues:

* Amateur Circuit
* Underground Cage
* Regional League
* National League
* Elite Combat Federation
* World Championship

Each league should:

* unlock new opponents
* unlock better rewards
* increase difficulty
* unlock stronger cards

---

# Unlock Systems

Implement unlock progression for:

* cards
* leagues
* tournaments
* cosmetics
* equipment
* game modes

Unlock pacing should feel rewarding.

---

# Difficulty Scaling

Difficulty should scale naturally.

Avoid:

* unfair spikes
* impossible walls
* excessive grind requirements

The player should feel challenged but motivated.

---

# Tournament Rewards

Tournament rewards should feel substantial.

Include:

* larger XP rewards
* better packs
* unique cards
* cosmetics
* titles

Winning tournaments should feel important.

---

# Achievement System

Implement a reusable achievement system.

Examples:

* win streaks
* knockout milestones
* card collection milestones
* tournament victories
* level milestones

Achievements should grant rewards.

---

# Reward Presentation

Rewards should feel visually satisfying.

Add:

* reward popups
* level-up animations
* pack opening reveals
* rarity effects
* progression bars

The player should constantly feel dopamine feedback.

---

# Progression Persistence

Persist:

* player level
* XP
* currencies
* unlocks
* league progression
* rewards
* achievements
* energy timers

Use:

* SQLite
* AsyncStorage

---

# Balancing Tools

Create developer-friendly balancing tools.

Support:

* editable XP curves
* editable reward tables
* editable economy values
* editable energy values

Avoid hardcoded balancing values.

---

# Data Driven Design

Progression systems should be configurable through:

* JSON
* SQLite
* configuration files

Support future balancing without code rewrites.

---

# Deliverables

Generate:

* XP system
* leveling system
* reward system
* economy system
* energy system
* training system
* unlock systems
* achievement system
* reward presentation systems
* progression persistence
* balancing tools

The progression systems should feel polished, rewarding, scalable, and suitable for a long-term mobile game loop.
