# Phase 1: Auth - Research

**Researched:** 2026-03-15
**Domain:** Supabase Auth + Expo React Native (phone OTP, Google OAuth, email/password, PIN/biometric, session persistence)
**Confidence:** HIGH (core auth stack), MEDIUM (SMS India compliance), HIGH (PIN/biometric patterns)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Sign-up Flow Order**
- Onboarding first (class → board → language), then auth wall before accessing chat/home
- Existing onboarding flow in `app/onboarding/` is preserved as-is
- After onboarding, student hits auth screen — must sign up/log in to proceed
- Unified screen: system detects if new or returning user (no separate "Sign Up" vs "Log In")
- After first auth, student sets a 4-digit PIN for future app opens
- Biometric (fingerprint/face) available as alternative to PIN entry

**Auth Screen Design**
- All-in-one screen: phone number OTP field, Google sign-in button, email/password option — all visible on one page
- Welcoming + educational vibe: GURUji mascot/character with warm greeting, preview of what the app does, auth options below
- Phone OTP is visually primary (largest/top), Google secondary, email tertiary
- Mascot: Claude's discretion on placeholder approach (logo/wordmark is fine for v1 if no mascot designed)

**PIN System**
- 4-digit numeric PIN set after first successful authentication
- PIN entry required every time app is opened (protects shared family devices)
- Biometric unlock (fingerprint/face) as optional alternative to PIN
- PIN reset: sends OTP to registered phone number to set new PIN
- After 3 wrong PIN attempts: require full re-authentication (phone OTP / Google / email)

**Session & Token Handling**
- Sessions never expire — student stays logged in until manual logout
- PIN is the only daily gate (not re-authentication)
- Auth tokens stored in `expo-secure-store` (not AsyncStorage) for security on rooted Android devices
- Silent token refresh in background — no user interaction needed

**Password Reset (Email Users)**
- OTP sent to email address (6-digit code)
- Enter code in-app to set new password
- Standard Supabase Auth email OTP flow

**Account Deletion**
- Available in Settings
- 7-day cooldown/grace period after deletion request
- Student can undo deletion within 7 days
- After 7 days: permanent wipe of all user data (profile, progress, session history)

**Multi-Provider Linking**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can sign up and log in with phone number + OTP | Supabase phone auth + SMS hook for India DLT-compliant provider (MSG91); `supabase.auth.signInWithOtp({ phone })` + `verifyOtp({ phone, token, type: 'sms' })` |
| AUTH-02 | User can sign in with Google (one-tap) | `@react-native-google-signin/google-signin` + `supabase.auth.signInWithIdToken({ provider: 'google', token })` — requires dev build (not Expo Go) |
| AUTH-03 | User can sign up and log in with email and password | `supabase.auth.signInWithPassword({ email, password })` + `signUp({ email, password })`; password reset via `signInWithOtp({ email })` |
| AUTH-04 | User session persists across app restarts and devices via Supabase Auth | LargeSecureStore adapter (AES-256 key in SecureStore, encrypted session in AsyncStorage) + `persistSession: true` + `autoRefreshToken: true` + AppState listener |
| AUTH-05 | User profile (class, board, language) synced to server after auth | After auth, upsert to `profiles` Supabase table; extend `useAppStore` with `userId` + `isAuthenticated`; sync triggered on `SIGNED_IN` auth event |
</phase_requirements>

---

## Summary

Phase 1 builds the complete authentication foundation for GURUji on top of Supabase Auth, covering three sign-in methods (phone OTP, Google OAuth, email/password), a PIN-based app lock system with biometric fallback, and profile sync to Supabase. The app already has `expo-secure-store` in `app.json` plugins, the `guruji://` deep link scheme configured, and an existing `lib/supabase.ts` lazy singleton ready to extend.

The most important architectural insight is the **LargeSecureStore pattern**: Supabase session tokens exceed expo-secure-store's 2048-byte limit, so tokens must use a hybrid approach — AES-256 encryption key stored in SecureStore, encrypted session data in AsyncStorage. This is Supabase's own recommended pattern. The PIN itself (4 digits) is a small enough value to go directly into SecureStore.

The biggest external dependency and risk is **India DLT registration for SMS OTP** (TRAI mandate). As of March 2025, Vonage has dropped domestic India SMS entirely. The standard path is Supabase's SMS hook + MSG91 (India DLT-compliant), but the MSG91 account and DLT-registered templates must exist before this code runs. If DLT registration is not complete, implement Google-only auth first and wire phone OTP as a later addition.

**Primary recommendation:** Build in this order: (1) email/password auth + session persistence, (2) Google OAuth, (3) PIN/biometric layer, (4) phone OTP (blocked on DLT). All four use the same Supabase session and the same `Stack.Protected` nav guard.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | ^2.x | Supabase Auth client — OTP, OAuth, email/password, identity linking | Official Supabase SDK; already referenced in project memory |
| `expo-secure-store` | ~14.0.1 | Secure key storage (AES key for session encryption, PIN storage) | Already in package.json; hardware-backed keystore on Android, Keychain on iOS |
| `@react-native-async-storage/async-storage` | 2.1.2 | Stores AES-encrypted session data (oversized for SecureStore) | Already in package.json; needed for LargeSecureStore hybrid pattern |
| `@react-native-google-signin/google-signin` | ^14.x | Google Sign-In native SDK, provides idToken for Supabase | Supabase-recommended approach for native Google auth; cannot use web OAuth redirect in native apps |
| `expo-local-authentication` | ~15.x | Biometric unlock (fingerprint/face ID) as PIN alternative | Official Expo SDK; wraps Android BiometricPrompt + iOS FaceID/TouchID |
| `aes-js` | ^3.1.2 | AES-256-CTR encryption for LargeSecureStore session adapter | Lightweight, no native dependencies; used in Supabase's own docs example |
| `react-native-get-random-values` | ^1.x | Polyfill for crypto.getRandomValues() needed by aes-js key generation | Required peer dep for aes-js in React Native |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `expo-web-browser` | ~14.x | Opens OAuth redirect in in-app browser (if web OAuth needed) | Only if Google sign-in via web flow needed as fallback |
| `expo-linking` | ~7.0.5 | Deep link handling for OAuth callbacks (already installed) | Already in package.json; used for `guruji://` scheme handling |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@react-native-google-signin/google-signin` | `supabase.auth.signInWithOAuth({ provider: 'google' })` + web browser | Web OAuth redirect works in Expo Go but is worse UX (leaves app); native is required for one-tap feel |
| MSG91 SMS hook | Twilio Verify | Twilio works out-of-box with Supabase but ~$0.10/verification; MSG91 DLT-compliant and much cheaper for India scale |
| LargeSecureStore (AES hybrid) | AsyncStorage only | AsyncStorage is cleartext on rooted devices — unacceptable for India's rooted Android market |
| Custom PIN UI (hand-rolled) | `@haskkor/react-native-pincode` | Library handles wrong-attempts logic, animations, and masked input; saves significant work |

**Installation:**
```bash
npx expo install @supabase/supabase-js expo-local-authentication expo-web-browser
npx expo install @react-native-google-signin/google-signin
npm install aes-js react-native-get-random-values --legacy-peer-deps
```

Note: `@react-native-google-signin/google-signin` requires a **development build** (not Expo Go). FaceID also requires a development build. Plan for EAS build or local dev build from Wave 1.

---

## Architecture Patterns

### Recommended Project Structure
```
app/
├── auth/
│   ├── _layout.tsx          # Auth stack layout
│   ├── index.tsx            # Unified auth screen (phone OTP + Google + email)
│   ├── otp-verify.tsx       # OTP entry screen (phone OTP verification)
│   └── pin-setup.tsx        # PIN creation screen (after first auth)
├── pin/
│   └── index.tsx            # PIN entry screen (every app open)
├── (tabs)/                  # Protected tab navigator (existing)
├── onboarding/              # Onboarding stack (existing, preserved)
└── _layout.tsx              # Root layout — extend with auth guard

lib/
├── supabase.ts              # Extend existing lazy singleton with LargeSecureStore
├── auth.ts                  # Auth helper functions (signIn methods, linkIdentity)
└── large-secure-store.ts    # LargeSecureStore class (AES-256 hybrid adapter)

store/
├── useAppStore.ts           # Extend with userId, isAuthenticated, authProvider
└── usePinStore.ts           # PIN state: isLocked, pinHash, failedAttempts, biometricEnabled
```

### Pattern 1: LargeSecureStore Session Adapter
**What:** Custom storage adapter that stores AES-256 key in SecureStore and AES-encrypted session data in AsyncStorage, bypassing SecureStore's 2048-byte limit.
**When to use:** Always — Supabase sessions exceed SecureStore's limit by default.
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native?auth-store=secure-store
import * as SecureStore from 'expo-secure-store';
import * as aesjs from 'aes-js';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LargeSecureStore {
  private async _encrypt(key: string, value: string): Promise<string> {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));
    const cipher = new aesjs.ModeOfOperation.ctr(
      encryptionKey,
      new aesjs.Counter(1)
    );
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey));
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async _decrypt(key: string, value: string): Promise<string> {
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) return value;
    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1)
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return encrypted;
    return this._decrypt(key, encrypted);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await this._encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new LargeSecureStore(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Pattern 2: Stack.Protected Auth Guard
**What:** Expo Router's declarative route protection using `Stack.Protected` with a boolean guard derived from Supabase auth state.
**When to use:** In root `app/_layout.tsx` to protect tabs from unauthenticated users and the PIN screen from authenticated-but-not-unlocked users.
**Example:**
```typescript
// Source: https://docs.expo.dev/router/advanced/protected/
import { Stack } from 'expo-router';

export function RootLayout() {
  const { isAuthenticated, isOnboarded } = useAppStore();
  const { isLocked } = usePinStore();

  return (
    <Stack>
      {/* Onboarding — only for users who haven't completed it */}
      <Stack.Protected guard={!isOnboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      {/* Auth — only for onboarded but unauthenticated users */}
      <Stack.Protected guard={isOnboarded && !isAuthenticated}>
        <Stack.Screen name="auth" />
      </Stack.Protected>

      {/* PIN — authenticated but locked (every app open) */}
      <Stack.Protected guard={isAuthenticated && isLocked}>
        <Stack.Screen name="pin" />
      </Stack.Protected>

      {/* Main app — authenticated and unlocked */}
      <Stack.Protected guard={isAuthenticated && !isLocked}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}
```

### Pattern 3: Google Sign-In with idToken passthrough
**What:** Use `@react-native-google-signin/google-signin` to get a native Google ID token, then pass it to Supabase `signInWithIdToken` — never leave the app.
**When to use:** Google auth on native builds (required for one-tap feel; web redirect is a fallback only).
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/auth/social-login/auth-google
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_FROM_GOOGLE_CONSOLE',
});

async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: response.data?.idToken ?? '',
  });
  return { data, error };
}
```

### Pattern 4: AppState-Driven Auto-Refresh
**What:** Listen to AppState changes to start/stop Supabase token auto-refresh — prevents background refresh draining battery and handles foreground resume.
**When to use:** Always in the root layout, as Supabase does not detect app state on non-web platforms.
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/auth/quickstarts/react-native
import { AppState } from 'react-native';

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
```

### Pattern 5: Identity Linking in Settings
**What:** Allow logged-in users to link additional providers (phone → add Google, Google → add phone) using `supabase.auth.linkIdentity()`.
**When to use:** "Connected accounts" settings section.
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/auth/auth-identity-linking
// List current identities
const { data: { identities } } = await supabase.auth.getUserIdentities();

// Link Google to current account (must be signed in)
const { data, error } = await supabase.auth.linkIdentity({
  provider: 'google',
  token: googleIdToken,        // from GoogleSignin
  access_token: googleAccessToken,
});

// Unlink an identity (user must have 2+ linked identities)
await supabase.auth.unlinkIdentity(identityToRemove);
```

### Anti-Patterns to Avoid
- **Storing Supabase session directly in SecureStore:** Session JSON exceeds 2048-byte limit — always use LargeSecureStore hybrid pattern.
- **Using `signInWithOAuth` + web browser for Google:** Opens browser, breaks native feel, harder to handle callback. Use `signInWithIdToken` with native Google SDK.
- **Storing PIN as plaintext in AsyncStorage:** PIN is security-critical. Store as hashed value in SecureStore (4-digit hash with a salt, or simply store in SecureStore directly given its small size).
- **Re-checking Supabase session on every render:** Subscribe to `onAuthStateChange` once in root layout; update Zustand store from there. Don't call `getSession()` in child components.
- **Blocking UI during auto-refresh:** `autoRefreshToken: true` handles refresh silently; never show loading state for background token refresh.
- **Calling `startAutoRefresh()` without AppState listener:** On non-web platforms, Supabase cannot detect foreground/background automatically — omitting AppState wiring causes unnecessary background refreshes.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Biometric auth | Custom native module | `expo-local-authentication` | Handles Face ID, Touch ID, Android BiometricPrompt, enrollment checks, hardware checks — all edge cases handled |
| Google OAuth | Manual OAuth PKCE flow | `@react-native-google-signin/google-signin` | Play Services integration, token refresh, account picker UI — weeks of work |
| Session encryption | Custom crypto | `aes-js` + LargeSecureStore pattern | AES-CTR implementation with proper IV/key handling is subtle; use the library |
| PIN UI with attempts counter | Custom NumPad + state machine | Build a focused `usePinStore` Zustand store | The logic is ~100 lines; the Zustand pattern from existing codebase handles this well. No external PIN library needed |
| Auth state propagation | Custom context/event system | `supabase.auth.onAuthStateChange` + Zustand | Supabase emits all events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, PASSWORD_RECOVERY); update Zustand from there |
| Phone OTP SMS delivery | Custom SMS gateway integration | Supabase SMS hook + MSG91 | DLT compliance, template approval, delivery reports — massively complex without a managed provider |

**Key insight:** The Supabase Auth SDK handles the hardest parts of auth (token storage contract, refresh token rotation, concurrent refresh protection, PKCE). The app's job is just to wire the UI to the SDK methods and to handle the storage adapter correctly.

---

## Common Pitfalls

### Pitfall 1: SecureStore 2048-byte Limit Silently Drops Sessions
**What goes wrong:** `setItemAsync` fails silently when value exceeds 2048 bytes. Supabase session tokens are typically 2-4KB. App appears to log the user in but next launch finds no session.
**Why it happens:** expo-secure-store wraps iOS Keychain and Android Keystore, both of which have value size constraints. No exception is thrown — the call resolves but the value is truncated or not stored.
**How to avoid:** Always use the LargeSecureStore pattern — AES key in SecureStore, encrypted session in AsyncStorage.
**Warning signs:** User is prompted to log in again after every app restart despite `persistSession: true`.

### Pitfall 2: Google Sign-In Fails in Expo Go
**What goes wrong:** `@react-native-google-signin/google-signin` requires native modules that are not available in Expo Go. App crashes or shows "module not found" error.
**Why it happens:** The library uses native Android/iOS Google Sign-In SDK which must be compiled into the build.
**How to avoid:** Create a development build (`npx expo run:android` / `npx expo run:ios` or EAS build) before testing Google sign-in.
**Warning signs:** App works on web but crashes on device/simulator when Google button is tapped.

### Pitfall 3: FaceID Not Available in Expo Go
**What goes wrong:** `expo-local-authentication` biometric prompt fails or is skipped on iOS in Expo Go.
**Why it happens:** FaceID requires the `NSFaceIDUsageDescription` Info.plist key and native build configuration not available in Expo Go.
**How to avoid:** Add `NSFaceIDUsageDescription` to `app.json` under `ios.infoPlist`; test biometrics only on development builds.
**Warning signs:** `authenticateAsync()` returns `{ success: false, error: 'not_available' }` on iOS simulator with Expo Go.

### Pitfall 4: DLT-Unregistered SMS Messages Silently Fail in India
**What goes wrong:** OTP SMS is sent from Supabase/Twilio but never delivered to Indian phone numbers. No error is returned to the app. Student waits indefinitely.
**Why it happens:** TRAI DLT regulations (effective 2021, updated May 2025) block all commercial SMS from unregistered entities at the telecom operator level. Vonage dropped domestic India SMS entirely as of March 2025.
**How to avoid:** Use Supabase SMS hook + MSG91 with DLT-registered Business Entity, Sender ID, and pre-approved OTP message template. Do NOT start development assuming Twilio works in India.
**Warning signs:** OTP flow works in development (international number) but fails on all Indian +91 numbers in staging/production.

### Pitfall 5: onAuthStateChange Not Firing After App Restart
**What goes wrong:** Auth state listener is attached too late in the component lifecycle, missing the initial SIGNED_IN event that fires when session is restored from storage.
**Why it happens:** `onAuthStateChange` fires INITIAL_SESSION on mount when a stored session is found. If the subscription is set up after this event fires, the app starts in an unauthenticated state even though a valid session exists.
**How to avoid:** Call `supabase.auth.getSession()` immediately on app mount AND subscribe to `onAuthStateChange`. The initial session check handles the restore; the listener handles subsequent changes.
**Warning signs:** User is logged out after every app restart; adding a 500ms delay "fixes" it (indicating a race condition).

### Pitfall 6: PIN Timing Attack via Attempt Counter in AsyncStorage
**What goes wrong:** Storing `failedAttempts` count in AsyncStorage allows a motivated user to clear it by clearing app storage, bypassing the 3-attempt lockout.
**Why it happens:** AsyncStorage is cleartext and easily cleared on rooted Android (common in India's market).
**How to avoid:** Store `failedAttempts` in SecureStore (small integer, well within 2048-byte limit). After 3 failures, require full re-auth regardless of whether SecureStore is cleared (lockout state should also be tracked server-side if high security needed).
**Warning signs:** Users can bypass PIN lockout by clearing app data from Android settings.

### Pitfall 7: Account Deletion With Active Sessions
**What goes wrong:** When a user initiates account deletion (7-day grace period), other active sessions (different devices) continue to work until the deletion is processed.
**Why it happens:** Supabase doesn't automatically revoke tokens when a soft-delete flag is set on the profile.
**How to avoid:** On deletion request, call `supabase.auth.admin.signOut(userId, { scope: 'global' })` server-side via an Edge Function to revoke all sessions. The 7-day grace period is tracked by a `deletion_requested_at` column in the `profiles` table; a scheduled Edge Function processes final deletion after 7 days.
**Warning signs:** Deleted users can still access the API through other devices.

---

## Code Examples

Verified patterns from official sources:

### Phone OTP — Send
```typescript
// Source: https://supabase.com/docs/guides/auth/phone-login
const { data, error } = await supabase.auth.signInWithOtp({
  phone: '+919876543210',  // E.164 format, must include country code
});
```

### Phone OTP — Verify
```typescript
// Source: https://supabase.com/docs/guides/auth/phone-login
const { data, error } = await supabase.auth.verifyOtp({
  phone: '+919876543210',
  token: '123456',
  type: 'sms',
});
// data.session contains the auth tokens on success
```

### Email Sign Up + Sign In
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-signup
const { data, error } = await supabase.auth.signUp({
  email: 'student@example.com',
  password: 'securepassword',
});

// Existing user:
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'student@example.com',
  password: 'securepassword',
});
```

### Email Password Reset (OTP flow)
```typescript
// Step 1: Request OTP to email
const { error } = await supabase.auth.signInWithOtp({
  email: 'student@example.com',
});

// Step 2: Verify OTP and update password
const { error } = await supabase.auth.verifyOtp({
  email: 'student@example.com',
  token: '123456',
  type: 'email',
});
// User is now signed in; call updateUser to set new password
const { error } = await supabase.auth.updateUser({ password: 'newpassword' });
```

### Auth State Listener
```typescript
// Source: https://supabase.com/docs/guides/auth/quickstarts/react-native
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        useAppStore.getState().setAuth({
          userId: session.user.id,
          isAuthenticated: true,
          authProvider: session.user.app_metadata.provider,
        });
        // Sync profile to Supabase on sign-in (AUTH-05)
        syncProfileToSupabase(session.user.id);
      }
      if (event === 'SIGNED_OUT') {
        useAppStore.getState().clearAuth();
      }
    }
  );
  return () => subscription.unsubscribe();
}, []);
```

### Biometric Auth
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/local-authentication/
import * as LocalAuthentication from 'expo-local-authentication';

async function authenticateWithBiometric(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock GURUji',
    fallbackLabel: 'Use PIN',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,  // allows device PIN as fallback
  });
  return result.success;
}
```

### Profile Sync to Supabase (AUTH-05)
```typescript
// Called after any successful auth event
async function syncProfileToSupabase(userId: string) {
  const { class: studentClass, board, language } = useAppStore.getState();
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      class: studentClass,
      board,
      language,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (error) console.error('Profile sync failed:', error);
}
```

### Soft-Delete Pattern for 7-Day Account Deletion
```typescript
// Source: https://supabase.com/docs/guides/troubleshooting/soft-deletes-with-supabase-js
// Mark deletion (client-side, called from Settings)
async function requestAccountDeletion() {
  const { error } = await supabase
    .from('profiles')
    .update({ deletion_requested_at: new Date().toISOString() })
    .eq('id', (await supabase.auth.getUser()).data.user!.id);
  // Then sign out all sessions via Edge Function
}

// Undo deletion (within 7 days)
async function cancelAccountDeletion() {
  await supabase
    .from('profiles')
    .update({ deletion_requested_at: null })
    .eq('id', userId);
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `signInWithOAuth` + WebBrowser for Google | `signInWithIdToken` + `@react-native-google-signin/google-signin` | 2023+ | Never leaves the app; better UX; works without deep link handling |
| AsyncStorage for Supabase session | LargeSecureStore (AES hybrid) | 2022+ | Security on rooted devices; required for India market |
| Global session expiry disabled via JWT settings | Sessions persist by default; `autoRefreshToken: true` handles silently | Stable | Sessions last until sign-out as long as refresh tokens are valid |
| Separate Sign Up / Log In screens | Unified detection (new vs returning user by email/phone check) | Current best practice | Simpler UX; Supabase `signInWithOtp` handles both cases |
| Vonage for India SMS | Supabase SMS hook + MSG91 (domestic DLT-compliant) | March 2025 | Vonage dropped domestic India routes; domestic providers now required |

**Deprecated/outdated:**
- Vonage for India SMS OTP: Dropped domestic India SMS routes as of March 2025. Do not configure Vonage for Indian phone numbers.
- `expo-auth-session` for Google OAuth: Still works but suboptimal for native. Superseded by `@react-native-google-signin/google-signin` + `signInWithIdToken`.

---

## Open Questions

1. **DLT Registration Status**
   - What we know: TRAI DLT is mandatory for all India OTP SMS; Vonage no longer an option; MSG91 is the recommended path with Supabase SMS hook
   - What's unclear: Whether the developer has a registered Indian business entity — DLT requires it; without it, phone OTP cannot go live
   - Recommendation: Plan phone OTP as a separate deliverable, gated on DLT completion. Ship email + Google first.

2. **Supabase Project URL and Keys**
   - What we know: `lib/supabase.ts` exists as a lazy singleton; env vars `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are the pattern
   - What's unclear: Whether a Supabase project has been created for GURUji yet
   - Recommendation: Wave 0 task should verify Supabase project exists and env vars are set; auth cannot be tested without them

3. **PIN Storage Security Level**
   - What we know: 4 digits PIN, stored in SecureStore (fits in 2048-byte limit); failed attempts tracked
   - What's unclear: Whether to store raw PIN or hashed PIN
   - Recommendation: Store hashed PIN using a deterministic hash (e.g., SHA-256 with a static app salt stored in SecureStore). Never store raw PIN even in SecureStore.

4. **Google OAuth Web Client ID Setup**
   - What we know: Need a Google Cloud Console project with Android + Web OAuth client IDs; iOS URL scheme for reverse client ID
   - What's unclear: Whether the SHA-1 fingerprint for Android has been generated for the GURUji keystore
   - Recommendation: Document this as an administrative prerequisite alongside DLT registration. Planner should include a setup task for Google Cloud Console config.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected in project — Wave 0 must establish |
| Config file | None — see Wave 0 |
| Quick run command | `npx jest --testPathPattern=auth --passWithNoTests` (once set up) |
| Full suite command | `npx jest --passWithNoTests` |

Note: This is a React Native / Expo project. Testing auth flows requires mocking Supabase, expo-secure-store, and expo-local-authentication. Recommend Jest + `@testing-library/react-native` + manual integration tests given native module constraints. End-to-end auth testing (real OTP delivery) is inherently manual.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Phone OTP sends and verifies | unit (mocked Supabase) | `npx jest tests/auth/phone-otp.test.ts -t "sends OTP"` | ❌ Wave 0 |
| AUTH-01 | OTP verification updates session | unit (mocked Supabase) | `npx jest tests/auth/phone-otp.test.ts -t "verifies OTP"` | ❌ Wave 0 |
| AUTH-02 | Google sign-in calls signInWithIdToken | unit (mocked GoogleSignin) | `npx jest tests/auth/google.test.ts` | ❌ Wave 0 |
| AUTH-03 | Email sign-up creates user | unit (mocked Supabase) | `npx jest tests/auth/email.test.ts -t "sign up"` | ❌ Wave 0 |
| AUTH-03 | Email sign-in returns session | unit (mocked Supabase) | `npx jest tests/auth/email.test.ts -t "sign in"` | ❌ Wave 0 |
| AUTH-04 | Session persists after simulated restart | unit (LargeSecureStore) | `npx jest tests/auth/session-persistence.test.ts` | ❌ Wave 0 |
| AUTH-04 | AppState listener starts/stops auto-refresh | unit | `npx jest tests/auth/auto-refresh.test.ts` | ❌ Wave 0 |
| AUTH-05 | Profile sync upserts to profiles table | unit (mocked Supabase) | `npx jest tests/auth/profile-sync.test.ts` | ❌ Wave 0 |
| AUTH-01–05 | Full auth flow: onboard → auth → PIN → tabs | manual smoke | n/a — manual test on device | n/a |
| PIN lock | 3 wrong attempts locks app | unit (usePinStore) | `npx jest tests/auth/pin-store.test.ts` | ❌ Wave 0 |
| Biometric | Falls back to PIN when biometric unavailable | unit (mocked LocalAuth) | `npx jest tests/auth/biometric.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=auth --passWithNoTests`
- **Per wave merge:** `npx jest --passWithNoTests`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `jest.config.js` — Jest configuration with babel-jest for Expo
- [ ] `jest.setup.js` — Mock `expo-secure-store`, `expo-local-authentication`, `@react-native-google-signin/google-signin`
- [ ] `tests/auth/phone-otp.test.ts` — covers AUTH-01
- [ ] `tests/auth/google.test.ts` — covers AUTH-02
- [ ] `tests/auth/email.test.ts` — covers AUTH-03
- [ ] `tests/auth/session-persistence.test.ts` — covers AUTH-04
- [ ] `tests/auth/auto-refresh.test.ts` — covers AUTH-04
- [ ] `tests/auth/profile-sync.test.ts` — covers AUTH-05
- [ ] `tests/auth/pin-store.test.ts` — PIN lockout behavior
- [ ] `tests/auth/biometric.test.ts` — biometric fallback
- [ ] Framework install: `npm install --save-dev jest @testing-library/react-native babel-jest --legacy-peer-deps`

---

## Sources

### Primary (HIGH confidence)
- [supabase.com/docs/guides/auth/quickstarts/react-native](https://supabase.com/docs/guides/auth/quickstarts/react-native) — Supabase React Native auth setup
- [supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native?auth-store=secure-store](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native?auth-store=secure-store) — LargeSecureStore pattern, official Supabase docs
- [supabase.com/docs/guides/auth/social-login/auth-google](https://supabase.com/docs/guides/auth/social-login/auth-google) — Google OAuth with signInWithIdToken
- [supabase.com/docs/guides/auth/phone-login](https://supabase.com/docs/guides/auth/phone-login) — Phone OTP configuration, SMS providers
- [supabase.com/docs/guides/auth/auth-identity-linking](https://supabase.com/docs/guides/auth/auth-identity-linking) — Multi-provider linking, getUserIdentities, linkIdentity
- [supabase.com/docs/guides/auth/sessions](https://supabase.com/docs/guides/auth/sessions) — Session behavior, refresh token lifecycle
- [docs.expo.dev/versions/latest/sdk/local-authentication/](https://docs.expo.dev/versions/latest/sdk/local-authentication/) — expo-local-authentication API reference
- [docs.expo.dev/router/advanced/protected/](https://docs.expo.dev/router/advanced/protected/) — Stack.Protected auth guard pattern
- [react-native-google-signin.github.io/docs/setting-up/expo](https://react-native-google-signin.github.io/docs/setting-up/expo) — Expo setup for @react-native-google-signin/google-signin

### Secondary (MEDIUM confidence)
- [dev.to/acetrondi/using-supabase-sms-hook-to-send-custom-authentication-messages-in-india-4nj7](https://dev.to/acetrondi/using-supabase-sms-hook-to-send-custom-authentication-messages-in-india-4nj7) — Supabase SMS hook + India DLT provider (MSG91) implementation
- [api.support.vonage.com/hc/en-us/articles/204017423-India-SMS-Features-and-Restrictions](https://api.support.vonage.com/hc/en-us/articles/204017423-India-SMS-Features-and-Restrictions) — Vonage India SMS restrictions (dropped domestic routes March 2025)

### Tertiary (LOW confidence)
- WebSearch results on DLT registration timelines and costs — cross-verified with Vonage official docs and TRAI guidance; core facts (DLT mandatory, 3-7 day approval) are consistent across multiple sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All packages verified against official Expo/Supabase documentation; versions cross-checked with package.json
- Architecture: HIGH — Stack.Protected from official Expo Router docs; LargeSecureStore from Supabase's own tutorial
- Pitfalls: HIGH — SecureStore size limit, DLT block, and biometric Expo Go limitation all verified from official sources
- SMS India compliance: MEDIUM — Vonage restriction confirmed from official Vonage docs; DLT timeline estimates from multiple sources but not a single authoritative figure

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable auth APIs, but India DLT regulatory situation may change — recheck before SMS integration)
