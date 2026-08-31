# Wonder Meadow — Pre-Change Verification Checklist

Before introducing any backend, database schema, authentication, authorization, or API change after the freeze, complete and document every item in this 10-point checklist.

---

## 10-Point Pre-Change Checklist

- [ ] **1. Change Justification**: Clearly explain why the change is necessary and why it cannot be achieved within the existing API contract or UI state layer.
- [ ] **2. Contract Impact Analysis**: Identify all endpoints in `docs/BACKEND_CONTRACT.md` and methods in `src/utils/api.ts` that will be modified or added.
- [ ] **3. Database Schema & RLS Policy Check**: If modifying `supabase_schema.sql` or table structures, verify that:
  - Check constraints, defaults, and foreign keys are preserved.
  - Row-Level Security (RLS) policies are defined and enabled.
  - Triggers (e.g. `protect_profile_fields`) are updated if necessary.
- [ ] **4. Privilege Escalation & Authorization Audit**: Verify that the change cannot be exploited by a `child` or unauthenticated client to elevate permissions or mutate data owned by other parents/children.
- [ ] **5. Input Sanitization & Boundaries**: Verify that all new inputs enforce length limits, string sanitization (HTML/null byte stripping), and numeric boundary clamping.
- [ ] **6. Rate Limiting**: Ensure any new public or AI endpoints are protected by appropriate rate limiters.
- [ ] **7. Child Privacy & Data Minimization**: Confirm that no personally identifiable child information (full real names, locations, voice recordings, camera frames) is collected or stored.
- [ ] **8. Automated Test Updates**: Add corresponding test assertions to `scripts/run_backend_security_tests.ts` to cover the new behavior.
- [ ] **9. Regression Testing**: Execute `npm test` and verify that all test suites pass with 0 failures.
- [ ] **10. Documentation Sync**: Update `docs/BACKEND_CONTRACT.md`, `docs/DATABASE.md`, `docs/SECURITY_BASELINE.md`, and record the modification in `docs/CHANGELOG.md`.

---

## Escalation Protocol
If a proposed change breaks backward compatibility with existing active client sessions or Google Play Store builds, the change must be versioned under a new API path (e.g. `/api/v2/...`) with fallback support.
