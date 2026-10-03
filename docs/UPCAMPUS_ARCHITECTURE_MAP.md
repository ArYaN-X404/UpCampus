# UpCampus Living Architecture Map & Codebase Registry

> **Status:** Synchronized & Verified  
> **Last Verification:** `npm run build` exited with Code 0  
> **Next.js Version:** 14.2.15 App Router | **Node:** v22.18.0

---

## 1. Directory Tree & Module Mapping

```
d:/Projects/UpCampus/
├── app/
│   ├── layout.tsx              # Root HTML shell, Google Fonts (DM Serif Display, Manrope), dark theme class
│   ├── globals.css             # Base design tokens, custom thin scrollbars, glassmorphism utilities
│   ├── providers.tsx           # UpCampusProvider wrapper, sticky Navbar layout shell
│   ├── page.tsx                # Public Feed: Hero stats, Grievance/Suggestion tabs, Safety priority lane
│   ├── post/[id]/page.tsx      # Post Deep Inspection: Photo preview, Pinned remark, Public resolution timeline
│   ├── queue/page.tsx          # Supervisor Fast-Path Deck: Hotkey listener (A/R/E), split triage inspector
│   ├── admin/page.tsx          # Facility Control Room: 3-column Kanban board, Dept velocity KPI strip
│   ├── archive/page.tsx        # Solved & Verified Archive: Before/After proof comparison cards
│   └── live/page.tsx           # Projector Resolution Wall: Realtime dynamic bars, QR code, Live ticker
├── components/
│   ├── feed/
│   │   └── PostCard.tsx        # Card with Left Vote Rail (▲ count ▼), Impact Badge, Verification Card
│   ├── layout/
│   │   └── Navbar.tsx          # Brand header, dynamic route badges, One-Tap Demo Role Switcher (Student/Supervisor/Admin)
│   └── post/
│       └── NewPostModal.tsx    # Snap evidence, AI photo triage shimmer, live debounced duplicate interceptor
├── lib/
│   ├── types.ts                # Canonical domain models: Post, Profile, StatusEvent, CampusLocation, UserRole
│   ├── store.tsx               # State Provider: Optimistic voting, local persistence, role impersonator
│   ├── data/
│   │   └── mockData.ts         # Realistic campus seed: Hinglish posts, real hostels, status lifecycle items
│   └── supabase/
│       ├── client.ts           # Browser Supabase client with graceful fallback checker
│       └── server.ts           # Server client
├── supabase/
│   └── schema.sql              # Production Postgres DDL: Tables, Enums, Triggers, RLS, post_scores View, similar_posts RPC
├── tailwind.config.ts          # Semantic color tokens: campus-bg (#0A1330), surface (#121F4A), teal (#2DD4BF), amber, pink
├── UPCAMPUS_ARCHITECTURE_AND_ROADMAP.md # Master architectural document & execution plan
└── docs/
    └── UPCAMPUS_ARCHITECTURE_AND_ROADMAP.md
```

---

## 2. Symbol Dictionary & Exported Interfaces

| Symbol | Location | Responsibility |
| :--- | :--- | :--- |
| `useUpCampus()` | [`lib/store.tsx`](file:///d:/Projects/UpCampus/lib/store.tsx) | Hook exposing `posts`, `currentUser`, `upvotePost`, `moderatePost`, `updatePostStatus`, `verifyPost`, `resetDemoData` |
| `PostCard` | [`components/feed/PostCard.tsx`](file:///d:/Projects/UpCampus/components/feed/PostCard.tsx) | Renders grievance/suggestion card, handles vote clicks, displays verification action card |
| `NewPostModal` | [`components/post/NewPostModal.tsx`](file:///d:/Projects/UpCampus/components/post/NewPostModal.tsx) | Multi-step issue reporter with sample photo AI triage & live debounced duplicate detector |
| `Navbar` | [`components/layout/Navbar.tsx`](file:///d:/Projects/UpCampus/components/layout/Navbar.tsx) | Sticky header with live counts and 1-tap role switcher |
| `MOCK_LOCATIONS` | [`lib/data/mockData.ts`](file:///d:/Projects/UpCampus/lib/data/mockData.ts) | 8 real campus locations (Hostel 7, Chemistry Block, Central Library, etc.) |
| `post_scores` | [`supabase/schema.sql`](file:///d:/Projects/UpCampus/supabase/schema.sql) | SQL View computing Impact Score = `net_votes * severity_mult + min(days, 14)*0.5 + safety_bump` |
| `similar_posts()` | [`supabase/schema.sql`](file:///d:/Projects/UpCampus/supabase/schema.sql) | Postgres RPC executing trigram similarity against open approved issues |

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
