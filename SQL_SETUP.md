# Supabase SQL Database Setup

To hook up your real Supabase backend, follow these simple steps to create the necessary tables in your database.

## Instructions
1. Open your [Supabase Dashboard](https://supabase.com/).
2. Select your project and navigate to the **SQL Editor** tab in the left-hand menu.
3. Click **New Query**.
4. Copy and paste the entire SQL block below into the editor, and click **Run**.

---

## SQL Script

```sql
-- 1. REGISTERS TABLE (Your actual Supabase schema)
CREATE TABLE IF NOT EXISTS public.registers (
    maid_id TEXT PRIMARY KEY, -- Primary Key (email address)
    name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    domain TEXT,
    phone_number TEXT,
    years_of_experience INTEGER DEFAULT 0,
    business_partner_details TEXT,
    address TEXT,
    office_address TEXT,
    office_number TEXT,
    profile_photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) and grant explicit public access
ALTER TABLE public.registers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON public.registers FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.registers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.registers FOR UPDATE USING (true) WITH CHECK (true);


-- 2. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.registers(maid_id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_company TEXT,
    type TEXT CHECK (type IN ('update', 'product', 'achievement', 'networking')) DEFAULT 'update',
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.posts FOR UPDATE USING (true) WITH CHECK (true);


-- 3. CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    connected_user_id TEXT NOT NULL,
    status TEXT DEFAULT 'connected',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, connected_user_id)
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON public.connections FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.connections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.connections FOR UPDATE USING (true) WITH CHECK (true);


-- 4. RSVPS TABLE
CREATE TABLE IF NOT EXISTS public.rsvps (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    event_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    utr_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON public.rsvps FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.rsvps FOR UPDATE USING (true) WITH CHECK (true);
```

---

## Supabase Settings
Once you've run this script, copy your **Project URL** and **API Anon Key** from your Supabase Project Settings (under API settings), open your local WAP app in your browser, and click the **Supabase Database Settings** gear icon in the navigation bar to paste them!
