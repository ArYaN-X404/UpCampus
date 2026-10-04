# UpCampus Living Architecture Map & Codebase Registry

> **Status:** Synchronized & Verified  
> **Last Verification:** `npm run build` exited with Code 0  
> **Next.js Version:** 14.2.15 App Router | **Node:** v22.18.0
> **Design Alignment:** Adapted to `up_campus_code.html` & `upcampus.html` (Inter sans, dual theme, 100-vote escalation, admin note resolve)

---

## 1. Directory Tree & Module Mapping

```
d:/Projects/UpCampus/
├── app/
│   ├── layout.tsx              # Root HTML shell, Google Fonts (Inter), dual light/dark class
│   ├── globals.css             # Dual theme CSS vars, pulse-red animation, modal-enter, glassmorphism
│   ├── providers.tsx           # UpCampusProvider wrapper, sticky Navbar layout shell (max-w-6xl)
│   ├── page.tsx                # Public Feed: Hero banner, Broken (Fix It) / Needs (Add It) / Solved tabs, 100-vote modal
│   ├── post/[id]/page.tsx      # Post Deep Inspection: Photo preview, Pinned remark, Public resolution timeline
│   ├── queue/page.tsx          # Supervisor Fast-Path Deck: Hotkey listener (A/R/E), split triage inspector
│   ├── admin/page.tsx          # Facility Control Room: 3-column Kanban board, Dept velocity KPI strip
│   ├── archive/page.tsx        # Solved & Verified Archive: Before/After proof comparison cards
│   └── live/page.tsx           # Projector Resolution Wall: Realtime dynamic bars, QR code, Live ticker
├── components/
│   ├── feed/
│   │   └── PostCard.tsx        # Card with Left Vote Rail (▲ count ▼), 100-vote escalation badge, Admin resolve button
│   ├── layout/
│   │   └── Navbar.tsx          # Brand header (Up Campus), Theme toggle (Light/Dark), Admin View switch, Post Issue CTA
│   └── post/
│       └── NewPostModal.tsx    # Radio category cards, AI duplicate alert box with Upvote Existing Instead, photo picker
├── lib/
│   ├── types.ts                # Canonical domain models: Post (admin_note), Profile, StatusEvent, UserRole
│   ├── store.tsx               # State Provider: isAdmin toggle, theme switcher, 100-vote escalation alert trigger
│   ├── data/
│   │   └── mockData.ts         # Realistic campus seed: Post 1 seeded at 99 votes for instant 100-vote escalation demo
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       └── server.ts           # Server client
├── supabase/
│   └── schema.sql              # Production Postgres DDL: Tables, Enums, Triggers, RLS, post_scores View, similar_posts RPC
├── tailwind.config.ts          # Color tokens and Inter typography config
└── docs/
    └── UPCAMPUS_ARCHITECTURE_MAP.md
```

---

## 2. Symbol Dictionary & Exported Interfaces

| Symbol | Location | Responsibility |
| :--- | :--- | :--- |
| `useUpCampus()` | [`lib/store.tsx`](file:///d:/Projects/UpCampus/lib/store.tsx) | Hook exposing `posts`, `isAdmin`, `toggleAdmin`, `theme`, `toggleTheme`, `escalatedPost`, `vote`, `resolvePostWithAdminNote` |
| `PostCard` | [`components/feed/PostCard.tsx`](file:///d:/Projects/UpCampus/components/feed/PostCard.tsx) | Renders grievance/suggestion card with left vote rail, 100-vote escalation badge, and Admin: Mark Resolved action |
| `NewPostModal` | [`components/post/NewPostModal.tsx`](file:///d:/Projects/UpCampus/components/post/NewPostModal.tsx) | Issue reporter with radio categories, AI photo context prefill, and realtime duplicate matcher |
| `Navbar` | [`components/layout/Navbar.tsx`](file:///d:/Projects/UpCampus/components/layout/Navbar.tsx) | Header with brand logo, light/dark switcher, Admin View switch, and Post Issue CTA |
| `INITIAL_POSTS` | [`lib/data/mockData.ts`](file:///d:/Projects/UpCampus/lib/data/mockData.ts) | Realistic seed dataset with Post 1 at 99 votes to demo live 100-vote escalation trigger |

---

## 3. Ingress-to-Egress Data Flow

```
1. Student Snaps Photo -> NewPostModal simulates Gemini Vision -> Prefills Category, Dept, Severity
2. Title typing triggers `searchSimilar()` (280ms debounce) -> Shows "Upvote Existing Instead" if duplicate
3. Student submits -> `addPost()` pushes to `posts` with status='pending'
4. Supervisor opens `/queue` -> Reviews AI Authenticity badge -> Presses 'A' to Approve -> status='approved'
5. Feed & Projector Wall `/live` reflect approved ticket immediately
6. Audience votes -> Left Vote Rail executes optimistic count -> Impact score recalculates
7. Admin opens `/admin` -> Drags to 'In Progress' -> Pins Official Remark
8. Admin marks 'Awaiting Verification' -> Voters see "Is it actually fixed?" on card
9. 5 students confirm 'Yes' -> Moves to `/archive` (Solved Archive) with Before/After proof
```

---

## 4. Change Blast-Radius Matrix

- **If `lib/types.ts` changes:** Audit [`lib/store.tsx`](file:///d:/Projects/UpCampus/lib/store.tsx), [`components/feed/PostCard.tsx`](file:///d:/Projects/UpCampus/components/feed/PostCard.tsx), and [`app/admin/page.tsx`](file:///d:/Projects/UpCampus/app/admin/page.tsx).
- **If `PostStatus` enum changes:** Update status badge mapper in [`PostCard.tsx`](file:///d:/Projects/UpCampus/components/feed/PostCard.tsx) and column filters in [`app/admin/page.tsx`](file:///d:/Projects/UpCampus/app/admin/page.tsx).
- **If `storage.tsx` voting formula updates:** Check impact score sorting on both [`app/page.tsx`](file:///d:/Projects/UpCampus/app/page.tsx) and [`app/live/page.tsx`](file:///d:/Projects/UpCampus/app/live/page.tsx).

---

## 5. Fast Verification Commands

- **Production Build Check:** `npm run build`
- **Development Server:** `npm run dev`
- **Lint Check:** `npm run lint`
