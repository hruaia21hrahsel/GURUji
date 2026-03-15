# Stack Research

**Domain:** AI-powered personalized Socratic tutoring app (Expo/React Native)
**Researched:** 2026-03-15
**Confidence:** MEDIUM-HIGH (most verified via official docs + npm; memory architecture is HIGH inference from established patterns)

---

## Context: What Already Exists

The following are already in place — do NOT re-add or replace:

| Already Installed | Version | Purpose |
|-------------------|---------|---------|
| Expo SDK | 55 | Cross-platform React Native framework |
| Expo Router | (bundled) | File-based routing, tabs, onboarding |
| NativeWind | v4 | Tailwind CSS styling |
| Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`) | v6 | Claude streaming, `useChat` hook |
| Zustand + AsyncStorage | — | Client-side state + persistence |
| `@supabase/supabase-js` | 2.99.1 | Backend client (lazy, already wired) |

**IMPORTANT — SDK 55 New Architecture constraint:** Expo SDK 55 runs React Native 0.83 and mandates the New Architecture (Fabric/JSI). The Legacy Architecture is gone. Any library added must support the New Architecture or use WebView as its bridge. This is the single biggest compatibility gate.

---

## Recommended Stack

### Authentication

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase Auth (phone OTP) | via `@supabase/supabase-js` 2.99.1 | Phone number + SMS OTP login | Already integrated; `signInWithOtp({ phone })` is one call. Phone is universal in India — most Class 6-12 students do not have email accounts. Supabase handles OTP delivery via Twilio/Vonage. |
| Supabase Auth (Google OAuth) | via `@supabase/supabase-js` 2.99.1 | Google sign-in (secondary) | `signInWithOAuth` + `expo-web-browser` for the OAuth flow. Official Expo/Supabase pattern. NOTE: Google OAuth on iOS via Supabase has known `setSession` hang bugs — test on device, not simulator. |
| `expo-web-browser` | bundled with Expo 55 | Opens OAuth redirect in system browser | Required for Google OAuth deep-link redirect back to app. |
| `expo-linking` | bundled with Expo 55 | Handles deep link return from OAuth | Pairs with expo-web-browser for auth redirect. |

**Why NOT `@react-native-google-signin/google-signin`:** Requires separate SHA-1 certificate config, additional native setup, and is redundant when Supabase's OAuth flow covers the same ground with zero native module risk.

**SMS Provider recommendation:** Twilio. Most mature, documented, well-supported by Supabase. TextLocal (India-specific) is a community-supported option with better delivery rates in India — worth evaluating in later phases.

---

### Student Memory & AI Personalization

This is the core differentiator. The architecture has two layers:

**Layer 1 — Structured memory (Supabase Postgres)**
Store student profile data as normalized rows: learning pace, weak topics, preferred teaching style, interests, last session context. This is queried on session start and injected into the Claude system prompt.

**Layer 2 — Session summarization (Supabase Edge Function)**
After each chat session ends, call an Edge Function that sends the conversation to Claude with a summarization prompt. The resulting structured summary (topics covered, struggles, breakthroughs, suggested next topic) gets persisted to Supabase. This is the "memory" injected next session.

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase Postgres (structured memory) | via `@supabase/supabase-js` 2.99.1 | Store `student_profiles`, `topic_mastery`, `session_summaries` tables | Already integrated. JSONB columns for flexible per-subject state. No additional package needed. |
| Supabase Edge Functions | Supabase platform | Session summarization, memory update after chat | Server-side Claude call that compresses session → structured memory. Keeps ANTHROPIC_API_KEY off-client. Runs on Deno. |
| `@mem0/vercel-ai-provider` | 2.0.5 | Optional: drop-in memory middleware for Vercel AI SDK | Integrates with `useChat` to auto-inject/update memory. Uses mem0.ai cloud. **Only viable if API cost is acceptable** — evaluate in a later phase. Do NOT use mem0 directly from React Native client (requires server-side API key). |

**Recommended approach for MVP:** Skip mem0 entirely. Implement manual summarization via Edge Functions. It is simpler, keeps everything in Supabase (one backend), avoids another paid API, and gives full control over what gets memorized. mem0 can be layered in later if the manual approach proves too slow.

---

### Progress Tracking & Mastery

No new packages required. This is a Supabase data modeling problem.

| Technology | Purpose | Why |
|------------|---------|-----|
| Supabase Postgres | `topic_mastery` table: `student_id`, `topic_id`, `status` (enum: not_started/learning/understood/mastered), `updated_at` | Normalized relational data. Indexed by student + topic. Fast to query per-subject progress. |
| Supabase Realtime (built-in) | Push mastery updates to the home screen without polling | Already available via `@supabase/supabase-js` `channel()` API — no extra package. |

---

### Math Rendering

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `react-native-webview` | 13.16.1 | WebView host for KaTeX rendering | New Architecture-compatible (Fabric support confirmed). The only reliable cross-platform bridge for KaTeX in Expo SDK 55 since native math view libraries require native modules incompatible with managed Expo workflow. |
| `react-native-katex` | 1.3.0 | Renders LaTeX strings via KaTeX inside WebView | Thin wrapper over `react-native-webview` + KaTeX.js. Works in Expo managed workflow because it only needs WebView, not native modules. Last published a year ago but the underlying KaTeX/WebView mechanism is stable — no active maintenance needed. |

**Alternative considered — `react-native-math-view`:** Uses react-native-svg as a fallback in Expo. Author's own README warns "performance suffers a bit" in Expo. Not recommended — the SVG-based path is slow for inline math in chat bubbles.

**Fallback if `react-native-katex` breaks on SDK 55:** Render math as HTML string inside `react-native-webview` directly with a minimal KaTeX HTML template. This is what `react-native-katex` does internally anyway.

---

### Markdown Rendering

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `react-native-markdown-display` | 7.0.2 | Render Claude's markdown responses (bold, lists, code blocks, headers) in chat | Native component renderer — no WebView. Active fork, latest version supports React 18 + RN 0.68+, confirmed compatible with New Architecture. Most widely used markdown renderer in the Expo ecosystem. |

**Why NOT `react-native-marked`:** Uses FlatList for virtualization — unnecessary overhead for chat bubbles. Adds complexity with no benefit at this scale.

---

### Internationalization (Bilingual Hindi/English)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `expo-localization` | 55.0.8 | Detect device locale, get system language | Official Expo package. Returns `Localization.locale` — feeds into i18next language detection. Pinned to SDK 55. |
| `i18next` | 25.8.18 | Core i18n engine — translation key lookup, language switching | Industry standard. Framework-agnostic core. Supports plurals, interpolation, fallback languages. |
| `react-i18next` | 16.5.8 | React hooks (`useTranslation`) for i18next | Standard React binding for i18next. `t('key')` in components. |

**Language architecture decision:** UI strings (buttons, labels, navigation) are translated via i18next translation files (`en.json`, `hi.json`). Teaching content (GURUji's actual responses) is NOT translated via i18next — Claude produces Hindi or English output based on the `language` field already in the system prompt. This is the right split: static UI → i18next, dynamic AI content → system prompt instruction.

**Why NOT Intlayer:** Newer, more complex setup, no clear advantage for a two-language app with mostly dynamic AI content.

---

### Gamification

There is no single gamification library worth adding. Build this with existing primitives:

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `react-native-reanimated` | 4.2.2 | Streak animations, XP increment counters, progress bar fills | Already part of Expo SDK 55 (bundled). New Architecture native. Use `withSpring`, `withSequence` for satisfying micro-animations. |
| `lottie-react-native` | 7.3.6 | Celebration animations for badges/achievements (confetti, fireworks) | Official Expo SDK support (`expo install lottie-react-native`). Plays After Effects JSON animations. Use free animations from LottieFiles for streaks and badge unlocks. New Architecture compatible. |

**Gamification data model:** Store `xp`, `streak_days`, `last_study_date`, `badges_earned[]` on the `student_profiles` table in Supabase. No external gamification service needed at this scale.

**Why NOT Questera AI SDK:** Paid third-party dependency for functionality trivially implementable with Supabase + Reanimated. Avoid external lock-in for core engagement mechanics.

---

### Freemium / Paywall

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `react-native-purchases` | 9.12.0 | iOS App Store + Google Play billing | RevenueCat's SDK. Unified API across both stores. Handles entitlements, receipt validation server-side. Official Expo support — use `expo install react-native-purchases`. No native config needed in managed workflow with their Expo plugin. |
| `react-native-purchases-ui` | 9.12.0 | Pre-built paywall UI | RevenueCat's paywall builder — configure the paywall visually, ship without rebuilding. Pair with `react-native-purchases`. |

**Why RevenueCat over raw StoreKit/Billing API:** Writing cross-platform IAP from scratch is a known source of edge-case bugs (jailbreak bypass, sandbox vs. production receipt confusion, refund handling). RevenueCat solves all of this and has an official Expo blog post validating the integration. Free tier covers GURUji's initial scale.

---

### Backend Schema (Supabase — Data Modeling Guide)

This is not a new package but a critical architecture decision that affects every phase:

```sql
-- Core tables needed
student_profiles       -- id, user_id, class, board, language, xp, streak_days, last_study_date
topic_mastery          -- student_id, topic_id, status, last_reviewed_at, attempt_count
session_summaries      -- student_id, session_id, topics_covered[], struggles[], suggested_next, created_at
chat_sessions          -- id, student_id, topic_id, created_at
chat_messages          -- session_id, role, content, created_at
```

Use JSONB for `interests` (freeform student interests like "cricket", "gaming") and `teaching_style_prefs` on `student_profiles`. Use normalized tables for mastery — do not store topic mastery in JSONB, it needs to be queryable and aggregatable for the dashboard.

---

## Installation

```bash
# Auth (phone OTP + Google OAuth deep links)
npx expo install expo-web-browser expo-linking

# Math rendering
npx expo install react-native-webview
npm install react-native-katex --legacy-peer-deps

# Markdown
npm install react-native-markdown-display --legacy-peer-deps

# Internationalization
npx expo install expo-localization
npm install i18next react-i18next --legacy-peer-deps

# Gamification animations
npx expo install lottie-react-native
# react-native-reanimated is already bundled with Expo SDK 55

# Freemium paywall
npx expo install react-native-purchases react-native-purchases-ui
```

**Note on `--legacy-peer-deps`:** This project already uses `.npmrc` with `legacy-peer-deps=true` due to React 19.2.0 peer dependency conflicts. The flag is not needed explicitly if `.npmrc` is already configured.

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Supabase Auth phone OTP | Firebase Auth phone OTP | Firebase adds a second backend dependency; Supabase already integrated. Firebase on React Native also requires native modules and SHA-1 setup. |
| Manual session summarization via Edge Functions | mem0.ai cloud API | Additional paid API, another vendor dependency, overkill for structured student memory. Cannot be called from client (requires server-side API key). |
| `react-native-katex` (WebView) | `react-native-math-view` (SVG) | SVG path explicitly warned as slow by the library author. WebView approach is slower to mount but renders correctly and is maintenance-free. |
| `react-native-markdown-display` | `react-native-marked` | `react-native-marked` uses FlatList — unnecessary in chat bubble context. `react-native-markdown-display` is simpler and renders inline. |
| RevenueCat (`react-native-purchases`) | Raw Apple/Google IAP | Cross-platform receipt validation and entitlement management from scratch is error-prone. RevenueCat has official Expo integration. |
| i18next + react-i18next | Intlayer, LinguiJS | i18next is the dominant React Native i18n solution with the most Expo guides. Two-language app does not need Intlayer's complexity. |
| Supabase Realtime (built-in) | WebSockets, Pusher | Already available with zero extra cost inside `@supabase/supabase-js`. No additional package or vendor. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-native-math-view` in Expo SDK 55 | Requires native modules; expo managed workflow fallback (SVG) is explicitly slow per author | `react-native-katex` via WebView |
| `firebase/auth` | Second backend vendor, native module setup, SHA-1 cert required — redundant when Supabase Auth covers the same ground | Supabase Auth |
| `@react-native-google-signin/google-signin` | Requires native module setup (SHA-1, Android config), breaks managed workflow unless ejected | Supabase `signInWithOAuth` + `expo-web-browser` |
| `langchain` / LangGraph | Massive dependency, server-only, overkill for a single-model tutoring app | Vercel AI SDK `streamText` already in place |
| Pinecone / Weaviate / Qdrant | External vector DB vendor when Supabase pgvector handles student-scale memory easily | Supabase pgvector (enable the extension) |
| Any native-module-only math library | SDK 55 New Architecture mandate breaks libraries not updated for Fabric/JSI | WebView-based rendering (`react-native-katex`) |

---

## Stack Patterns by Variant

**If student is in a low-connectivity region:**
- Do NOT cache AI responses for offline replay — they will be stale and pedagogically wrong
- DO cache the curriculum tree (Class → Subject → Chapter → Topic) locally in Zustand
- Because: curriculum structure is static JSON; AI teaching requires live API

**If Google OAuth hangs at `setSession` on iOS:**
- Use `expo-auth-session` instead of `signInWithOAuth` for the iOS OAuth flow
- Because: the `expo-web-browser` + Supabase redirect pattern has a known session-setting race condition on iOS; `expo-auth-session` handles the token exchange more reliably

**If math rendering performance is poor in chat:**
- Lazy-mount `react-native-katex` WebViews (only render when message is in viewport)
- Use a flat `FlatList` with `getItemLayout` for the chat to prevent unnecessary re-mounts
- Because: WebView mount cost is the bottleneck, not KaTeX itself

**If session summarization via Edge Functions is too slow:**
- Move summarization to a background queue (Supabase `pgmq` + `pg_cron`)
- Because: summarization can be async — it only needs to complete before the next session starts, not before the current session ends

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `react-native-webview` 13.16.1 | Expo SDK 55, RN 0.83, New Architecture | Fabric support confirmed. Use `npx expo install` to get the pinned Expo-compatible version. |
| `lottie-react-native` 7.3.6 | Expo SDK 55 | Use `expo install lottie-react-native` — Expo SDK 55 docs reference this package. |
| `react-native-reanimated` 4.2.2 | Expo SDK 55, New Architecture | Bundled — do not manually install, let Expo manage the version. |
| `react-native-purchases` 9.12.0 | Expo SDK 55 | Requires development build (not Expo Go) — IAP cannot be tested in Expo Go sandbox. |
| `expo-localization` 55.0.8 | Expo SDK 55 | Version-pinned to SDK — always install via `npx expo install`. |
| `i18next` 25.x + `react-i18next` 16.x | React 19.2.0 | Compatible. May need `--legacy-peer-deps` due to React 19 peer dep declarations. |
| `@supabase/supabase-js` 2.99.1 | Expo SDK 55, RN 0.83 | Requires `react-native-url-polyfill` (already in project). Works with New Architecture. |

---

## Sources

- [Expo SDK 55 Changelog](https://expo.dev/changelog/sdk-55) — Confirmed New Architecture mandatory, React Native 0.83, breaking changes (HIGH confidence)
- [Supabase Phone Login Docs](https://supabase.com/docs/guides/auth/phone-login) — Phone OTP setup, Twilio/Vonage/MessageBird providers (HIGH confidence)
- [Supabase Auth React Native Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react-native) — Official Expo integration pattern (HIGH confidence)
- [Expo: Using Supabase](https://docs.expo.dev/guides/using-supabase/) — Supabase + Expo official guide (HIGH confidence)
- [RevenueCat Expo Integration](https://expo.dev/blog/expo-revenuecat-in-app-purchase-tutorial) — Official Expo + RevenueCat tutorial (HIGH confidence)
- [react-native-webview GitHub](https://github.com/react-native-webview/react-native-webview) — New Architecture support confirmed (HIGH confidence)
- [react-native-katex GitHub](https://github.com/3axap4eHko/react-native-katex) — WebView-based KaTeX, npm version 1.3.0 (MEDIUM confidence — last published ~1 year ago, but mechanism is stable)
- [mem0 Vercel AI Provider npm](https://www.npmjs.com/package/@mem0/vercel-ai-provider) — Version 2.0.5 (MEDIUM confidence — requires server-side API key, not suitable for direct client use)
- [Supabase pgvector docs](https://supabase.com/docs/guides/database/extensions/pgvector) — Vector embedding support for future semantic memory (MEDIUM confidence — overkill for MVP)
- [Expo Localization docs](https://docs.expo.dev/guides/localization/) — i18next + expo-localization pattern (HIGH confidence)
- npm registry: version numbers for `react-native-markdown-display`, `i18next`, `react-i18next`, `lottie-react-native`, `react-native-reanimated`, `@supabase/supabase-js`, `react-native-webview`, `react-native-purchases` verified via `npm info` (HIGH confidence)

---

*Stack research for: GURUji — AI Socratic tutor, Expo SDK 55, new milestone features*
*Researched: 2026-03-15*
