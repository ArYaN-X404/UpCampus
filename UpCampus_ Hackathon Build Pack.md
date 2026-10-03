# UpCampus: Hackathon Build Pack

*Fix what is broken. Build what is missing.*

Contents: 0 Strategy · 1 PRD · 2 Standout feature · 3 TRD · 4 Database · 5 UI/UX · 6 Live demo plan · 7 Timeline · 8 AI build prompts · 9 Judge Q&A

---

## 0. Strategy: solving the three problems you raised

| Your problem | Fix |
| --- | --- |
| Prefilled template data, generic UI | Seed realistic, campus-specific data with a script (real building names, Hinglish posts, spread-out timestamps, real photos). Use a custom design system (section 5), not default component-library tables. |
| Judges can't log in and use it | Deploy publicly (Vercel + Supabase), add a one-tap **Demo Mode** (no email needed), put a QR code on your last slide, and add a **Live Wall** page for the projector. |
| It's just a Reddit-style complaint box | Add the **"Snap → Score → Verify" loop** (section 2): AI photo triage, an Impact Score that fixes the "2 students vs 200 students" problem from your own slide, and **community-verified resolution**. |

**Recommendation on your stack:** drop the separate Node/Express server for the hackathon. Use **Next.js route handlers/server actions + Supabase** directly. There are fewer moving parts, one deploy, and no CORS or hosting headaches. In your pitch, call it "API layer + role-based row security". It's the same architecture on the slide, with less to break.

---

## 1. PRD

### 1.1 Vision

A transparent, moderated, vote-ranked platform where students report campus problems and propose amenities, and administrators act on data and prove the result publicly.

### 1.2 Users

| Role | Who | Auth |
| --- | --- | --- |
| Student | Anyone with a college email | Email OTP/magic link, domain-restricted |
| Supervisor | Senior students nominated by faculty | Admin-assigned role |
| Admin | Faculty | Admin-assigned role |
| Guest (demo only) | Judges | One-tap sandbox account |

### 1.3 Goals and non-goals

**Goals:** a closed loop (report → rank → act → verify → archive), trusted data (one student = one vote), and a priority list admins can use. **Non-goals (v1):** replacing the formal grievance system, native apps, payments, GIS heatmaps (Phase 2/3 slides only).

### 1.4 Functional requirements

**P0, must ship (the demo breaks without these)**

1. **Auth**: college-email OTP login. Demo accounts for the three roles. Role switcher in Demo Mode.
2. **Create post**: type (Grievance or Suggestion), title, description, category, location (picker from a campus location list, optional map pin), photo upload (up to 3), anonymous-to-peers toggle (admins and supervisors still see the identity).
3. **Live duplicate detection**: while typing the title, show similar open issues with "Upvote instead / View / No, mine is different".
4. **Feed**: two tabs (Fix / Build) plus "All". Sort by Top, Impact, New. Filters: category, location, status. Live vote counts via realtime.
5. **Voting**: Agree/Disagree, one vote per user per post, changeable, with optimistic UI.
6. **Moderation queue (supervisor)**: pending posts, with approve / reject (reason) / request edits. Posts are hidden until approved. Also a fake-vote audit and a suspicious-votes list.
7. **Admin dashboard**: priority list ranked by Impact Score, status changes (Under Review → Work in Progress → Resolved), pinned official remarks, and an audit log.
8. **Status timeline** on every post (who changed what, when).
9. **Solved Archive**: public, with before/after photos and resolution time.
10. **Comments**: flat or one level deep.

**P1, should ship (this is what makes it stand out)** 11. **AI photo triage**: upload a photo and AI suggests title, category, severity, and responsible department, which the student can edit. 12. **Impact Score** (section 2.2) with a "why is this ranked here?" tooltip. 13. **Community-verified resolution**: after "Resolved", students who voted get "Is it actually fixed? Yes / No". The ticket moves to the Archive only after a confirmation threshold. Reopens if "No" wins. 14. **Live Wall** (`/live`): full-screen projector view with a leaderboard that reorders in real time, plus a QR code. 15. **Penalty ladder** automation: warning → 7-day suspension → long block (needs admin approval) → immediate block for severe abuse.

**P2, nice to have if time remains** 16. Semantic duplicate detection (pgvector), PDF work order auto-generated at a vote threshold, a supervisor points leaderboard, email or WhatsApp notifications on status change, a dark/light toggle.

### 1.5 User stories (acceptance criteria summary)

- *As a student, I can post a broken streetlight with a photo in under 30 seconds.* Photo → AI prefill → location → submit.
- *As a student, I see my post's status without chasing anyone.* Status badge, timeline, and an in-app notification.
- *As a supervisor, I can clear the queue fast.* Keyboard shortcuts (A / R / E), and an AI "looks genuine / looks like a joke" hint.
- *As an admin, I see the top 10 priorities and can post "Waiting on vendor parts, expected in 3 days".* One click, and the remark is pinned publicly.
- *As a student, I can tell whether a "resolved" ticket is truly fixed.* The verify prompt and the public verdict counter.

### 1.6 Success metrics (for the pitch)

Median time-to-first-response, duplicate rate (% of drafts diverted to upvote), resolution rate, and verified-fix rate. Mention them in the pitch even though you have no real data yet.

### 1.7 Rules and edge cases

- Rejected posts are hidden and their votes are cancelled.
- Authors can't vote on their own posts.
- A vote is counted only after the post is approved.
- Rate limits: 5 posts/day/user, 60 votes/hour/user.
- Suspended users can read and vote but not post (decide this and state it).
- Supervisors cannot change status or post official remarks, and supervisors can't moderate their own posts.
- Every moderation or status action writes to the audit log.

---

## 2. The standout feature: "Snap → Score → Verify"

Pitch line: **"Reddit lets people shout. UpCampus makes the campus answer."**

### 2.1 AI Photo Triage (the live wow moment)

The student takes a photo and the form fills itself in, because AI sees the problem. Call a vision model once and force JSON output:

```json
{
  "title": "Streetlight not working near hostel road",
  "category": "electrical | water | wifi | sanitation | furniture | safety | other",
  "severity": 1,
  "safety_risk": true,
  "department": "Electrical / Maintenance",
  "confidence": 0.86
}
```

Use Gemini (free tier) or Claude vision. **Fallback is mandatory**: if the API fails or is slow (more than 4 seconds), the form simply stays manual. Cache the demo result so the stage demo never depends on wifi.

### 2.2 Impact Score (answers your own "bench vs streetlight" slide)

```
impact = net_votes × severity_multiplier + min(days_open, 14) × 0.5
severity_multiplier: 1.0 (minor) · 1.5 (disruptive) · 2.5 (safety risk)
```

Safety-risk issues that pass a small threshold (for example 10 votes) get a red **Safety** pin and jump into a "Needs attention today" lane. The feed still supports pure net-vote sorting, because that's your "one honest ranking" slide.

### 2.3 Community-verified resolution

Admin marks **Resolved** → status becomes **Awaiting Verification** → voters get "Is it fixed?" → at 5 confirmations (or 60% of voters) it moves to the Solved Archive. If "Not fixed" wins, it **reopens** and appears in the admin dashboard with a red flag. This is the feature judges will remember, because it makes the admin accountable to students.

### 2.4 Small but flashy extras (cheap to build)

- **Live Wall** `/live` with a reordering leaderboard and QR code.
- **Department accountability board**: average response time per department. Admins will find it uncomfortable, and that makes it a good pitch point.
- **"Demand proof" on suggestions**: show "97 students want this" and an auto-generated one-page summary a vendor or admin could use.

---

## 3. TRD

### 3.1 Architecture

```
Browser (Next.js 14 App Router, Tailwind, Framer Motion)
   │  server actions / route handlers (role checks, rate limits, AI calls)
   ▼
Supabase: Auth (email OTP) · Postgres (RLS) · Realtime · Storage
   │                       └ pg_trgm (fuzzy) · pgvector (P2)
   ▼
AI provider (vision triage + optional embeddings), called server-side only
```

Deploy: **Vercel** (app) + **Supabase** (backend). Use **Supabase Storage** for photos instead of Cloudinary: it's one fewer account, and you can still say "auto-compressed" by resizing client-side to \~1280px before upload.

### 3.2 Tech choices

| Layer | Choice | Reason |
| --- | --- | --- |
| Frontend | Next.js + TypeScript + Tailwind + Framer Motion | Speed, the animated re-ranking, and one deploy |
| Components | shadcn/ui as a base, heavily restyled | Avoids a template look if you actually apply the design tokens in section 5 |
| Data | Supabase Postgres with RLS | Real security without writing a backend |
| Realtime | Supabase Realtime on `posts` and `votes` | Live counts and the Live Wall |
| Search | `pg_trgm` + Postgres full-text (RPC function) | Duplicate detection in about an hour |
| AI | Gemini or Claude vision (server route) | Triage; keys stay on the server |
| Maps (optional) | Leaflet + OpenStreetMap | Free, no key needed |

### 3.3 Auth and roles

- Supabase email OTP. A DB trigger or auth hook rejects emails not ending in `@yourcollege.edu` (make the domain an env var, and during the demo allow your own test emails via an allow-list table).
- Roles stored in `profiles.role` (`student | supervisor | admin`). RLS policies read the role from `profiles`, never from client input.
- **Demo Mode**: 3 pre-created users (`demo.student@…`, `demo.supervisor@…`, `demo.admin@…`) with known passwords stored in env vars. The "Try the demo" buttons call `signInWithPassword` server-side. The guest sandbox is the same app with real data. Only the entry point differs, and the data is real.
- **Reset button** (admin only, or a secret route) re-runs the seed so you can restore a clean state before each demo.

### 3.4 API surface (route handlers or server actions)

| Action | Who | Notes |
| --- | --- | --- |
| `POST /api/posts` | student | validates, rate-limits, status = `pending` |
| `GET /api/posts/similar?q=&location=` | student | RPC using trigram similarity, returns top 3 with score |
| `POST /api/triage` | student | takes an image, returns AI JSON, 4s timeout |
| `POST /api/votes` | student | upsert `{post_id, value: 1 or -1}`, or delete to remove |
| `POST /api/moderate` | supervisor | approve / reject (reason) / edits requested; writes audit |
| `POST /api/status` | admin | change status, add pinned remark; writes audit |
| `POST /api/verify` | student who voted | yes/no on resolution |
| `POST /api/users/:id/penalty` | supervisor (admin for long block) | applies the ladder |
| `POST /api/appeals` / `PATCH /api/appeals/:id` | student / admin |  |

### 3.5 Ranking and duplicate logic

- **Feed query**: a Postgres view `post_scores` computing `net_votes`, `impact`, and `age`. Sort in SQL, and the client only animates.
- **Duplicate L1 (build this)**: RPC `similar_posts(query, location_id)` using `similarity(title || ' ' || description, query) > 0.25`, boosted when the location matches, restricted to open and approved posts.
- **Duplicate L2 (P2)**: embeddings in a `vector(768)` column and cosine similarity. Hinglish works with multilingual embeddings. In the pitch, call it "Phase 2" honestly.

### 3.6 Realtime

Subscribe to `postgres_changes` on `votes` (aggregated via the `post_scores` view or a counter column). To keep it cheap, maintain `posts.agree_count` and `posts.disagree_count` through a DB trigger on votes. The client listens to `posts` updates only.

### 3.7 Security and abuse

- RLS on every table (policies in section 4). Service-role key only in server code.
- Unique constraint `(post_id, user_id)` on votes.
- Rate limiting: a simple counter table or Upstash-free in-memory check in route handlers (fine for a demo).
- AI/profanity pre-screen on posts as an *advisory hint* for supervisors, never auto-reject.
- Image checks: type and size limits (5 MB), strip EXIF, and don't render user HTML.
- Anonymity: hide the author name in public queries via a view, and keep the real id in the audit log.

### 3.8 Non-functional targets

Feed loads under 1.5s with 500 posts (index `status, created_at`). Mobile-first (judges will scan the QR on phones). Keyboard accessible, with WCAG AA contrast.

---

## 4. Database (Postgres/Supabase)

```sql
create extension if not exists pg_trgm;

create type user_role   as enum ('student','supervisor','admin');
create type post_kind   as enum ('grievance','suggestion');
create type post_status as enum ('pending','approved','rejected','needs_edit',
  'under_review','in_progress','awaiting_verification','resolved','reopened');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  display_name text,
  role user_role not null default 'student',
  strikes int not null default 0,
  suspended_until timestamptz,
  blocked boolean not null default false,
  created_at timestamptz default now()
);

create table locations (        -- seed ~25 real places on your campus
  id serial primary key, name text not null, zone text, lat float, lng float
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id),
  kind post_kind not null,
  title text not null check (char_length(title) between 8 and 120),
  description text,
  category text not null,
  severity int not null default 1 check (severity between 1 and 3),
  safety_risk boolean default false,
  department text,
  location_id int references locations(id),
  photos text[] default '{}',
  anonymous boolean default false,
  status post_status not null default 'pending',
  agree_count int default 0, disagree_count int default 0,
  ai_meta jsonb,
  created_at timestamptz default now(),
  resolved_at timestamptz
);
create index on posts using gin ((title || ' ' || coalesce(description,'')) gin_trgm_ops);
create index on posts (status, created_at desc);

create table votes (
  post_id uuid references posts on delete cascade,
  user_id uuid references profiles,
  value smallint check (value in (-1,1)),
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts on delete cascade,
  author_id uuid references profiles, parent_id uuid references comments,
  body text not null, created_at timestamptz default now()
);

create table status_events (     -- public timeline
  id bigserial primary key, post_id uuid references posts on delete cascade,
  from_status post_status, to_status post_status not null,
  remark text, pinned boolean default false,
  actor_id uuid references profiles, created_at timestamptz default now()
);

create table verifications (     -- community-verified resolution
  post_id uuid references posts on delete cascade,
  user_id uuid references profiles, fixed boolean not null,
  primary key (post_id, user_id)
);

create table moderation_actions (post_id uuid, actor_id uuid, action text, reason text, created_at timestamptz default now());
create table penalties (id bigserial primary key, user_id uuid, kind text, reason text, ends_at timestamptz, created_by uuid, created_at timestamptz default now());
create table appeals (id bigserial primary key, user_id uuid, penalty_id bigint, message text, status text default 'open', decided_by uuid);
create table audit_log (id bigserial primary key, actor_id uuid, action text, entity text, entity_id text, meta jsonb, created_at timestamptz default now());

-- Duplicate finder
create function similar_posts(q text, loc int default null)
returns table (id uuid, title text, status post_status, agree_count int, score real)
language sql stable as $$
  select p.id, p.title, p.status, p.agree_count,
         similarity(p.title || ' ' || coalesce(p.description,''), q)
         + case when loc is not null and p.location_id = loc then 0.15 else 0 end as score
  from posts p
  where p.status in ('approved','under_review','in_progress','reopened')
    and similarity(p.title || ' ' || coalesce(p.description,''), q) > 0.25
  order by score desc limit 3;
$$;

-- Impact score view
create view post_scores as
select p.*, (agree_count - disagree_count) as net_votes,
  (agree_count - disagree_count)
    * case severity when 3 then 2.5 when 2 then 1.5 else 1 end
  + least(extract(day from now() - created_at), 14) * 0.5 as impact
from posts p;
```

**RLS outline:** everyone authenticated can read posts with status ≠ pending/rejected, and authors can read their own. Students can insert posts with `author_id = auth.uid()`. Students can upsert their own votes only on approved posts. Supervisors can update `status` only to approved/rejected/needs_edit. Admins can update to the work statuses. `audit_log` is insert-only for the service role and read-only for admins. Keep these as a handful of policies, and test with three browser sessions.

---

## 5. UI/UX

### 5.1 Principle

Don't build "a list in a table with a menu". It should feel like a **live control room for the campus**: a card feed, motion on every rank change, and status shown as colour and shape instead of text columns.

### 5.2 Design tokens (taken from your deck, so the product matches the pitch)

| Token | Value |
| --- | --- |
| Background | `#0A1330` (deep navy), surface `#121F4A`, border `#22305F` |
| Primary | Teal `#2DD4BF` |
| Accent | Amber `#FBBF24` (suggestions, highlights), Pink `#F472B6` (counts, hot) |
| Status colours | Under Review = slate, In Progress = amber, Awaiting Verification = violet, Resolved = green, Reopened = red |
| Fonts | **DM Serif Display** for headings, **Manrope** for UI (Google Fonts) |
| Radius / spacing | 14px cards, 8px base grid |
| Light mode | Optional. If short on time, ship dark only and make it look excellent. |

### 5.3 Screens

1. **Landing / login**: hero "Fix what is broken. Build what is missing." with an animated pulse line (SVG/CSS), a live counter ("212 issues fixed this term"), a college-email form, and a prominent **"Try the demo as Student / Supervisor / Admin"** row.
2. **Feed (home)**
   - Top: segmented tabs (All / Fix / Build), sort chips (Top · Impact · New), filter drawer, and a "Needs attention today" lane for safety issues.
   - **Post card**: left vote rail (▲ count ▼), title, location chip with a pin icon, category chip, severity dot, status pill with a left colour bar, photo thumbnail, comment count, age, and an Impact badge with a hover explanation.
   - Voting animates the number, and rank changes animate with Framer Motion `layout` (cards physically glide to their new position).
3. **New post (bottom sheet on mobile, modal on desktop)**: Step 1 is a big "Snap or upload a photo" area with an AI shimmer while analysing, which then fills the fields with an "AI suggested" tag. Step 2 has the live duplicate panel sliding in as the user types (matching your slide 7 UI). Step 3 is location picker + anonymous toggle + submit, ending with a confetti-free, calm "Sent to moderators" confirmation.
4. **Post detail**: big photo, vertical **status timeline** (dots and connectors), the pinned official remark in an amber callout, a vote panel, comments, and (when applicable) the verification card: *"Admin says it's fixed. Is it?"* with Yes / Not yet.
5. **Supervisor queue**: a Tinder-style single-card review stack or split view (queue on the left, preview on the right). Buttons are Approve / Reject / Ask edits, with shortcuts A / R / E. The side panel shows the AI hint, similar posts, and the author's strike history.
6. **Admin dashboard**: a **kanban** of status columns (Under Review / In Progress / Awaiting Verification) instead of a table, a ranked "Top priorities" strip, a department accountability chart, the audit log drawer, and a supervisor management panel.
7. **Solved Archive**: a before/after slider on each card, "Fixed in 3 days · verified by 41 students".
8. **Live Wall `/live`**: black full-screen view with the top 8 issues as huge bars, live reordering, a QR code in the corner, and a ticker of new activity. This is the page you show while judges vote.
9. **Profile**: my posts, my votes, penalties and appeals.

### 5.4 Interaction and polish checklist

- Skeleton loaders everywhere, with no blank screens.
- Optimistic voting, and a toast with an undo.
- Empty states with an illustration and a one-line CTA.
- Mobile first: the vote rail stays thumb-reachable, and the "+" button is a floating action button.
- Respect `prefers-reduced-motion`.
- Icons: Lucide, one stroke weight.

### 5.5 Seed data (this is what stops it looking like a template)

Write `seed.ts` that creates about 60 synthetic students and about 45 posts with these properties:

- **Real campus place names** (your actual hostels, library floor, canteen, labs, gate, ground), not "Building A".
- A mix of statuses across all columns, including 6-8 Archive items with before/after images.
- Natural wording, including a few Hinglish ones ("Hostel B me paani nahi aa raha subah se").
- Vote counts that look organic (a heavy-tailed distribution, with a handful above 100 and most under 20) generated as real `votes` rows from the synthetic users, so the counts are true.
- `created_at` spread across the last 6 weeks, with a couple of posts from "today".
- 2 deliberate near-duplicates so the duplicate detector fires in the demo.
- Use **real photos** you take on campus today (10 minutes of walking around), compressed. This single step does more for credibility than any other.
- A `reset-demo` command that wipes and reseeds.

---

## 6. Live demo plan

**Before the demo (tonight)**

1. Deploy to Vercel + Supabase prod, and test the public URL from a phone on mobile data (not just the college wifi).
2. Shorten the URL (a free `.vercel.app` subdomain such as `upcampus.vercel.app` is fine) and generate a **QR code** for the closing slide and the Live Wall.
3. Pre-warm the app and have the seeded state ready. Keep a backup screen recording of the full flow, and a local copy running.

**3-minute demo script**

1. **Problem (20s):** show the "black hole" slide.
2. **Live Wall on the projector (20s):** "Scan this and join, you're a student now." Judges tap **Try demo as Student** and no email is needed.
3. **Snap (40s):** you post a photo of a real dark streetlight. AI fills the form, and the duplicate panel appears.
4. **Moderate (20s):** switch to Supervisor and approve it.
5. **Vote (30s):** the audience upvotes from their phones, and the Live Wall reorders in real time. This is your wow moment.
6. **Act + verify (40s):** switch to Admin, mark it Resolved with a pinned remark, then back as a student to tap "Yes, it's fixed", and it lands in the Solved Archive.
7. **Close (10s):** the department accountability board, "complements the formal system, doesn't replace it", and the QR code again.

**Handling "can anyone really log in?"** Yes. Real students use college-email OTP, and the judge sandbox uses one-tap demo accounts (one shared student account, so label demo votes honestly or auto-create a throwaway guest user per tap, which is better: `signInAnonymously` in Supabase, then flag `is_demo = true`). Say it openly: "Demo mode is sandboxed. In production, only verified emails vote."

---

## 7. 24-hour build timeline (team of 3)

| Hours | Person A (full-stack) | Person B (frontend/UI) | Person C (data/AI/demo) |
| --- | --- | --- | --- |
| 0-2 | Supabase project, schema, RLS, auth, Next.js scaffold, deploy a "hello" to Vercel | Design tokens, fonts, layout shell, login page | Collect photos and campus location list, write the seed script |
| 2-6 | Posts, votes, realtime triggers, `similar_posts` | Feed + post card + vote rail | Seed run, AI triage route with a fallback |
| 6-10 | Moderation + admin APIs, status events, audit log | New-post sheet, duplicate panel, post detail + timeline | Penalty ladder logic, rate limits |
| 10-14 | Verification flow, Impact Score view | Supervisor queue, admin kanban | Live Wall page, QR |
| 14-18 | Demo Mode + reset, bug bash | Archive page, animations, mobile polish | Pitch deck tweaks, demo script rehearsal |
| 18-22 | Test with 3 roles on real phones, fix | Empty states, skeletons, toasts | Backup video, README, architecture slide |
| 22-24 | **Freeze features.** Sleep, rehearse, and test the deployed URL again. |  |  |

**If you're solo or behind:** cut in this order: penalty automation → department board → comments threading → light mode → kanban (use a simple list) → photo AI triage (never cut the Live Wall or Demo Mode).

---

## 8. Prompts to paste into your AI coding tool

**Master prompt (use once to scaffold, then iterate feature by feature):**

> Build "UpCampus", a Next.js 14 (App Router, TypeScript, Tailwind, Framer Motion) app using Supabase (auth email OTP, Postgres with RLS, realtime, storage). Roles: student, supervisor, admin. Core: posts of kind grievance or suggestion with photo, location, category, severity; agree/disagree voting (one per user per post) with realtime counts; a supervisor moderation queue (approve/reject/request edits, posts hidden until approved); an admin dashboard with a kanban of statuses and pinned official remarks; a public status timeline; a Solved Archive with before/after photos; community-verified resolution (resolved → awaiting verification → archive after N confirmations, otherwise reopen); an Impact Score = net_votes × severity multiplier + min(days_open,14)×0.5; duplicate detection with pg_trgm via an RPC while the user types; and an AI photo-triage API route returning JSON {title, category, severity, safety_risk, department} with a 4s timeout and fallback. Add a `/live` full-screen leaderboard page with a QR code. Use the attached SQL schema. Dark theme, tokens: bg #0A1330, surface #121F4A, teal #2DD4BF, amber #FBBF24, pink #F472B6, fonts DM Serif Display + Manrope. No data tables for the main feed; use animated cards (Framer Motion `layout`). Mobile first.

**Seed prompt:**

> Write `scripts/seed.ts` using the Supabase service role to create 60 synthetic profiles, 25 campus locations, and 45 posts (list my real place names: `<paste yours>`) with realistic, partly Hinglish text, statuses across the whole lifecycle, heavy-tailed vote counts inserted as real vote rows, created_at spread over 6 weeks, 2 near-duplicate pairs, and 8 resolved items with before/after image URLs. Add an idempotent `--reset` flag.

**Demo-mode prompt:**

> Add a "Try the demo" row on the login page with three buttons (Student / Supervisor / Admin) that sign in via server-side `signInWithPassword` using env-configured demo accounts, plus an "Enter as guest" that uses Supabase `signInAnonymously`, creates a profile flagged `is_demo`, and has limited rate limits. Add an admin-only "Reset demo data" action.

**Triage prompt (AI route):**

> Create `POST /api/triage` that accepts an image, calls the vision model with a system prompt that returns ONLY JSON matching the schema, validates it with zod, times out at 4s, and returns `{fallback: true}` on any failure.

---

## 9. Judge Q&A cheat sheet

- **"We already have a grievance system."** The formal system is the record, and UpCampus is the prioritisation and proof layer. It feeds approved, top-ranked issues into it.
- **"Won't people spam or brigade?"** There's one verified email per vote, supervisor review before anything goes public, a vote audit, a penalty ladder, and an audit log that includes appeals.
- **"Why would admins use it?"** It gives them a ranked, filtered, de-duplicated list, with a budget justified by demand data. The "proved it got fixed" archive also helps them.
- **"What if admins mark things resolved falsely?"** Community verification reopens the ticket, and the accountability board makes it visible.
- **"Privacy?"** Anonymous-to-peers posting, and role-based row security. Only admins can see identities, and every view is logged.
- **"Does it scale?"** Postgres + RLS + Supabase scale well past one campus. The multi-campus design is a `campus_id` column plus per-campus domains (Phase 3).
- **"What's built vs planned?"** Be honest: P0 and P1 are built, and semantic AI duplicate detection, GIS heatmaps, and PDF work orders are the roadmap.