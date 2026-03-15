# Phase 1: Auth - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can sign in with phone OTP, Google, or email/password and stay logged in across devices. Includes 4-digit PIN for return access, profile sync to Supabase, and multi-provider account linking. Onboarding (class/board/language) happens BEFORE auth — existing onboarding flow is preserved.

</domain>

<decisions>
## Implementation Decisions

### Sign-up Flow Order
- Onboarding first (class → board → language), then auth wall before accessing chat/home
- Existing onboarding flow in `app/onboarding/` is preserved as-is
- After onboarding, student hits auth screen — must sign up/log in to proceed
- Unified screen: system detects if new or returning user (no separate "Sign Up" vs "Log In")
- After first auth, student sets a 4-digit PIN for future app opens
- Biometric (fingerprint/face) available as alternative to PIN entry

### Auth Screen Design
- All-in-one screen: phone number OTP field, Google sign-in button, email/password option — all visible on one page
- Welcoming + educational vibe: GURUji mascot/character with warm greeting, preview of what the app does, auth options below
- Phone OTP is visually primary (largest/top), Google secondary, email tertiary
- Mascot: Claude's discretion on placeholder approach (logo/wordmark is fine for v1 if no mascot designed)

### PIN System
- 4-digit numeric PIN set after first successful authentication
- PIN entry required every time app is opened (protects shared family devices)
- Biometric unlock (fingerprint/face) as optional alternative to PIN
- PIN reset: sends OTP to registered phone number to set new PIN
- After 3 wrong PIN attempts: require full re-authentication (phone OTP / Google / email)

### Session & Token Handling
- Sessions never expire — student stays logged in until manual logout
- PIN is the only daily gate (not re-authentication)
- Auth tokens stored in `expo-secure-store` (not AsyncStorage) for security on rooted Android devices
- Silent token refresh in background — no user interaction needed

### Password Reset (Email Users)
- OTP sent to email address (6-digit code)
- Enter code in-app to set new password
- Standard Supabase Auth email OTP flow

### Account Deletion
- Available in Settings
- 7-day cooldown/grace period after deletion request
- Student can undo deletion within 7 days
- After 7 days: permanent wipe of all user data (profile, progress, session history)

### Multi-Provider Linking
- Settings page has "Connected accounts" section
- Student can link additional auth methods (add Google to phone account, etc.)
- If phone/email already exists on another account: block with "Account exists — log in with [original method]"
- No automatic account merging — explicit linking only

### Claude's Discretion
- Exact mascot/placeholder design for auth screen
- PIN entry screen visual design and animation
- Loading states and transition animations between auth steps
- Error message copy and presentation
- OTP input field design (individual boxes vs single field)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/supabase.ts`: Lazy Supabase client singleton — extend to initialize Supabase Auth
- `store/useAppStore.ts`: Profile state (class, board, language) — extend with auth state (userId, isAuthenticated, authProvider)
- `app/onboarding/`: 3-step onboarding flow — auth screen added as step 4 after language selection
- `app/_layout.tsx`: Root layout with onboarding guard — extend guard to check auth status after onboarding
- `lib/constants.ts`: Class/board/language lists — can add auth-related constants

### Established Patterns
- Zustand + AsyncStorage persist: Auth state should follow same pattern (but tokens go to expo-secure-store, not AsyncStorage)
- Expo Router file-based routing: Auth screens fit naturally as `app/auth/` route group or within onboarding stack
- NativeWind className styling: Auth screens use same Tailwind classes as existing screens
- `@/` path alias for imports: Consistent across all new auth files

### Integration Points
- `app/_layout.tsx`: Navigation guard needs auth check added (after onboarding check)
- `app/api/chat+api.ts`: Will eventually need auth header validation, but Phase 1 just establishes auth — API protection is implicit via Supabase RLS in later phases
- `store/useAppStore.ts`: Profile sync to Supabase happens here after auth is established
- `lib/supabase.ts`: Auth client methods (signInWithOtp, signInWithOAuth, signInWithPassword) added here

</code_context>

<specifics>
## Specific Ideas

- PIN system is important because Indian students often share devices within the family — siblings, parents using the same phone
- Auth screen should feel inviting, not like a gate — students are Class 6-12 kids, not enterprise users
- Phone OTP is the most important auth method — many tier-2/tier-3 students don't have email or Google accounts
- DLT registration (TRAI) must be initiated as an administrative prerequisite BEFORE development — 3-7 business day lead time for SMS provider approval

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-auth*
*Context gathered: 2026-03-15*
