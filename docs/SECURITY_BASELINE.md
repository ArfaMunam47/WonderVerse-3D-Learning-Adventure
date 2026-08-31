# Wonder Meadow — Security Baseline & Technical Safeguards

**Document Version:** 1.0.0  
**Security Status:** AUDITED & BASELINED  
**Date:** 2026-08-31

---

## 1. Authentication & Cryptography Architecture

1. **Password Hashing**:
   - Primary: Supabase GoTrue Auth uses bcrypt (work factor 10) with per-user cryptographic salts.
   - Fallback Engine (`server.ts`): Uses Node.js native `crypto.scryptSync(password, salt, 64)` with 16-byte random salts (`crypto.randomBytes(16)`).
   - Password Comparison: Uses `crypto.timingSafeEqual` to prevent side-channel timing attacks.
2. **Session & Token Management**:
   - JWT tokens signed with secure server secrets.
   - Tokens stored in `localStorage` under isolated key `wonder_meadow_auth_token`.
   - Token expiration validated on every request in middleware.
3. **Account Enumeration Defense**:
   - Login endpoints return generic messages ("Incorrect email or password") regardless of whether the email exists.
   - Sign up errors do not expose internal database error details.

---

## 2. Authorization & Role-Based Access Control (RBAC)

1. **Roles Defined**:
   - `parent`: Full access to manage their child's profile, view progress dashboards, customize accessibility settings, and adjust parental controls.
   - `child`: Read-only access to their allocated learning zones, progress milestones, and avatar customizer. Cannot access billing, account deletion, or raw parent email.
   - `admin`: Reserved system operator role.
2. **Privilege Escalation Protection**:
   - Client profile update payloads cannot modify the `role` attribute.
   - In Supabase, the `protect_profile_fields` database trigger rejects any attempt by non-service-role clients to alter the `role` column or update another user's `id`.
3. **Cross-Tenant & Cross-User Isolation (IDOR Defense)**:
   - All server API routes enforce `WHERE user_id = req.user.id` or `WHERE id = req.user.id`.
   - In Supabase PostgreSQL, Row-Level Security (RLS) is enabled on all public tables:
     - `profiles`: `USING (auth.uid() = id)`
     - `game_progress`: `USING (auth.uid() = user_id)`
     - `user_preferences`: `USING (auth.uid() = user_id)`
     - `activity_logs`: `USING (auth.uid() = user_id)`

---

## 3. Technical Child Data Protection & Privacy Architecture

> **Notice Regarding Legal Certifications:**  
> Wonder Meadow is architected strictly following privacy-by-design principles (COPPA, GDPR-K, FERPA alignment). Formal regulatory certification (e.g. PRIVO, kidSAFE) will be obtained prior to Google Play Store production release during legal review.

**Technical Safeguards Implemented:**
- **Zero Third-Party Advertising / Trackers**: No advertising SDKs, behavioral trackers, or third-party pixel analytics are included in the bundle.
- **Data Minimization**: No child's real last name, physical address, precise geolocation, microphone audio recordings, or camera streams are stored or transmitted.
- **Parent-Governed Controls**: Sensitive settings and family account data are shielded behind parental verification challenges.
- **Right to Erasure / Account Reset**: Parents can reset all game progress or delete account profiles on demand.

---

## 4. Input Validation & Defense-in-Depth

1. **Payload Size Clamping**:
   - `express.json({ limit: '100kb' })` prevents memory exhaustion / denial-of-service via oversized JSON payloads.
2. **String Sanitization**:
   - `sanitizeText()` strips HTML tags (`<`, `>`), null bytes (`\x00`), ASCII control characters (`\x00-\x1F\x7F`), and enforces hard string length ceilings.
3. **Numeric Boundary Clamping**:
   - Stars: Clamped `0 <= stars <= 100,000`.
   - Volumes: Clamped `0.0 <= volume <= 1.0`.
4. **Rate Limiting Engine**:
   - Authentication Endpoints: 10 requests / 15 minutes per IP.
   - AI Content Generation Endpoints: 15 requests / 1 minute per IP.
   - Uses sliding-window in-memory tracking with automatic cleanup.

---

## 5. Defense-in-Depth HTTP Security Headers

Every HTTP response emitted by the server includes:
- `X-Content-Type-Options: nosniff` (Prevents MIME-type sniffing)
- `Referrer-Policy: strict-origin-when-cross-origin` (Protects query/path information)
- `X-XSS-Protection: 0` (Modern standard recommendation)
- `X-DNS-Prefetch-Control: off` (Protects domain privacy)
- `X-Permitted-Cross-Domain-Policies: none` (Disallows Flash/Acrobat cross-domain policies)

---

## 6. Secrets Management

- **Client Bundle**: Contains ONLY public, client-safe variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- **Server Environment**: `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and session encryption keys are strictly accessed server-side in `server.ts` or cloud deployment configs.
- **Pre-commit / CI Audits**: No private keys or production secrets are committed to the repository.
