# Codebase Concerns

**Analysis Date:** 2026-03-15

## Tech Debt

**Legacy Peer Dependencies Workaround:**
- Issue: `.npmrc` uses `legacy-peer-deps=true` due to React 19.1.0 vs Vercel AI SDK peer dependency conflicts
- Files: `.npmrc`, `package.json`
- Impact: Masks peer dependency issues during dependency resolution. Future updates to `ai`, `@ai-sdk/anthropic`, or `@ai-sdk/react` may introduce silent incompatibilities. Increases risk of runtime errors.
- Fix approach: Track when React 19 becomes standard in AI SDK peer dependencies. Revisit this setting quarterly. Consider pinning exact versions of `ai` and `@ai-sdk/*` packages to minimize conflict surface.

**Supabase Lazy Initialization Risk:**
- Issue: `lib/supabase.ts` (referenced in CLAUDE.md) lazy-initializes only when env vars present, but initialization logic not yet implemented
- Files: `lib/supabase.ts` (to be created)
- Impact: App works without Supabase, but async initialization during runtime could cause race conditions if multiple components attempt initialization simultaneously. No error boundary established.
- Fix approach: Implement singleton pattern with initialization lock. Add initialization status tracking to Zustand store. Guard all Supabase calls with initialization check.

**Streaming Transport Assumptions:**
- Issue: Chat implementation assumes `expo/fetch` native streaming works correctly, but no fallback for environments that don't support streaming
- Files: `components/chat/*` (to be created), `app/api/chat+api.ts` (to be created)
- Impact: Streaming may fail silently on older devices/web. Users see loading spinner indefinitely instead of partial message updates.
- Fix approach: Implement graceful degradation — poll `GET /api/chat` endpoint as fallback if streaming fails. Add timeout/retry logic.

## Known Bugs

**Onboarding State Persistence Incomplete:**
- Issue: `useAppStore` with `persist` middleware (Zustand + AsyncStorage) created but no validation of persisted state structure
- Files: `store/appStore.ts` (to be created), `app/_layout.tsx` (to be created)
- Impact: If AsyncStorage contains corrupted/old state, app could crash on boot or show stale onboarding. No migration path for schema changes.
- Workaround: Manually clear app data from device settings or use `AsyncStorage.removeItem()` in debugger
- Fix approach: Add schema versioning to persisted state. Implement migration function that validates and upgrades old state structures.

**No Error Boundary for Chat API Failures:**
- Issue: Chat API route (`app/api/chat+api.ts`) will be created without documented error handling strategy
- Files: `app/api/chat+api.ts` (to be created), `app/(tabs)/chat.tsx` (to be created)
- Impact: If ANTHROPIC_API_KEY is invalid, expired, or rate-limited, user sees cryptic error. No recovery UX.
- Workaround: Check browser console for error details
- Fix approach: Wrap API calls in try-catch. Return structured error objects with user-friendly messages. Implement retry logic for transient failures (429, 503).

## Security Considerations

**API Key Exposure Risk:**
- Risk: ANTHROPIC_API_KEY stored in `.env.local` file. If committed, key is leaked.
- Files: `.env.local` (not committed, but risk exists), `.gitignore` (correctly excludes `.env.local`)
- Current mitigation: `.gitignore` includes `.env.local`. `.npmrc` configured correctly. No hardcoded secrets detected.
- Recommendations:
  - Add pre-commit hook to scan for `sk-ant-` pattern in staged files
  - Document in `CLAUDE.md` that `.env.local` must never be committed
  - Use GitHub Secrets for CI/CD instead of local `.env` files
  - Implement API key rotation policy (quarterly)

**Supabase Anon Key Exposure:**
- Risk: `EXPO_PUBLIC_SUPABASE_ANON_KEY` is intentionally public (Expo apps cannot hide secrets), but if RLS policies are misconfigured, allows direct database access
- Files: `.env.local` (contains key), Supabase console (RLS policies to be created)
- Current mitigation: Key is anon-only, cannot perform admin operations
- Recommendations:
  - Document RLS policy requirements in `lib/supabase.ts`
  - Test RLS policies before deploying (verify non-authenticated users cannot bypass row-level security)
  - Log and monitor all Supabase direct queries (supplement with server-side API calls for sensitive operations)

**System Prompt Injection Risk:**
- Risk: `lib/system-prompt.ts` embeds full GURUji persona as string. If student input is not properly sanitized, could attempt prompt injection
- Files: `lib/system-prompt.ts` (to be created), `app/api/chat+api.ts` (to be created)
- Current mitigation: None yet implemented
- Recommendations:
  - Never concatenate user input directly into system prompt
  - Use Vercel AI SDK's message role-based system (user/assistant) instead of string concatenation
  - Log all messages for audit trail (optional, but recommended for safety)
  - Consider rate-limiting per user to prevent abuse

## Performance Bottlenecks

**Chat Message Rendering with Long Conversations:**
- Problem: As chat history grows, rendering all messages in `chat.tsx` will become slow. React Native doesn't virtualize flat lists by default.
- Files: `app/(tabs)/chat.tsx` (to be created), `components/chat/*` (to be created)
- Cause: Full re-render of entire message list on every new message. No lazy loading.
- Improvement path:
  - Use `FlatList` instead of `.map()` to render messages (virtualization)
  - Implement pagination (load only last 50 messages on open, older on scroll)
  - Memoize message components with `React.memo()` to prevent unnecessary re-renders
  - Consider splitting into separate chat session routes (`app/chat/[id].tsx`) to limit history per session

**Zustand Store Updates Without Batching:**
- Problem: `useAppStore` and `useChatStore` updates happen synchronously. Each store action causes component re-render.
- Files: `store/appStore.ts`, `store/chatStore.ts` (to be created)
- Cause: No batching mechanism. Multiple rapid actions trigger cascading renders.
- Improvement path:
  - Use Zustand's `batch()` for multiple related state updates
  - Consider splitting stores by domain (onboarding/profile separate from chat) to reduce re-render scope
  - Profile change (class/board/language) should not trigger chat history re-render

**API Response Time Without Caching:**
- Problem: System prompt built dynamically on every chat request. No caching of Claude responses.
- Files: `lib/system-prompt.ts` (to be created), `app/api/chat+api.ts` (to be created)
- Cause: `buildSystemPrompt(profile)` rebuilds string on every message. No memoization.
- Improvement path:
  - Memoize system prompt based on profile hash
  - Cache successful responses by user + topic (with TTL)
  - Implement debouncing for rapid consecutive messages

## Fragile Areas

**Onboarding Guard Logic:**
- Files: `app/_layout.tsx` (to be created)
- Why fragile: Root layout must redirect unauthenticated users to onboarding. If guard logic is incorrect, could:
  - Infinite redirect loop if onboarding completion check has race condition
  - Allow access to chat/settings without completing onboarding
  - Get stuck on onboarding screen after completion due to stale state check
- Safe modification:
  - Use single source of truth for onboarding completion (`useAppStore.isOnboarded`)
  - Add debug logs at entry/exit of guard
  - Test with cleared AsyncStorage to verify fresh onboarding works
- Test coverage: Gaps
  - No test coverage exists yet for onboarding flow
  - Need unit tests: each onboarding step updates store correctly
  - Need integration test: full 3-step flow → successfully reaches chat
  - Need edge case test: back navigation, app background/foreground during onboarding

**Streaming Response Parsing:**
- Files: `app/(tabs)/chat.tsx` (to be created), `app/api/chat+api.ts` (to be created), `components/chat/*` (to be created)
- Why fragile: Vercel AI SDK v6 changed response format. `UIMessage` uses `parts[]` instead of `content`. Incorrect parsing causes:
  - Messages don't render (parts array misunderstood)
  - Partial messages break UI (incomplete JSON from stream)
  - Type errors if response structure mismatches expectations
- Safe modification:
  - Create type-safe message wrapper: `parseUIMessage(msg: UIMessage): RenderedMessage`
  - Validate each streamed chunk has expected structure before parsing
  - Add fallback rendering for unknown message types
- Test coverage: Gaps
  - No tests for message parsing
  - Need unit tests: parseUIMessage handles all part types (text, code, etc.)
  - Need integration test: streaming response with markdown renders correctly
  - Edge case: incomplete message streams (network interruption) handled gracefully

**System Prompt Injection in Grade-Level Context:**
- Files: `lib/system-prompt.ts` (to be created), `app/api/chat+api.ts` (to be created)
- Why fragile: `buildSystemPrompt(profile)` appends user profile (class/board/language) to system prompt. If profile contains special characters or injection attempts:
  - Prompt behavior changes unexpectedly
  - User could influence tutor personality by manipulating grade/board field
- Safe modification:
  - Validate profile values against whitelist (classes 6-12, valid boards, valid languages)
  - Escape profile values before concatenation
  - Log all system prompts (optional audit trail)
- Test coverage: Gaps
  - No validation of profile inputs
  - Need unit test: invalid class values rejected
  - Need security test: attempt prompt injection via profile fields

**Supabase Client Initialization Race Condition:**
- Files: `lib/supabase.ts` (to be created)
- Why fragile: Lazy initialization means first call to Supabase during app startup. If multiple components attempt initialization simultaneously:
  - Race condition creates multiple client instances
  - AsyncStorage race on first read could return stale data
  - Network request may hang if initialization not awaited
- Safe modification:
  - Use initialization lock/promise singleton pattern
  - Initialize Supabase in `app/_layout.tsx` at app startup, not lazy
  - Add error handling if initialization fails (app should still work without Supabase)
- Test coverage: Gaps
  - No tests for Supabase initialization
  - Need unit test: initialization happens once despite multiple calls
  - Need edge case test: Supabase unavailable → app still boots

## Scaling Limits

**Chat History Storage in AsyncStorage:**
- Current capacity: AsyncStorage typically 5-10MB on mobile devices
- Limit: Approximately 10,000-50,000 messages before hitting storage quota (depends on message length and metadata)
- When it breaks: Large chat histories (>6 months of daily use) cause storage errors. Older messages lost silently.
- Scaling path:
  - Implement automatic pruning (delete messages older than 3 months)
  - Move old conversations to Supabase (if available)
  - Implement pagination to load only recent messages initially
  - Estimate 1KB per message average — plan for <100MB across all chats

**Concurrent Users on Claude API:**
- Current capacity: Anthropic Claude API has rate limits (varies by plan)
- Limit: If app gains 1000+ concurrent users, will hit rate limits (429 Too Many Requests)
- When it breaks: Users see rate-limit errors during peak usage
- Scaling path:
  - Add request queuing and backoff retry logic
  - Implement per-user rate limiting on backend (track requests per minute)
  - Monitor API metrics (response time, error rate) via Anthropic dashboard
  - Consider batch processing if suitable for NCERT curriculum use case

**Single Supabase Anon Key for All Users:**
- Current capacity: Anon key allows unlimited RLS-constrained queries (limited by Supabase plan)
- Limit: Supabase free tier: 50,000 row reads/month. Paid tier scales to millions.
- When it breaks: Exceeding tier limits causes database queries to fail
- Scaling path:
  - Monitor Supabase metrics (row reads, write count)
  - Upgrade Supabase plan as user base grows
  - Implement server-side API layer to control query cost (don't expose raw Supabase queries)

## Dependencies at Risk

**React Native 0.81.4 with React 19.1.0:**
- Risk: React Native 0.81 is not officially tested with React 19. Compatibility issues may emerge.
- Impact: Components may not render. Hooks may break. State updates may behave unexpectedly.
- Migration plan: Monitor React Native release notes. When React Native 0.82+ officially supports React 19, upgrade.

**Vercel AI SDK v6 (Recent Major Version):**
- Risk: AI SDK v6 is a major rewrite. API surface changed significantly from v5 (breaking change in `useChat` hook). Future v7 may introduce new breaking changes.
- Impact: Code relying on `useChat` API will break. Message format parsing will fail.
- Migration plan: Lock to `^6.0.116` (minor/patch updates only). Subscribe to Vercel AI SDK changelog. Plan quarterly updates.

**Expo SDK 54 (Not Latest):**
- Risk: Expo 54 released Nov 2024. Latest is Expo 55+. Missing security patches and new features.
- Impact: Potential security vulnerabilities. New React Native features unavailable.
- Migration plan: Upgrade to Expo 55+ when tested. Check for breaking changes in `expo-router` and `expo-secure-store`.

**NativeWind v4 with Tailwind CSS Versioning:**
- Risk: NativeWind v4 is relatively new. Tailwind CSS v3 to v4 migration will be breaking. NativeWind support unclear.
- Impact: Styling breaks on Tailwind update. Custom colors/theme not applied.
- Migration plan: Pin NativeWind and Tailwind to current versions for now. Monitor NativeWind for v4 → v5 compatibility issues.

## Missing Critical Features

**No Error Logging or Monitoring:**
- Problem: App has no error tracking. Bugs in production will not be detected.
- Blocks: Cannot diagnose production issues. No alerts for crashes or API failures.
- Fix approach: Integrate Sentry (free tier available). Send unhandled errors to Sentry dashboard. Monitor error rate weekly.

**No User Analytics:**
- Problem: App has no analytics. Cannot measure usage, feature adoption, or user engagement.
- Blocks: Product decisions without data. Cannot identify which students struggle most.
- Fix approach: Add PostHog or Mixpanel. Track: session duration, messages per session, subject distribution. Privacy-compliant (anonymized).

**No Rate Limiting on Chat API:**
- Problem: No client-side or server-side rate limiting. User can spam API with hundreds of requests.
- Blocks: High API costs. Potential for abuse.
- Fix approach: Add rate limiting to `app/api/chat+api.ts`. Store request count per user in Zustand. Reject requests exceeding 10/minute.

**No Offline Support:**
- Problem: App requires internet. No queuing or offline draft save for messages.
- Blocks: User cannot compose message if connection drops. Message lost.
- Fix approach: Implement message draft save to AsyncStorage. Queue failed messages. Retry on reconnection.

**No Content Moderation:**
- Problem: GURUji system prompt doesn't prevent off-topic conversation. Tutor will respond to non-academic queries.
- Blocks: Students can waste time on non-curriculum topics. AI responses may be inappropriate.
- Fix approach: Add moderation layer to chat endpoint. Use Claude to classify message intent before responding. Reject or redirect off-topic queries.

## Test Coverage Gaps

**Onboarding Flow - Untested:**
- What's not tested: Complete onboarding journey (class → board → language → completion)
- Files: `app/onboarding/index.tsx`, `app/onboarding/board.tsx`, `app/onboarding/language.tsx` (to be created), `store/appStore.ts` (to be created)
- Risk: Infinite loops, navigation breaks, state corruption during onboarding. Users cannot start using app.
- Priority: High

**Chat Message Parsing - Untested:**
- What's not tested: Streaming response parsing, UIMessage format handling, markdown rendering
- Files: `app/(tabs)/chat.tsx`, `components/chat/*`, `app/api/chat+api.ts` (to be created)
- Risk: Messages don't render. Partial messages cause UI crashes. Types don't match Vercel AI SDK v6 format.
- Priority: High

**System Prompt Injection - Untested:**
- What's not tested: Profile input validation, injection attempts, prompt mutation
- Files: `lib/system-prompt.ts`, `app/api/chat+api.ts` (to be created)
- Risk: User manipulates tutor behavior. Prompt hijacking. Security breach.
- Priority: High

**Supabase Integration - Untested:**
- What's not tested: Lazy initialization, RLS policy enforcement, connection failures
- Files: `lib/supabase.ts` (to be created), any future Supabase queries
- Risk: Race conditions on startup. Accidental data access without permission. Silent failures.
- Priority: Medium

**Store Persistence - Untested:**
- What's not tested: AsyncStorage save/restore, state corruption recovery, migration on schema change
- Files: `store/appStore.ts`, `store/chatStore.ts` (to be created)
- Risk: App crashes on boot with corrupted state. Old state from previous version breaks new version.
- Priority: Medium

**API Error Handling - Untested:**
- What's not tested: Invalid API key, rate limiting (429), server errors (500), network timeouts
- Files: `app/api/chat+api.ts`, `app/(tabs)/chat.tsx` (to be created)
- Risk: Users see cryptic errors. No recovery path. App hangs indefinitely.
- Priority: Medium

---

*Concerns audit: 2026-03-15*
