---
phase: 01-auth
plan: 02
subsystem: auth
tags: [supabase, google-signin, phone-otp, email-auth, expo-router, nativewind, react-native, zustand]

requires:
  - phase: 01-auth-01
    provides: "LargeSecureStore, lazy Supabase client, useAppStore with setAuth/clearAuth, usePinStore, onAuthStateChange listener in root layout"

provides:
  - "signInWithPhone + verifyPhoneOtp: E.164 validation, Supabase OTP flow"
  - "signInWithGoogle: GoogleSignin + signInWithIdToken, graceful Expo Go error handling"
  - "signUpWithEmail + signInWithEmail: input validation, correct Supabase calls"
  - "requestPasswordReset + verifyEmailOtp: email OTP helpers"
  - "app/auth/index.tsx: unified auth screen with phone/Google/email priority hierarchy"
  - "app/auth/otp-verify.tsx: 6-digit OTP entry with paste support, auto-advance, resend timer"
  - "app/auth/email-form.tsx: sign-up/login mode toggle, confirm password, forgot password"
  - "Navigation guard updated: unauthenticated users routed to auth stack"

affects: [01-auth-03, 01-auth-PIN, chat, settings]

tech-stack:
  added:
    - "@react-native-google-signin/google-signin (v15+) — native Google Sign-In"
  patterns:
    - "All auth functions return { data, error } matching Supabase pattern"
    - "Google SignIn is mocked globally in jest.setup.js (native TurboModule requires Node-env mock)"
    - "KeyboardAvoidingView + ScrollView with keyboardShouldPersistTaps=handled for all auth screens"
    - "onAuthStateChange in root layout handles all post-auth redirects — auth functions do NOT navigate"

key-files:
  created:
    - app/auth/_layout.tsx
    - app/auth/index.tsx
    - app/auth/otp-verify.tsx
    - app/auth/email-form.tsx
    - tests/auth/email.test.ts
    - tests/auth/phone-otp.test.ts
    - tests/auth/google.test.ts
  modified:
    - lib/auth.ts
    - app/_layout.tsx
    - app.json
    - jest.setup.js

key-decisions:
  - "GoogleSignin uses static import in lib/auth.ts (not dynamic) — mocked globally in jest.setup.js to prevent TurboModule crash in Node test env"
  - "Phone input strips +91 prefix automatically so user types just 10 digits — simplifies UX for Indian primary market"
  - "OTP verify screen accepts paste of full 6 digits in any box — auto-submits when complete"
  - "Google Sign-In idToken extracted as userInfo.data.idToken (v12+ shape) with fallback to userInfo.idToken"
  - "Auth functions return errors, they do not navigate — root layout onAuthStateChange handles all redirects"

patterns-established:
  - "Test pattern: jest.mock('@react-native-google-signin/google-signin') in jest.setup.js for all test suites"
  - "Auth screen pattern: per-method loading state (phoneLoading, googleLoading), disable all buttons while any loading"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03]

duration: 30min
completed: 2026-03-15
---

# Phase 01 Plan 02: Auth Screens and Sign-In Methods Summary

**Unified auth screen with phone OTP (primary), Google one-tap (secondary), and email/password (tertiary) using Supabase auth + @react-native-google-signin/google-signin, with 22 unit tests covering all three flows**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-15T21:45:00Z
- **Completed:** 2026-03-15T22:15:00Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- All five auth helper functions implemented with input validation and Supabase integration
- Unified auth screen with correct visual priority hierarchy (phone > Google > email)
- OTP verification screen with individual digit boxes, paste support, auto-submit, and 30s resend timer
- Email form with sign-up/login toggle, confirm password validation, and forgot password flow
- Navigation guard updated — unauthenticated users now see the real auth stack, not a placeholder
- 22 unit tests passing (phone-otp: 8, email: 7, google: 5, plus 2 pre-existing auto-refresh + session tests = 40 total)

## Task Commits

Each task was committed atomically:

1. **Task 1: Auth helper functions and all sign-in methods** - `d2a1290` (feat)
2. **Task 2: Unified auth screen, OTP verification, and email form UI** - `dfc0ce3` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `lib/auth.ts` - Extended with signInWithPhone, verifyPhoneOtp, signInWithGoogle, signUpWithEmail, signInWithEmail, requestPasswordReset, verifyEmailOtp
- `app/auth/_layout.tsx` - Auth stack layout, headerShown: false for all screens
- `app/auth/index.tsx` - Unified auth screen: phone OTP primary, Google secondary, email link tertiary
- `app/auth/otp-verify.tsx` - 6-digit OTP entry with individual boxes, paste, auto-submit, resend timer
- `app/auth/email-form.tsx` - Sign-up/login form with mode toggle, confirm password, forgot password
- `app/_layout.tsx` - Navigation guard updated to route auth stack for unauthenticated users
- `app.json` - Added expo-local-authentication and @react-native-google-signin/google-signin config plugins
- `jest.setup.js` - Added global GoogleSignin mock for Node test environment
- `tests/auth/email.test.ts` - 7 tests for signUpWithEmail and signInWithEmail
- `tests/auth/phone-otp.test.ts` - 8 tests for signInWithPhone (E.164 validation) and verifyPhoneOtp
- `tests/auth/google.test.ts` - 5 tests for signInWithGoogle (happy path, Expo Go error, missing env var)

## Decisions Made
- Used static import for GoogleSignin in lib/auth.ts (not dynamic import) to avoid `--experimental-vm-modules` requirement in Jest; added global mock in jest.setup.js instead
- Phone OTP input hardcodes +91 prefix with 10-digit input field — simplifies UX for primary India market
- Google idToken extracted with dual-path fallback: `userInfo.data.idToken` (v12+ shape) or `userInfo.idToken` (older shape) for compatibility
- Auth functions never navigate — all redirects handled by onAuthStateChange listener in root layout

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Replaced dynamic import with static import for GoogleSignin**
- **Found during:** Task 1 (Auth helper functions)
- **Issue:** Dynamic `import('@react-native-google-signin/google-signin')` inside async function fails in Jest Node environment with "A dynamic import callback was invoked without --experimental-vm-modules"
- **Fix:** Changed to static top-level import in lib/auth.ts; added global `jest.mock('@react-native-google-signin/google-signin')` in jest.setup.js to prevent TurboModule crash
- **Files modified:** lib/auth.ts, jest.setup.js
- **Verification:** All 22 auth tests pass; expo export succeeds
- **Committed in:** d2a1290 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug fix for test compatibility)
**Impact on plan:** Required fix — dynamic import approach was incompatible with Jest Node env. Static import is cleaner and more predictable.

## Issues Encountered
- GoogleSignin native module attempts to call TurboModule.getEnforcing at require-time — unavoidable in Node.js test environment. Resolved with global jest.mock in setup file, which also allows test-level overrides with mockRejectedValueOnce.

## User Setup Required

Google Sign-In requires manual configuration before it can be used in a real build:

1. Create Google Cloud project at console.cloud.google.com
2. Enable Google Identity API
3. Create OAuth consent screen (External, app name: GURUji)
4. Create Web OAuth client ID (for Supabase) and Android OAuth client ID (with SHA-1)
5. Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env.local`
6. Replace `YOUR_IOS_CLIENT_ID` placeholder in `app.json` plugins with the real iOS client ID
7. Configure Supabase: Authentication > Providers > Google > add Web Client ID and Secret

## Next Phase Readiness
- All auth screens and helpers are ready — ready for Plan 03 (PIN setup and biometric lock)
- Phone OTP will silently fail until DLT registration is complete (see Blockers in STATE.md)
- Google Sign-In requires EAS development build (not Expo Go) to test on physical device

## Self-Check: PASSED

All created files verified on disk. Task commits d2a1290 and dfc0ce3 confirmed in git log. 22 unit tests passing. Expo web export successful.

---
*Phase: 01-auth*
*Completed: 2026-03-15*
