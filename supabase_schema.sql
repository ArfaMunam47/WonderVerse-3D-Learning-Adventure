-- ==============================================================================
-- WONDER MEADOW — SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- HARDENED PRODUCTION SECURITY CONFIGURATION
-- ==============================================================================
-- This script configures:
-- 1. Strict table schemas with check constraints
-- 2. Principle of Least Privilege and hardened SECURITY DEFINER functions
-- 3. Comprehensive Row Level Security (RLS) for SELECT, INSERT, UPDATE, DELETE
-- 4. Protection against privilege escalation (role cannot be updated by client)
-- ==============================================================================

-- 1. Create Profiles Table (User / Parent / Child Identity)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  child_name VARCHAR(100) NOT NULL DEFAULT 'Explorer',
  avatar VARCHAR(20) NOT NULL DEFAULT '👧',
  gender VARCHAR(10) NOT NULL DEFAULT 'girl' CHECK (gender IN ('girl', 'boy')),
  character_id VARCHAR(50) NOT NULL DEFAULT 'curious_explorer',
  role VARCHAR(20) NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'child', 'admin')),
  bio VARCHAR(500) DEFAULT '',
  favorite_zone VARCHAR(50) DEFAULT 'alphabet',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create Game Progress Table (Learning stars, discoveries, zone visits)
CREATE TABLE IF NOT EXISTS public.game_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  stars INTEGER NOT NULL DEFAULT 0 CHECK (stars >= 0 AND stars <= 100000),
  completed_activities JSONB NOT NULL DEFAULT '[]'::jsonb,
  discovered_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  stickers_unlocked JSONB NOT NULL DEFAULT '[]'::jsonb,
  zone_visits JSONB NOT NULL DEFAULT '{"alphabet": 0, "numbers": 0, "fruits": 0, "animals": 0, "creative": 0, "music": 0, "stories": 0, "stars": 0}'::jsonb,
  favorite_zone VARCHAR(50) DEFAULT 'alphabet',
  last_played TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create User Preferences Table (Accessibility, Audio, Screen Settings)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  music_volume NUMERIC(3, 2) NOT NULL DEFAULT 0.70 CHECK (music_volume >= 0 AND music_volume <= 1.0),
  sfx_volume NUMERIC(3, 2) NOT NULL DEFAULT 0.80 CHECK (sfx_volume >= 0 AND sfx_volume <= 1.0),
  narration_enabled BOOLEAN NOT NULL DEFAULT true,
  reduced_motion BOOLEAN NOT NULL DEFAULT false,
  high_contrast BOOLEAN NOT NULL DEFAULT false,
  dyslexic_font BOOLEAN NOT NULL DEFAULT false,
  large_text BOOLEAN NOT NULL DEFAULT false,
  large_hit_targets BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS) on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 5. Strict Row Level Security Policies (Only authenticated owners access their data)

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Game Progress Policies
DROP POLICY IF EXISTS "Users can view own game progress" ON public.game_progress;
CREATE POLICY "Users can view own game progress"
  ON public.game_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own game progress" ON public.game_progress;
CREATE POLICY "Users can update own game progress"
  ON public.game_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own game progress" ON public.game_progress;
CREATE POLICY "Users can insert own game progress"
  ON public.game_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own game progress" ON public.game_progress;
CREATE POLICY "Users can delete own game progress"
  ON public.game_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User Preferences Policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_preferences;
CREATE POLICY "Users can delete own preferences"
  ON public.user_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Privilege Escalation Prevention Trigger (Protects 'role' and 'id' from client modification)
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent changing the primary ID
  IF NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'Cannot alter user ID';
  END IF;

  -- Prevent users from escalating their own role
  IF NEW.role <> OLD.role AND (auth.jwt()->>'role' IS NULL OR auth.jwt()->>'role' <> 'service_role') THEN
    NEW.role := OLD.role;
  END IF;

  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS tr_protect_profile_fields ON public.profiles;
CREATE TRIGGER tr_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- 7. Trigger Function to Automatically Seed Profile, Progress & Preferences on Sign Up
-- Hardened with explicit immutable search_path (Prevents search path hijacking)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.profiles
  INSERT INTO public.profiles (
    id,
    email,
    child_name,
    avatar,
    gender,
    character_id,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'child_name'), ''), NULLIF(TRIM(NEW.raw_user_meta_data->>'childName'), ''), 'Explorer'),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar'), ''), '👧'),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gender'), ''), 'girl'),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'character_id'), ''), NULLIF(TRIM(NEW.raw_user_meta_data->>'characterId'), ''), 'curious_explorer'),
    'parent' -- Always default to parent role on public signup
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into public.game_progress
  INSERT INTO public.game_progress (
    user_id,
    stars,
    completed_activities,
    discovered_items,
    stickers_unlocked,
    zone_visits,
    favorite_zone
  )
  VALUES (
    NEW.id,
    0,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{"alphabet": 0, "numbers": 0, "fruits": 0, "animals": 0, "creative": 0, "music": 0, "stories": 0, "stars": 0}'::jsonb,
    'alphabet'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert into public.user_preferences
  INSERT INTO public.user_preferences (
    user_id,
    sound_enabled,
    music_volume,
    sfx_volume,
    narration_enabled,
    reduced_motion,
    high_contrast,
    dyslexic_font,
    large_text,
    large_hit_targets
  )
  VALUES (
    NEW.id,
    true,
    0.70,
    0.80,
    true,
    false,
    false,
    false,
    false,
    false
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Trigger execution on auth.users after insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Revoke default public execution privileges on sensitive internal functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.protect_profile_fields() FROM PUBLIC;
