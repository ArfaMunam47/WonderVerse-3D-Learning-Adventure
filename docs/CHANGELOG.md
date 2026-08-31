# Wonder Meadow — Infrastructure & Backend Changelog

All notable changes, security hardenings, database schemas, and architectural updates prior to the backend freeze are documented in this file.

---

## [1.0.0] - 2026-08-31 - Backend Foundation & Security Baseline Freeze

### Added
- **Automated Backend & Security Test Suite** (`scripts/run_backend_security_tests.ts`):
  - 12 comprehensive unit and integration test assertions covering authentication, authorization, cryptographic hashing, IDOR prevention, numeric boundaries, input sanitization, rate limiting, and secret isolation.
  - Added `npm test` script to `package.json`.
- **Comprehensive Backend Documentation**:
  - `docs/BACKEND_CONTRACT.md`: Complete API schemas, status codes, payload boundaries, rate limits, and service contracts.
  - `docs/SECURITY_BASELINE.md`: Security architecture, password hashing rules, RBAC specifications, child privacy technical safeguards, and header configs.
  - `docs/DATABASE.md`: Relational database schemas, primary/foreign keys, check constraints, RLS policies, indexes, and triggers.
  - `docs/FRONTEND_SAFE_CHANGE_POLICY.md`: Rigid boundaries and operating rules for UI engineers to protect backend stability.
  - `docs/CHANGE_CHECKLIST.md`: Formal 10-step review checklist required before applying any future backend change.
  - `docs/BACKEND_FREEZE.md`: Official freeze signoff and baseline status.

### Security & Hardening
- **HTTP Security Headers in Express**:
  - Configured `X-Content-Type-Options: nosniff`.
  - Configured `Referrer-Policy: strict-origin-when-cross-origin`.
  - Configured `X-XSS-Protection: 0`.
  - Configured `X-DNS-Prefetch-Control: off`.
  - Configured `X-Permitted-Cross-Domain-Policies: none`.
- **Cryptographic Password Security**:
  - Hardened fallback password hashing to use `crypto.scryptSync` with 16-byte random salts and 64-byte keys.
  - Enforced `crypto.timingSafeEqual` to eliminate timing side-channel attacks on credentials.
- **Input Validation & Sanitization**:
  - Bounded JSON payload parser to `100kb`.
  - Enforced string sanitization removing HTML brackets, null bytes, and ASCII control characters.
  - Clamped numerical boundaries for progress metrics (`stars` 0-100,000) and audio volumes (0.0-1.0).
- **Privacy & Safety Claims Alignment**:
  - Refined UI trust copy in `AuthModal.tsx` and `ParentCaregiverArea.tsx` from premature certification claims to accurate, auditable "Privacy-by-Design" technical safeguard descriptions.

### Database & Service Layer
- Verified Supabase SQL schema (`supabase_schema.sql`) with comprehensive Row-Level Security (RLS) policies on all tables (`profiles`, `game_progress`, `user_preferences`, `activity_logs`).
- Implemented `protect_profile_fields` database trigger to block role escalation and user ID mutation.
- Verified service layer abstraction in `src/services/` (`authService.ts`, `profileService.ts`, `progressService.ts`, `preferencesService.ts`, `supabase.ts`, and `api.ts`).
