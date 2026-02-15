-- Run this in Supabase SQL Editor to create tables and enable Realtime.

create table if not exists polls (
  id text primary key,
  slug text unique not null,
  question text not null,
  created_at timestamptz default now()
);

create table if not exists options (
  id text primary key,
  poll_id text not null references polls(id) on delete cascade,
  text text not null,
  sort_order int not null default 0
);

create table if not exists votes (
  id text primary key,
  option_id text not null references options(id) on delete cascade,
  poll_id text not null references polls(id) on delete cascade,
  voter_fingerprint text not null,
  ip_hash text not null,
  created_at timestamptz default now(),
  unique(poll_id, voter_fingerprint),
  unique(poll_id, ip_hash)
);

create index if not exists idx_votes_poll_id on votes(poll_id);
create index if not exists idx_options_poll_id on options(poll_id);

-- Enable Realtime for votes so clients can subscribe to new votes.
alter publication supabase_realtime add table votes;
