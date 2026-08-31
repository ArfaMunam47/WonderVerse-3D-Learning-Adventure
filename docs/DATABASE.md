# Wonder Meadow — Database Schema & Data Architecture

**Document Version:** 1.0.0  
**Database Engines:** Supabase PostgreSQL 15+ (Production) / Structured JSON (Fallback)  
**Status:** FROZEN  

---

## 1. Entity Relationship & Table Specifications

### 1.1 `public.profiles`
Stores parent accounts and associated child explorer personas.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE` | Matches Supabase Auth user ID |
| `email` | `TEXT` | `NULLABLE` | Parent contact email |
| `child_name` | `TEXT` | `NOT NULL DEFAULT 'Explorer'` | Child explorer display name |
| `avatar` | `TEXT` | `NOT NULL DEFAULT '👧'` | Chosen avatar emoji or identifier |
| `gender` | `TEXT` | `NOT NULL DEFAULT 'girl' CHECK (gender IN ('boy', 'girl'))` | Explorer character style |
| `character_id` | `TEXT` | `NOT NULL DEFAULT 'curious_explorer'` | Selected character asset ID |
| `role` | `TEXT` | `NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'child', 'admin'))` | User role for RBAC |
| `bio` | `TEXT` | `DEFAULT ''` | Optional parent notes |
| `favorite_zone`| `TEXT` | `DEFAULT 'alphabet'` | Child's favorite learning area |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record last update timestamp |

**Indexes:**
- `CREATE INDEX idx_profiles_role ON profiles(role);`

**RLS Policies:**
- `SELECT`: `auth.uid() = id`
- `UPDATE`: `auth.uid() = id`
- `INSERT`: `auth.uid() = id`

---

### 1.2 `public.game_progress`
Tracks learning milestones, stars earned, activities completed, and sticker collections.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Record UUID |
| `user_id` | `UUID` | `UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` | Foreign key to user account |
| `stars` | `INTEGER` | `NOT NULL DEFAULT 0 CHECK (stars >= 0 AND stars <= 100000)` | Learning stars count |
| `completed_activities` | `TEXT[]` | `NOT NULL DEFAULT '{}'` | Array of completed activity IDs |
| `discovered_items` | `TEXT[]` | `NOT NULL DEFAULT '{}'` | Array of discovered interactive items |
| `stickers_unlocked` | `TEXT[]` | `NOT NULL DEFAULT '{}'` | Array of unlocked sticker badge IDs |
| `zone_visits` | `JSONB` | `NOT NULL DEFAULT '{"alphabet":0,"numbers":0,...}'` | Activity frequency metrics |
| `favorite_zone` | `TEXT` | `DEFAULT 'alphabet'` | Most active zone |
| `last_played` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Last active session timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record last update timestamp |

**Indexes:**
- `CREATE INDEX idx_game_progress_user_id ON game_progress(user_id);`

**RLS Policies:**
- `SELECT`: `auth.uid() = user_id`
- `UPDATE`: `auth.uid() = user_id`
- `INSERT`: `auth.uid() = user_id`

---

### 1.3 `public.user_preferences`
Stores child sensory accessibility preferences and audio configurations.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Record UUID |
| `user_id` | `UUID` | `UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` | Foreign key to user account |
| `sound_enabled` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Master audio toggle |
| `music_volume` | `NUMERIC(3,2)` | `NOT NULL DEFAULT 0.70 CHECK (music_volume >= 0 AND music_volume <= 1)` | Ambient background music volume |
| `sfxVolume` | `NUMERIC(3,2)` | `NOT NULL DEFAULT 0.80 CHECK (sfx_volume >= 0 AND sfx_volume <= 1)` | Sound effect feedback volume |
| `narration_enabled`| `BOOLEAN`| `NOT NULL DEFAULT TRUE` | Voiceover narration toggle |
| `reduced_motion` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Vestibular safety / reduced animations |
| `high_contrast` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Enhanced contrast mode |
| `dyslexic_font` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Dyslexia-friendly typography toggle |
| `large_text` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Large UI text toggle |
| `large_hit_targets`| `BOOLEAN`| `NOT NULL DEFAULT FALSE` | Motor coordination large touch targets |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record last update timestamp |

**Indexes:**
- `CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);`

**RLS Policies:**
- `SELECT`: `auth.uid() = user_id`
- `UPDATE`: `auth.uid() = user_id`
- `INSERT`: `auth.uid() = user_id`

---

### 1.4 `public.activity_logs`
Append-only log of educational milestones for parent insights.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Event UUID |
| `user_id` | `UUID` | `NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` | Foreign key to user account |
| `zone_id` | `TEXT` | `NOT NULL` | Zone identifier |
| `activity_id` | `TEXT` | `NOT NULL` | Specific game or task ID |
| `event_type` | `TEXT` | `NOT NULL` | `'start'`, `'complete'`, `'discover'` |
| `metadata` | `JSONB` | `DEFAULT '{}'` | Non-sensitive educational metrics |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Event timestamp |

**RLS Policies:**
- `SELECT`: `auth.uid() = user_id`
- `INSERT`: `auth.uid() = user_id`

---

## 2. Triggers & Data Integrity Protections

1. **`on_auth_user_created`**: Automatically provisions empty `profiles`, `game_progress`, and `user_preferences` rows when a user registers via Supabase Auth.
2. **`protect_profile_fields`**: Intercepts `UPDATE` operations on `profiles` to forbid non-service-role updates to the `role` and `id` columns.
3. **`update_updated_at_column`**: Automatically maintains accurate `updated_at` timestamps on all row modifications.
