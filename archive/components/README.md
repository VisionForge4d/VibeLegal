# 🛬 The Fallen Toggle: Airplane Mode Prototype

This folder contains the archived components and UI logic for the original `AirplaneToggle` feature, created in August 2025.

## 🔧 Purpose

The `AirplaneToggle` was designed as a lightweight frontend control to switch between:

- ☁️ **Cloud Mode** — calling Groq-hosted LLMs (e.g. LLaMA or Mixtral)
- ✈️ **Airplane Mode** — routing requests to a local inference model (e.g. via Ollama or LM Studio)

It was placed in the **top-left corner of the Navbar**, intended as a dev-only tool to prepare for future **AI compliance workflows** (e.g. jurisdiction-based contract validation, homeschool law matching, etc.).

## 💥 Why It Was Removed

A contributor working from the base version of the app requested a clean rollback to avoid merge conflicts and architectural drift. To keep team velocity aligned, we archived the feature for now.

This is not a deletion. It’s a **delay.**

## 📦 What’s in Here

- `AirplaneToggle.jsx`: The full toggle UI logic with emoji labels and state props
- `Navbar_with_toggle.jsx`: The modified Navbar component with the toggle included and functional

## 🧭 When to Restore

Revisit this feature when:

- We start building inference routing logic into the backend
- Compliance features (local vs cloud model use) are ready for testing
- We want to support offline/local-first contract analysis

## 👻 Notes

This prototype taught us how to:
- Cleanly inject toggle logic into React state flow
- Gate dev-only UI behind `NODE_ENV` checks
- Plan for dual-inference pipelines while staying backend-agnostic

Until then — rest easy, little switch.

