# CLAUDE.md

This file provides guidance for AI assistants working with this repository.

## Project Overview

This is a **multi-project monorepo** containing 6 applications, primarily centered around a restaurant management and localization platform, plus ancillary business tools.

| Project | Stack | Port | Purpose |
|---|---|---|---|
| `restaurant-menu-viewer/` | Next.js 14, TypeScript, Tailwind CSS | 3001 | Customer-facing multilingual menu viewer |
| `restaurant-admin-panel/` | Next.js 14, TypeScript, Tailwind CSS | 3003 | Restaurant admin dashboard (QR codes, analytics, menu management) |
| `restaurant-translate/` | Next.js 14, TypeScript, Tailwind CSS | — | Integrated version combining viewer + admin |
| `business-plan-generator/` | React 19, Vite, TypeScript | 8080 | Business plan creation and PDF export |
| `salary-slip-generator/` | Python Flask, SQLite, HTML/JS | — | Salary slip generation with user auth |
| `subsidy-chatbot/` | Python Flask, SQLite | — | AI-powered subsidy Q&A chatbot |
| `shared-data-server.js` | Node.js | 8888 | HTTP server for menu data sync between apps |

## Repository Structure

```
/
├── restaurant-menu-viewer/     # Next.js customer menu app
│   ├── src/app/                # App Router pages
│   ├── src/components/         # React components
│   ├── src/lib/                # Shared utilities (translator, foodDictionary, sync)
│   ├── src/types/              # TypeScript type definitions
│   └── src/data/               # Sample menu data
├── restaurant-admin-panel/     # Next.js admin app
│   ├── src/app/                # App Router pages (dashboard, menu, analytics, settings)
│   ├── src/components/         # Admin components (QRCodeGenerator, ImageUploader)
│   └── src/lib/                # Shared utilities (mirrored from menu-viewer)
├── restaurant-translate/       # Integrated app combining both
├── business-plan-generator/    # Vite + React business plan tool
│   └── src/                    # Components, utils, types
├── salary-slip-generator/      # Flask salary slip app
│   ├── server.py               # Flask backend entry point
│   └── *.html                  # Multiple salary slip templates (~30 variations)
├── subsidy-chatbot/            # Flask Q&A chatbot
│   ├── app.py                  # Flask entry point
│   └── data/                   # qa_data.json, top10_questions.json
├── shared-data-server.js       # Node.js data sync server
└── [documentation files]       # PROJECT_SUMMARY.md, DEPLOYMENT_GUIDE.md, etc.
```

## Language & Multilingual Support

A core feature across the restaurant apps is multilingual support for **9 languages**:
`ja` (Japanese), `en`, `zh-CN`, `zh-TW`, `ko`, `fr`, `es`, `th`, `vi`

Translation is handled via a priority-based system in `lib/translator.ts`:
1. Food dictionary lookup (`lib/foodDictionary.ts` — 150+ food terms)
2. Basic translation map fallback
3. Simulated translation (demo mode)

## Build & Run Commands

### Next.js projects (restaurant-menu-viewer, restaurant-admin-panel, restaurant-translate)

```bash
cd <project-dir>
npm install
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint
```

### Business Plan Generator

```bash
cd business-plan-generator
npm install
npm run dev       # Vite dev server on port 8080
npm run build     # Production build
npm run lint      # ESLint
```

### Salary Slip Generator

```bash
cd salary-slip-generator
pip install flask flask-cors
python server.py
```

### Subsidy Chatbot

```bash
cd subsidy-chatbot
pip install -r requirements.txt   # Flask==3.0.0, flask-cors==4.0.0
python app.py
```

### Shared Data Server

```bash
node shared-data-server.js        # Runs on port 8888
```

## Key Type Definitions

Located in `restaurant-menu-viewer/src/types/index.ts` (mirrored in admin panel):

- **`Language`** — Union type of 9 supported language codes
- **`MenuItem`** — Full menu item with name, description, price, allergens, dietary info, translations
- **`Restaurant`** — Restaurant metadata with categories and items
- **`AllergyInfo`** — 9 allergen types (wheat, dairy, eggs, shrimp, crab, peanuts, soba, soy, tree_nuts)
- **`DietaryRestrictions`** — 5 types (vegetarian, vegan, halal, gluten_free, dairy_free)

## Code Conventions

- **TypeScript strict mode** across all TS projects (`tsconfig.json` → strict: true)
- **`'use client'`** directive on client-side React components (Next.js App Router convention)
- **Path aliases**: `@/*` maps to `./src/*` in Next.js projects
- **Tailwind CSS** for all styling — no CSS modules or styled-components
- **Lucide React** for icons across all projects
- **Component pattern**: Functional components with typed props, no class components
- **Commit messages**: Written in Japanese, prefixed with conventional types (`feat:`, `fix:`, `docs:`, `test:`, `deploy:`)
- **No formal test framework** is configured — no unit test runner or test directories exist

## Shared Libraries (restaurant apps)

Both `restaurant-menu-viewer` and `restaurant-admin-panel` share mirrored copies of:

| File | Purpose |
|---|---|
| `lib/translator.ts` | Multilingual translation engine |
| `lib/foodDictionary.ts` | 150+ food terms in 8 languages |
| `lib/syncManager.ts` | Data synchronization between apps |
| `lib/currencyConverter.ts` | Currency conversion utilities |
| `lib/crossPortSync.ts` | Cross-port data synchronization |
| `types/index.ts` | Shared TypeScript type definitions |
| `data/sampleMenu.ts` | Sample restaurant data |

**Note**: These files are duplicated, not shared via a common package. Changes to shared logic must be applied in both projects.

## Database Schemas

### Salary Slip Generator (SQLite — `salary_data.db`)
- `users` — username, password_hash, email
- `salary_data` — user salary records with monthly data
- `sessions` — session tokens with expiry

### Subsidy Chatbot (SQLite — `subsidy_chatbot.db`)
- `users` — username, email, password_hash
- `favorites` — user-favorited Q&As
- `search_history` — user search queries

## CI/CD & Deployment

- **No CI/CD pipelines** (no GitHub Actions, no pre-commit hooks)
- Deployment targets **Vercel** (some projects have `vercel.json`)
- Sandbox environment on **Novita AI** for development

## Important Notes for AI Assistants

1. **Dual-project updates**: When modifying shared library code (translator, types, food dictionary), update both `restaurant-menu-viewer` and `restaurant-admin-panel`.
2. **No test suite**: There are no automated tests. If adding tests, consider setting up Vitest for the Vite project and Jest for Next.js projects.
3. **Japanese context**: Commit messages, some documentation, and UI strings are in Japanese. Maintain this convention.
4. **Port assignments**: menu-viewer=3001, admin-panel=3003, data-server=8888, business-plan=8080. Avoid port conflicts.
5. **React versions differ**: restaurant apps use React 18, business-plan-generator uses React 19.
6. **localStorage usage**: The restaurant apps use localStorage for custom translations, auth state, and cross-tab data sharing.
