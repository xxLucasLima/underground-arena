# 02 - Card System and Deck Building

Implement the complete card system for Underground Arena.

This is the MOST IMPORTANT gameplay system in the entire project.

The card system must feel:

* rewarding,
* strategic,
* expandable,
* data-driven,
* and highly replayable.

The system must support future content expansion without requiring combat engine rewrites.

---

# Main Goal

Create:

* a scalable card architecture,
* card collections,
* deck building,
* card rarities,
* progression systems,
* upgrades,
* and card effects.

Do NOT implement the combat engine yet.

Focus ONLY on:

* card data,
* card management,
* deck systems,
* inventory systems,
* and progression.

---

# Architecture Rules

The card system must:

* be fully data-driven,
* avoid hardcoded logic,
* use reusable models,
* support future expansion,
* separate data from UI,
* and support future balancing.

Do NOT place gameplay logic directly inside React screens.

---

# Card Data Structure

Create a strongly typed card model.

Each card should include:

* id
* name
* description
* category
* rarity
* staminaCost
* damage
* cooldown
* accuracy
* criticalChance
* comboPotential
* unlockLevel
* animationType
* statusEffect
* statusEffectChance
* duration
* icon
* visualEffect
* flavorText

---

# Card Categories

Implement support for:

* Punch
* Kick
* Grappling
* Submission
* Counter
* Defense
* Passive
* Ultimate

The architecture must support adding new categories later.

---

# Card Rarities

Implement:

* Common
* Rare
* Epic
* Legendary

Each rarity should influence:

* drop rates,
* visual presentation,
* card power,
* upgrade costs,
* and excitement factor.

---

# Card Collection System

Create a complete card collection system.

The player should:

* unlock cards,
* own duplicates,
* upgrade cards,
* browse collections,
* filter cards,
* and manage decks.

The collection system should feel similar to:

* mobile card battlers,
* collectible RPG systems,
* and progression-heavy games.

---

# Card Inventory

Implement:

* owned cards
* duplicate tracking
* upgrade levels
* card quantities
* favorite cards
* recently unlocked cards

Support future expansion.

---

# Card Upgrades

Players should be able to:

* level up cards,
* improve stats,
* increase rarity power,
* and evolve builds.

Upgrade costs should scale progressively.

Include:

* money costs
* duplicate requirements
* progression balancing

---

# Starter Cards

Generate starter cards for:

* punches,
* kicks,
* grappling,
* and defense.

The player should begin with:

* a functional starter deck,
* simple cards,
* and easy-to-understand mechanics.

---

# Advanced Cards

Generate higher-tier cards with:

* combo effects,
* status effects,
* stamina pressure,
* and powerful synergies.

Legendary cards should feel:

* exciting,
* rare,
* and visually impressive.

---

# Status Effects

Prepare support for reusable status effects.

Examples:

* bleeding
* stun
* exhaustion
* adrenaline
* defense break
* stamina burn
* combo boost
* accuracy reduction

Do NOT implement full combat logic yet.

Only prepare the card effect architecture.

---

# Data Driven Design

Cards must be configurable using:

* JSON
* SQLite
* or structured configuration files.

Avoid hardcoded card creation.

The goal is to allow:

* easy balancing,
* content updates,
* and future expansions.

---

# Deck Building System

Create a complete deck builder.

Rules:

* maximum 8 active cards
* maximum 2 ultimate cards
* cards consume stamina
* cards have cooldowns
* deck synergy matters

The deck builder should:

* feel clean,
* responsive,
* and mobile-friendly.

---

# Deck Features

Implement:

* deck validation
* drag and drop support if possible
* card filtering
* category filters
* rarity filters
* sorting
* deck saving
* multiple deck presets

---

# UI Requirements

Create screens for:

* Card Collection
* Card Details
* Deck Builder
* Card Upgrade
* Card Rewards
* Pack Opening

The UI should feel:

* satisfying,
* dark,
* metallic,
* and modern.

---

# Pack Opening System

Create:

* Bronze Packs
* Silver Packs
* Gold Packs
* Legendary Packs

Each pack should:

* generate random cards
* use rarity probabilities
* display reveal animations
* support duplicate rewards

Pack openings should feel highly rewarding.

---

# Visual Feedback

Add:

* rarity colors
* glow effects
* unlock animations
* upgrade animations
* reward popups
* card shine effects

Legendary cards should feel visually special.

---

# Card Filtering

Support filtering by:

* rarity
* category
* level
* owned/unowned
* favorites
* upgrade availability

---

# Sorting System

Support sorting by:

* rarity
* damage
* cooldown
* stamina cost
* alphabetical order
* newest cards
* strongest cards

---

# Persistence

Save locally using:

* SQLite
* AsyncStorage

Persist:

* owned cards
* upgrades
* decks
* favorites
* pack history
* progression

---

# Balance Goals

The system should:

* encourage experimentation
* avoid overpowered starter cards
* create meaningful progression
* reward strategic deck building

The player should constantly feel:

* progression,
* improvement,
* and excitement.

---

# Reusable Systems

Create reusable:

* card components
* card rendering system
* rarity styling
* reward popups
* collection lists
* filtering systems

Avoid duplicated logic.

---

# Deliverables

Generate:

* complete card architecture
* card models
* starter card database
* card collection system
* deck builder
* upgrade system
* pack opening system
* card persistence
* filtering and sorting
* reusable UI components
* sample card data

The app should fully support:

* collecting cards,
* upgrading cards,
* opening packs,
* and building decks,

before combat implementation begins.
