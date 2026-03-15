# External Integrations

**Analysis Date:** 2026-03-15

## APIs & External Services

**AI/LLM:**
- Anthropic Claude API - Core tutoring engine for Socratic questioning
  - SDK/Client: `@ai-sdk/anthropic` 3.0.58 with `ai` 6.0.116
  - Auth: `ANTHROPIC_API_KEY` (environment variable, server-side only)
  - Usage: Server-side chat API route (`app/api/chat+api.ts`) proxies client messages to Claude, maintains streaming responses
  - Streaming: Expo native fetch via `expo/fetch` for real-time message delivery

## Data Storage

**Databases:**
- Supabase (PostgreSQL) - Optional, lazy initialization
  - Connection: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (environment variables)
  - Client: Supabase JavaScript client (installed as dependency if env vars present)
  - Status: Lazy singleton pattern in `lib/supabase.ts`
  - Current usage: Not required for base functionality; app works offline
  - Future use: Chat history persistence, user profiles, NCERT curriculum metadata

**File Storage:**
- Local filesystem only - No cloud file storage integrated
- Device local storage via `@react-native-async-storage/async-storage` 2.1.2 for chat sessions and user preferences

**Caching:**
- None - Direct API calls to Claude via Vercel AI SDK
- Browser/app-level caching handled by AsyncStorage persistence layer

## Authentication & Identity

**Auth Provider:**
- None currently implemented - App is fully anonymous/guest access only
- Preparation: Expo Secure Store 14.0.1 available for future token storage if authentication added
- Future integration points: Supabase Auth or external OAuth provider (Google, GitHub, etc.)

## Monitoring & Observability

**Error Tracking:**
- Not detected - No error tracking service (Sentry, LogRocket, etc.) integrated

**Logs:**
- Console-based only - Using native JavaScript `console` for development
- No structured logging framework (Winston, Pino, etc.) integrated
- Production logs not configured

**Performance Monitoring:**
- Not detected - No APM (Application Performance Monitoring) service integrated

## CI/CD & Deployment

**Hosting:**
- Not configured in codebase - Expected to be managed externally
- Expo Go for development testing
- EAS Build/Submit for production deployment (Expo's managed CI/CD)

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or equivalent configured in repository

**Analytics:**
- Not integrated - No user analytics, event tracking, or behavioral monitoring

## Environment Configuration

**Required env vars (for full functionality):**
- `ANTHROPIC_API_KEY` - Required for chat API to function; server-side only
- `EXPO_PUBLIC_SUPABASE_URL` - Optional; enables Supabase features when present
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Optional; enables Supabase features when present

**Optional env vars:**
- Any additional config not yet implemented

**Secrets location:**
- Local: `.env.local` or system environment variables (not committed to git)
- CI/CD: Manage via platform-specific secrets (GitHub Secrets, EAS Secrets, etc.)
- `.env` files are in `.gitignore` to prevent accidental commits

**Secret management pattern:**
- `ANTHROPIC_API_KEY` is server-only (accessible only in `app/api/chat+api.ts`)
- `EXPO_PUBLIC_*` prefixed vars are safe for client bundle (not sensitive)
- Expo secure store available for runtime secrets if needed

## Webhooks & Callbacks

**Incoming:**
- Not detected - No webhook endpoints or external service callbacks configured

**Outgoing:**
- Not detected - No outbound webhooks to external services

## Rate Limiting & Quotas

**Claude API:**
- Managed by Anthropic; no client-side rate limiting implemented
- Consider adding rate limiting/debouncing if high-volume user access expected

## Data Flow

**Chat Request Flow:**
1. User types message in app (React Native UI)
2. `useChat` hook from `@ai-sdk/react` sends to `/api/chat`
3. `app/api/chat+api.ts` (server-side) receives request
4. API route calls `streamText()` from `@ai-sdk/anthropic` with Claude model
5. Claude response streams back via Expo native fetch
6. UI updates in real-time as chunks arrive
7. Chat history persisted to AsyncStorage via Zustand `useChatStore`

**Onboarding Data Flow:**
1. User selects class, board, language in onboarding screens
2. Stored in Zustand `useAppStore` with AsyncStorage persistence
3. System prompt dynamically built with user profile context via `buildSystemPrompt(profile)`
4. Sent with each chat request to Claude for personalized guidance

---

*Integration audit: 2026-03-15*
