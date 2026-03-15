---
phase: 1
slug: auth
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x + @testing-library/react-native |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx jest --testPathPattern=auth --passWithNoTests` |
| **Full suite command** | `npx jest --passWithNoTests` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=auth --passWithNoTests`
- **After every plan wave:** Run `npx jest --passWithNoTests`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | — | infra | `npx jest --passWithNoTests` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | AUTH-01 | unit | `npx jest tests/auth/phone-otp.test.ts -t "sends OTP"` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | AUTH-01 | unit | `npx jest tests/auth/phone-otp.test.ts -t "verifies OTP"` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 1 | AUTH-02 | unit | `npx jest tests/auth/google.test.ts` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 1 | AUTH-03 | unit | `npx jest tests/auth/email.test.ts -t "sign up"` | ❌ W0 | ⬜ pending |
| 01-04-02 | 04 | 1 | AUTH-03 | unit | `npx jest tests/auth/email.test.ts -t "sign in"` | ❌ W0 | ⬜ pending |
| 01-05-01 | 05 | 2 | AUTH-04 | unit | `npx jest tests/auth/session-persistence.test.ts` | ❌ W0 | ⬜ pending |
| 01-05-02 | 05 | 2 | AUTH-04 | unit | `npx jest tests/auth/auto-refresh.test.ts` | ❌ W0 | ⬜ pending |
| 01-06-01 | 06 | 2 | AUTH-05 | unit | `npx jest tests/auth/profile-sync.test.ts` | ❌ W0 | ⬜ pending |
| 01-07-01 | 07 | 2 | — | unit | `npx jest tests/auth/pin-store.test.ts` | ❌ W0 | ⬜ pending |
| 01-07-02 | 07 | 2 | — | unit | `npx jest tests/auth/biometric.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jest.config.js` — Jest configuration with babel-jest for Expo
- [ ] `jest.setup.js` — Mock `expo-secure-store`, `expo-local-authentication`, `@react-native-google-signin/google-signin`
- [ ] `tests/auth/phone-otp.test.ts` — stubs for AUTH-01
- [ ] `tests/auth/google.test.ts` — stubs for AUTH-02
- [ ] `tests/auth/email.test.ts` — stubs for AUTH-03
- [ ] `tests/auth/session-persistence.test.ts` — stubs for AUTH-04
- [ ] `tests/auth/auto-refresh.test.ts` — stubs for AUTH-04
- [ ] `tests/auth/profile-sync.test.ts` — stubs for AUTH-05
- [ ] `tests/auth/pin-store.test.ts` — PIN lockout behavior
- [ ] `tests/auth/biometric.test.ts` — biometric fallback
- [ ] Framework install: `npm install --save-dev jest @testing-library/react-native babel-jest --legacy-peer-deps`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full auth flow: onboard → auth → PIN → tabs | AUTH-01–05 | End-to-end flow requires real device, real OTP delivery | 1. Fresh install 2. Complete onboarding 3. Sign up with phone 4. Set PIN 5. Kill app 6. Reopen — PIN screen 7. Enter PIN — tabs load |
| Google one-tap sign-in | AUTH-02 | Native module requires real device with Google Play Services | 1. Tap Google sign-in 2. Select account 3. Verify redirect to PIN setup |
| Biometric unlock | — | Requires device with fingerprint/face hardware | 1. Enable biometric in settings 2. Kill app 3. Reopen — biometric prompt appears 4. Authenticate — tabs load |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
