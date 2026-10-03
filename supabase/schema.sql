-- ====================================================================
-- UpCampus Production Schema DDL
-- Author: Aryan
-- Target: Supabase Postgres 15+
-- ====================================================================

create extension if not exists pg_trgm;

-- Enumerations
do $$ begin
  create type user_role as enum ('student', 'supervisor', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type post_kind as enum ('grievance', 'suggestion');
exception when duplicate_object then null; end $$;

do $$ begin
  create type post_status as enum (
    'pending',
    'approved',
    'rejected',
    'needs_edit',
    'under_review',
    'in_progress',
    'awaiting_verification',
    'resolved',
    'reopened'
  );
exception when duplicate_object then null; end $$;

-- Profiles
create table if not exists profiles (
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
create table if not exists locations (
  id serial primary key,
  name text not null unique,
  zone text not null,
  lat float,
  lng float
);

-- Posts
create table if not exists posts (
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

create index if not exists idx_posts_search on posts using gin ((title || ' ' || coalesce(description, '')) gin_trgm_ops);
create index if not exists idx_posts_feed on posts (status, created_at desc) where status != 'rejected';
create index if not exists idx_posts_location on posts (location_id);

-- Votes
create table if not exists votes (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Status Events
create table if not exists status_events (
  id bigserial primary key,
  post_id uuid not null references posts(id) on delete cascade,
  from_status post_status,
  to_status post_status not null,
  remark text,
  pinned boolean not null default false,
  actor_id uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- Verifications
create table if not exists verifications (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  fixed boolean not null,
  comment text,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Moderation Actions
create table if not exists moderation_actions (
  id bigserial primary key,
  post_id uuid not null references posts(id) on delete cascade,
  actor_id uuid not null references profiles(id),
  action text not null,
  reason text,
  created_at timestamptz not null default now()
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

-- Duplicate Search RPC
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

-- Trigger to maintain vote tally
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

drop trigger if exists trg_votes_tally on votes;
create trigger trg_votes_tally
after insert or update or delete on votes
for each row execute function update_post_vote_counts();
