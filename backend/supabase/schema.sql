-- Supabase Postgres schema for Journalling app (fresh deploy)
-- Apply in Supabase SQL Editor.

create table if not exists public.users (
  id serial primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  reset_token text,
  reset_token_expires timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.transcripts (
  id serial primary key,
  recording_id integer not null,
  text text not null,
  language text,
  confidence double precision,
  created_at timestamptz not null default now()
);

create table if not exists public.entries (
  id serial primary key,
  user_id integer not null,
  transcript text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  duration_ms integer,
  -- In production this will store a full public URL to Supabase Storage
  local_path text,
  transcript_id integer,
  journal_date date not null default current_date,
  -- Legacy field (we won't store blobs in Postgres)
  audio_blob bytea,
  -- RestDB sync fields
  drive_sync_enabled boolean not null default false,
  sync_status text,
  last_sync_error text,
  constraint fk_entries_user foreign key (user_id) references public.users(id) on delete cascade,
  constraint fk_entries_transcript foreign key (transcript_id) references public.transcripts(id) on delete set null
);

-- Ensure transcript.recording_id points to entries.id
alter table public.transcripts
  drop constraint if exists fk_transcripts_recording;
alter table public.transcripts
  add constraint fk_transcripts_recording foreign key (recording_id) references public.entries(id) on delete cascade;

create index if not exists idx_entries_user_created_at on public.entries(user_id, created_at desc);
create index if not exists idx_entries_user_journal_date on public.entries(user_id, journal_date);
create index if not exists idx_transcripts_recording_created_at on public.transcripts(recording_id, created_at desc);


