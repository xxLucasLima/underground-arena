# 01 - Project Setup and Architecture

Create the foundational architecture for a mobile game called "Underground Arena".

This is a React Native + Expo mobile game inspired by old Facebook MMA combat games.

At this stage, DO NOT implement gameplay systems yet.

The goal of this step is ONLY to create:

* the project structure,
* architecture,
* navigation,
* local persistence setup,
* reusable systems,
* and scalable foundations.

The codebase must be clean, modular, scalable, and easy to expand later.

---

# Tech Stack

Use:

* React Native
* Expo
* TypeScript
* NativeWind
* Zustand
* SQLite
* AsyncStorage
* React Navigation
* React Native Reanimated

---

# Main Goal

Create a scalable mobile game architecture that supports:

* future combat systems,
* deck building,
* AI battles,
* tournaments,
* progression systems,
* and future online expansion.

Do NOT implement gameplay yet.

---

# Project Structure

Create a professional folder structure similar to a production mobile game.

Use folders such as:

* app
* assets
* components
* screens
* navigation
* stores
* hooks
* services
* database
* game-engine
* combat-engine
* AI
* animations
* effects
* events
* constants
* utils
* types
* data
* themes

Keep responsibilities separated.

Avoid giant files.

---

# Architecture Rules

The project must follow these rules:

* Gameplay logic must NEVER live inside screens
* Components must be reusable
* Business logic must be separated from UI
* Use strongly typed models
* Use modular systems
* Avoid hardcoded values
* Use scalable folder organization
* Prepare for future expansion

---

# Navigation

Configure React Navigation with:

* Splash Screen
* Main Menu
* Fighter Profile
* Card Collection
* Deck Builder
* Fight Screen
* Rewards Screen
* Shop
* Tournament Screen
* Training Gym
* Settings

Use a scalable navigation structure.

---

# Theme System

Create a reusable theme system.

Main visual direction:

* dark UI
* black backgrounds
* deep red highlights
* metallic combat atmosphere

Create:

* spacing constants
* typography constants
* color palette
* reusable shadows
* reusable card styles

---

# Global State

Configure Zustand stores for:

* player state
* settings
* progression
* inventory
* cards
* combat state
* energy system

Keep stores modular.

---

# Local Persistence

Configure:

* SQLite
* AsyncStorage

Create a reusable persistence layer.

Prepare persistence for:

* player progression
* inventory
* cards
* settings
* rewards
* statistics

Do NOT hardcode save logic inside components.

---

# Database Setup

Create SQLite initialization system.

Include:

* database service
* migrations structure
* table creation system
* reusable query helpers

Prepare tables for:

* fighters
* cards
* inventory
* decks
* rewards
* tournaments
* settings

---

# Data Driven Design

The project must support data-driven systems.

Cards, enemies, rewards, leagues, and tournaments should later be configurable through:

* JSON
* database records
* configuration files

Avoid hardcoded gameplay content.

---

# Event System

Create a lightweight event-driven architecture.

Examples of future events:

* OnFightWon
* OnCardUnlocked
* OnLevelUp
* OnTournamentCompleted

The event system should be reusable and decoupled.

---

# UI Foundation

Create reusable base components such as:

* Button
* Card
* Modal
* Progress Bar
* Energy Bar
* Currency Display
* Screen Container
* Header
* Animated Panel

Use clean modern styling.

---

# Animations

Configure React Native Reanimated.

Create reusable animation helpers for:

* fades
* slides
* scale animations
* reward popups
* combat flashes
* screen transitions

---

# Asset Structure

Prepare folders for:

* sound effects
* music
* card art
* fighter portraits
* UI icons
* backgrounds
* VFX

Use placeholder assets for now.

---

# Performance

Prepare the project for good mobile performance.

Avoid:

* unnecessary rerenders
* giant global states
* tightly coupled systems

Use scalable patterns.

---

# Developer Experience

Configure:

* ESLint
* Prettier
* path aliases
* TypeScript strict mode

The codebase should feel professional and maintainable.

---

# Deliverables

Generate:

* complete folder structure
* navigation setup
* theme system
* Zustand setup
* SQLite setup
* reusable UI foundation
* persistence system
* event system
* animation helpers
* base screens
* TypeScript configuration

The app should compile and run successfully before moving to gameplay systems.

Do NOT implement combat or gameplay logic yet.
