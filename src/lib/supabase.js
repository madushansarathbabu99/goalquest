import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* ─────────────────────────────────────────────────────────────
   RUN THIS SQL IN YOUR SUPABASE SQL EDITOR TO SET UP THE DB
   ─────────────────────────────────────────────────────────────

-- Enable uuid extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  score integer default 0,
  created_at timestamptz default now()
);

-- Goals
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  deadline timestamptz not null,
  completed boolean default false,
  completed_at timestamptz,
  points integer default 10,
  created_at timestamptz default now()
);

-- Friendships
create table public.friendships (
  id uuid default uuid_generate_v4() primary key,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  addressee_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending','accepted','rejected')) default 'pending',
  created_at timestamptz default now(),
  unique(requester_id, addressee_id)
);

-- Accountability messages (nudges)
create table public.nudges (
  id uuid default uuid_generate_v4() primary key,
  goal_id uuid references public.goals(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.friendships enable row level security;
alter table public.nudges enable row level security;

create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Goals viewable by owner and friends" on public.goals for select using (
  auth.uid() = user_id or
  exists (
    select 1 from public.friendships
    where status = 'accepted' and (
      (requester_id = auth.uid() and addressee_id = user_id) or
      (addressee_id = auth.uid() and requester_id = user_id)
    )
  )
);
create policy "Users manage own goals" on public.goals for all using (auth.uid() = user_id);

create policy "Friendship viewable by participants" on public.friendships for select using (
  auth.uid() = requester_id or auth.uid() = addressee_id
);
create policy "Users can request friendships" on public.friendships for insert with check (auth.uid() = requester_id);
create policy "Addressee can update friendship" on public.friendships for update using (auth.uid() = addressee_id or auth.uid() = requester_id);

create policy "Nudges viewable by goal owner and sender" on public.nudges for select using (
  auth.uid() = sender_id or
  exists (select 1 from public.goals where id = goal_id and user_id = auth.uid())
);
create policy "Friends can send nudges" on public.nudges for insert with check (auth.uid() = sender_id);
create policy "Goal owner can mark nudge read" on public.nudges for update using (
  exists (select 1 from public.goals where id = goal_id and user_id = auth.uid())
);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

*/
