# 🎓 UpCampus — Autonomous Campus Triage & Governance Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Powered by: Gemma 4](https://img.shields.io/badge/AI-Gemma%204%20Multimodal-4285F4.svg)](https://ai.google.dev/)
[![Standard: Agent Skill](https://img.shields.io/badge/Standard-Agent%20Skill%20v1.0-emerald.svg)](./skills/gemma-campus-triage/SKILL.md)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)

> **Autonomous Multimodal Infrastructure Triage, Hazard Scoring & Real-Time Campus Governance powered by Google Gemma 4.**

---

## 🏆 Hackathon Challenge Alignments

### 1. 🌟 Best Use of Gemma 4
* **Multimodal Visual Intelligence:** UpCampus ingests student hazard photos directly in the post creation flow and feeds them through the **Gemma 4 Multimodal Triage Pipeline**.
* **Zero-Overhead Routing:** Automatically extracts physical defect characteristics, estimates severity (1.0–10.0), classifies urgency (`urgent`, `medium`, `low`), and routes the ticket to the accountable campus division (Electrical, Sanitation, IT, Civil, Security, Welfare).
* **Auto-Fill AI Assistance:** Synthesizes actionable incident titles and standardizes campus location landmarks automatically.

### 2. 🌐 Best Open-Source AI Project
* **Agent Skill Open Standard:** Fully implements an autonomous agent skill compliant with the [Agent Skill Open Standard](./skills/gemma-campus-triage/SKILL.md), enabling external AI agents to leverage UpCampus triage logic.
* **Evaluation Benchmark Harness:** Includes an open-source model evaluation suite (`scripts/test_gemma_triage.ts`) assessing multi-scenario campus hazards with reproducible metrics.
* **Open Source Commitment:** Released under the permissive **MIT License**.

---

## ⚡ Core Architecture

```
Student Captures Photo
         │
         ▼
┌──────────────────────────────────────────────┐
│  UpCampus Client (Next.js 14 + Tailwind)     │
│  - Live Shimmer Analysis                     │
│  - One-Click Triage Autofill                 │
│  - Real-Time Completeness Meter              │
└──────────────────────┬───────────────────────┘
                       │ POST /api/triage
                       ▼
┌──────────────────────────────────────────────┐
│  Gemma 4 Multimodal Triage Engine            │
│  - Schema Validation (JSON Contract)         │
│  - Gemini / Gemma Multimodal API Pipeline    │
│  - Local Heuristic Zero-Latency Fallback     │
└──────────────────────┬───────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  Campus Department Work  │    │  Agent Skill Standards   │
│  Orders & Real-Time Wall │    │  Evaluation Harness      │
└──────────────────────────┘    └──────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/ArYaN-X404/UpCampus.git
cd UpCampus
npm install
```

### 2. Configure Environment (Optional)
```bash
# Add your Gemini / Gemma API key for live multimodal cloud inference
# If omitted, UpCampus automatically activates its local heuristic engine
echo "GEMINI_API_KEY=your_key_here" > .env.local
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view UpCampus in your browser.

---

## 🧪 Run Model Evaluation Harness

To execute the standardized benchmark suite across 5 realistic campus diagnostic scenarios:

```bash
npx ts-node scripts/test_gemma_triage.ts
```

---

## 📄 License
This project is open-source and available under the [MIT License](./LICENSE).
