# UpCampus: Master Architecture, Cognitive Blueprint & Execution Roadmap

> **Authoritative Specification Document**
> Incorporating the **Aryan Cognitive Engine** (Universal Edge-Case Playbook) & **Aryan UI/UX Design Engine** (AntiGravity SaaS Architect).

---

## 0. Table of Contents
1. Executive Architecture & Invariant Principles
2. Complete Database DDL & State Machine
3. End-to-End Real Use Case Flows (Ingress to Egress)
4. UI/UX Design System, Token Registry & ASCII Wireframes
5. Phased Implementation Roadmap (Level-by-Level Execution)
6. Living Codebase Topology & Directory Structure

---

## 1. Executive Architecture & Invariant Principles

### 1.1 The Aryan Cognitive Engine: 6 Core Dimensions
- **1. The Next-Iteration Loop Trace (Redundancy & Loop Dynamics):**
  - *Duplicate Detection Debounce:* Live trigram searches while typing a grievance title are debounced at 300ms with a client-side LRU memory cache. Identical search terms in a single session bypass network and DB cycles.
  - *Optimistic Vote Flip-Flop:* Rapid clicks between Agree (+1) and Disagree (-1) are throttled in UI state; only the terminal settled state is dispatched to the network to prevent race conditions.
- **2. The Downstream Presentation Trace (The UI Blast Radius):**
  - *Absolute Physical Truth vs. Anonymity:* Database persists `author_id` unconditionally for administrative accountability and strike tracking. Public APIs project anonymous posts with `display_name = 'Anonymous Student'` and a deterministic hash avatar, stripping raw user UUIDs from client payloads.
  - *DOM Stability on Live Updates:* Upvote numbers update via WebSockets, but card vertical positions remain anchored until user requests re-sorting or smooth FLIP animations glide without abrupt layout jumps.
- **3. The Restart / Crash Resume Trace (State Persistence):**
  - *AI Triage Circuit-Breaker:* Gemini Vision API calls enforce an `AbortController` timeout of 3,800ms. On abort or failure, `{ fallback: true }` gracefully returns, immediately switching the form to manual input.
  - *Atomic Idempotent Seed Reset:* Demo reset runs inside a single SQL transaction (`BEGIN ... TRUNCATE ... RE-SEED ... COMMIT`), preventing half-empty database states during live pitch rehearsals.
- **4. Hardware & Concurrency Maximization (Eliminating Bottlenecks):**
  - *Client-Side Image Offloading:* 10MB phone camera snaps are downscaled client-side on HTML5 Canvas to 1280px WebP (~180KB) in < 120ms before hitting Supabase Storage.
  - *Database Trigger Aggregation:* High-concurrency votes update counter columns (`agree_count`, `disagree_count`) via Postgres row triggers. Clients subscribe to low-frequency `posts` updates rather than high-frequency raw `votes` streams.
- **5. Subprocess Interactive Freeze & Failure Fallback:**
  - *Zero-Lock AI Route:* If college Wi-Fi drops, pre-baked fallback mocks for demo photos match image hash/dimensions and supply instant structured JSON.
- **6. The "No Patch Jobs" Rule (Root Data Model):**
  - *Verified Resolution State Machine:* An admin cannot unilaterally mark an issue `resolved`. The post transitions to `awaiting_verification`. Only community student consensus transitions it to `resolved` (Solved Archive) or `reopened`.

---

## 2. Complete Database DDL & State Machine

```sql
-- Extensions
create extension if not exists pg_trgm;

-- Enumerations
create type user_role as enum ('student', 'supervisor', 'admin');
create type post_kind as enum ('grievance', 'suggestion');
create type post_status as enum (
  'pending',                -- Initial state: visible only to author & supervisor
  'approved',               -- Approved by supervisor: live on public feed
  'rejected',               -- Rejected by supervisor: hidden
  'needs_edit',             -- Returned to student with modification notes
  'under_review',           -- Admin has acknowledged and queued for work
  'in_progress',            -- Department currently working on-site
  'awaiting_verification',  -- Work done: awaiting voter consensus
  'resolved',               -- Confirmed fixed by student community -> Solved Archive
  'reopened'                -- Rejected by students -> Escalate back to Admin
);

-- Profiles Table (Linked to Supabase Auth)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  display_name text not null,
  role user_role not null default 'student',
  strikes int not null default 0,
  suspended_until timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz default now()
);

-- Campus Locations
create table locations (
  id serial primary key,
  name text not null unique,
  zone text not null,
  lat float,
  lng float
);

-- Core Posts Table
create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  kind post_kind not null default 'grievance',
  title text not null check (char_length(title) between 8 and 120),
  description text,
  category text not null,
  severity int not null default 1 check (severity between 1 and 3),
  safety_risk boolean not null default false,
  department text not null,
  location_id int references locations(id),
  photos text[] default '{}',
  anonymous boolean not null default false,
  status post_status not null default 'pending',
  agree_count int not null default 0,
  disagree_count int not null default 0,
  ai_meta jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- Indexes
create index idx_posts_search on posts using gin ((title || ' ' || coalesce(description, '')) gin_trgm_ops);
create index idx_posts_feed on posts (status, created_at desc) where status != 'rejected';
create index idx_posts_location on posts (location_id);

-- One Student = One Vote
create table votes (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Public Audit Timeline (Every transition is a permanent receipt)
create table status_events (
  id bigserial primary key,
  post_id uuid not null references posts(id) on delete cascade,
  from_status post_status,
  to_status post_status not null,
  remark text,
  pinned boolean not null default false,
  actor_id uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- Community Resolution Verification Table
create table verifications (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  fixed boolean not null,
  comment text,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Dynamic Impact Calculation View
create or replace view post_scores as
select 
  p.*,
  (p.agree_count - p.disagree_count) as net_votes,
  (
    (p.agree_count - p.disagree_count) * 
    case p.severity 
      when 3 then 2.5 
      when 2 then 1.5 
      else 1.0 
    end
    + least(extract(day from (now() - p.created_at)), 14) * 0.5
    + case when p.safety_risk then 15.0 else 0.0 end
  )::numeric(10,2) as impact_score
from posts p;

-- Sub-5ms Fuzzy Duplicate Detector (RPC)
create or replace function similar_posts(q text, loc_id int default null)
returns table (
  id uuid,
  title text,
  status post_status,
  agree_count int,
  similarity_score real
)
language sql stable as $$
  select 
    p.id, 
    p.title, 
    p.status, 
    p.agree_count,
    (similarity(p.title || ' ' || coalesce(p.description, ''), q) + 
     case when loc_id is not null and p.location_id = loc_id then 0.18 else 0.0 end)::real as similarity_score
  from posts p
  where p.status in ('approved', 'under_review', 'in_progress', 'awaiting_verification', 'reopened')
    and similarity(p.title || ' ' || coalesce(p.description, ''), q) > 0.22
  order by similarity_score desc 
  limit 3;
$$;

-- Vote Tally Trigger
create or replace function update_post_vote_counts()
returns trigger language plpgsql as $$
begin
  if (TG_OP = 'INSERT') then
    if (NEW.value = 1) then
      update posts set agree_count = agree_count + 1 where id = NEW.post_id;
    else
      update posts set disagree_count = disagree_count + 1 where id = NEW.post_id;
    end if;
  elsif (TG_OP = 'UPDATE') then
    if (OLD.value != NEW.value) then
      if (NEW.value = 1) then
        update posts set agree_count = agree_count + 1, disagree_count = greatest(0, disagree_count - 1) where id = NEW.post_id;
      else
        update posts set disagree_count = disagree_count + 1, agree_count = greatest(0, agree_count - 1) where id = NEW.post_id;
      end if;
    end if;
  elsif (TG_OP = 'DELETE') then
    if (OLD.value = 1) then
      update posts set agree_count = greatest(0, agree_count - 1) where id = OLD.post_id;
    else
      update posts set disagree_count = greatest(0, disagree_count - 1) where id = OLD.post_id;
    end if;
  end if;
  return null;
end;
$$;

create trigger trg_votes_tally
after insert or update or delete on votes
for each row execute function update_post_vote_counts();
```

---

## 3. End-to-End Real Use Case Flows

```
[Student Mobile]         [Next.js Server API]         [Postgres / RLS]          [Supervisor/Admin]
       │                         │                           │                           │
  1. Snap Photo ─────────────► /api/triage                   │                           │
       │                   (Gemini 4s Timeout)               │                           │
       │                         │                           │                           │
  2. Prefill + Types Title ──► /api/similar ────────► pg_trgm index                      │
       │                   (Live Dupe Check)                 │                           │
       │                         │                           │                           │
  3. Submit Post ────────────► /api/posts ──────────► INSERT posts                       │
       │                                            (status: pending)                    │
       │                                                     │                           │
  4. Instant Queue Alert ────────────────────────────────────┼─────────────────────► [Supervisor Queue]
       │                                                     │                     (Key 'A' Approve)
       │                                                     ▼                           │
  5. Post Activated ◄────────────────────────────── UPDATE posts (approved) ◄────────────┘
       │                                                     │
  6. Realtime Upvotes ───────► /api/votes ──────────► INSERT votes                       │
       │                                            (Trigger tally update)               │
       │                                                     │                           │
  7. Impact Score Elevation ────────────────────────► Ranked #1 in Kanban ─────────► [Admin Control Room]
       │                                                     │                     (Pins "Parts Ordered")
       │                                                     ▼                           │
  8. Admin Marks "Done" ────────────────────────────► UPDATE posts                       │
       │                                            (awaiting_verification)              │
       │                                                     │                           │
  9. Verification Card Pops ◄────────────────────────────────┤                           │
     "Is it actually fixed?"                                 │                           │
       │                                                     │                           │
 10. 5x "YES" Consensus ────► /api/verify ──────────► UPDATE posts                       │
       │                                            (status: resolved)                   │
       │                                            Move to Solved Archive ────────► Public Record
```

---

## 4. UI/UX Design System & ASCII Wireframes

### 4.1 Design Tokens

| Token | Hex Code | Usage |
| :--- | :--- | :--- |
| **Canvas Background** | `#0A1330` | Deep Midnight Navy |
| **Surface / Card** | `#121F4A` | Raised Component Surface |
| **Elevated / Popover** | `#1A2B66` | Modals, Dropdowns, Hovered Cards |
| **Structural Border** | `#22305F` | High-contrast subtle borders |
| **Primary Brand** | `#2DD4BF` | Hyper-Teal (Primary buttons, Upvote active, Focus rings) |
| **Accent Glow** | `#FBBF24` | Warm Amber (Build/Suggestions tab, In-Progress status) |
| **Hot / Urgent** | `#F472B6` | Neon Pink (Impact score flame, Safety Risk alert) |
| **Text Primary** | `#F8FAFC` | Slate 50 (Titles, high-contrast labels) |
| **Text Secondary** | `#94A3B8` | Slate 400 (Metadata, timestamps, categories) |

### 4.2 ASCII Wireframe: Student Feed & Vote Rail

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ⚡ UPCAMPUS  │  [ All Issues ]  [ Fix (Grievances) ]  [ Build (Suggestions) ]  │ [Role: Student ▼]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   🔍 Search campus issues... [Ctrl + K]    [ Sort: Impact Score ▼ ]  [ Filter: Hostels ▼ ]│
│                                                                                        │
│  ┌─ ⚠️ NEEDS ATTENTION TODAY (Safety Risk) ──────────────────────────────────────────┐ │
│  │  ▲ 142 │ ⚡ DARK CORRIDOR: Hostel 4 to Mess Road                                 │ │
│  │  ▼     │ 📍 North Campus Zone • 3 days open • [ Impact: 84.5 ] • [ In Progress ]   │ │
│  └────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐│
│  │ ┌────┐  📹 Severe water leakage under Sink 3 in Chemistry Lab         [In Progress]││
│  │ │ ▲  │                                                                             ││
│  │ │ 86 │  📍 Chemistry Block Ground Floor • Sanitation Dept • 18m ago                ││
│  │ │ ▼  │                                                                             ││
│  │ └────┘  "Water has flooded the corridor near Lab 2. Major slip hazard."            ││
│  │         ────────────────────────────────────────────────────────────────────────── ││
│  │         💬 14 comments  •  📷 2 photos  •  ⚡ Impact: 52.0 [?]  •  By: Anonymous    ││
│  └────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                        │
│                                                                ┌──────────────────────┐│
│                                                                │  [ + REPORT ISSUE ]  ││
│                                                                └──────────────────────┘│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Phased Implementation Roadmap (Level-by-Level Execution)

```
┌────────────────────────────────────────────────────────────────────────┐
│                       LEVEL-BY-LEVEL ROADMAP                           │
├────────────────────────────────────────────────────────────────────────┤
│ Level 1: Foundation & Scaffold (Next.js 14, Tailwind Tokens, Supabase) │
│ Level 2: Seed Pipeline & One-Tap Demo Mode                             │
│ Level 3: Feed, Left Vote Rail & Realtime Synchronization               │
│ Level 4: Snap Photo, AI Triage & Live Duplicate Interceptor            │
│ Level 5: Supervisor Queue (`/queue`) with Keyboard Shortcuts (A/R/E)   │
│ Level 6: Admin Kanban & Department Accountability (`/admin`)           │
│ Level 7: Community Verification Loop & Solved Archive (`/archive`)     │
│ Level 8: Projector Live Wall (`/live`) & Presentation QR Mode          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Living Codebase Topology

- Project Root: `d:\Projects\UpCampus`
- Master Plan: `UPCAMPUS_ARCHITECTURE_AND_ROADMAP.md`
- Documentation Directory: `docs/`
