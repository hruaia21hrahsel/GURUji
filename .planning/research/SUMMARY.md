# Project Research Summary

**Project:** GURUji — AI Socratic Tutor for Indian Students (Class 6-12)
**Domain:** Intelligent Tutoring System (ITS), EdTech, AI-powered personalized learning
**Researched:** 2026-03-15
**Confidence:** MEDIUM-HIGH

## Executive Summary

GURUji is an Intelligent Tutoring System (ITS) built on the well-researched four-component architecture: a Tutor Model (pedagogical engine), a Domain Model (NCERT curriculum), a Student Model (persistent memory), and an Interface Layer. The core product thesis — a Socratic tutor that genuinely remembers each student across sessions — is a proven differentiator against Doubtnut (instant answers), Byju's (passive video), and generic AI chat (stateless). The recommended approach is to build these four components in strict dependency order: authentication first, curriculum tree second, student memory schema third, then the personalized tutoring engine on top. Every feature with lasting value — mastery tracking, progress dashboards, gamification, parent visibility, freemium enforcement — flows from this foundation.

The most critical technical decision is the memory architecture. Student memory must be implemented as a structured Supabase profile record (weak topics, pace, interests, mastery states, a short session summary), not as raw conversation transcripts. Full transcripts injected into every Claude request cause exponential token cost growth and context degradation after 10+ sessions. The session-end summarization pattern — using claude-haiku to extract structured facts asynchronously after each session — is the correct solution and must be designed before the first memory feature is built.

The three highest-risk areas are regulatory (India's TRAI DLT registration for SMS OTP delivery must be started before development begins, taking 3-7 business days), financial (Claude API unit economics must be modeled upfront — Sonnet at $3/M tokens with 10K DAUs is ~$900/day, requiring Haiku for free tier and prompt caching from day one), and pedagogical integrity (the Socratic no-answer constraint must be structurally enforced via a scaffolding ladder in the system prompt, not just a surface-level "don't give answers" instruction).

## Key Findings

### Recommended Stack

The existing stack (Expo SDK 55, Expo Router, NativeWind v4, Vercel AI SDK v6, Zustand, Supabase) is the right foundation and requires no changes. The new packages needed are: `expo-web-browser` and `expo-linking` for OAuth, `react-native-webview` and `react-native-katex` for math rendering, `react-native-markdown-display` for chat formatting, `expo-localization` + `i18next` + `react-i18next` for bilingual UI, `lottie-react-native` for gamification animations, and `react-native-purchases` + `react-native-purchases-ui` (RevenueCat) for the freemium paywall. Expo SDK 55's mandatory New Architecture (Fabric/JSI) is a compatibility gate — any added library must support it or use a WebView bridge.

**Core technologies:**
- Supabase Auth (phone OTP via MSG91/2Factor) — phone is the universal auth for Indian students; TRAI DLT registration is a hard prerequisite
- Supabase Postgres (`student_memory`, `topic_mastery`, `chat_sessions`) — single backend for all persistence; RLS required on every table
- Supabase Edge Functions — async session summarization (claude-haiku); keeps ANTHROPIC_API_KEY off-client
- `react-native-katex` (WebView-based) — only New Architecture-safe math rendering option in managed Expo
- `react-native-markdown-display` — native markdown for Claude's structured responses
- RevenueCat (`react-native-purchases`) — cross-platform IAP with official Expo integration; raw StoreKit/Billing is error-prone
- i18next + react-i18next + expo-localization — industry-standard two-language (Hindi/English) UI i18n; AI language set via system prompt
- Prompt caching (`cache_control: ephemeral`) — 90% reduction on input token costs; mandatory from day one, not a future optimization

### Expected Features

**Must have for launch (v1):**
- Phone OTP authentication — gates all persistence; DLT registration must be completed before auth phase begins
- NCERT curriculum browse (Class → Subject → Chapter → Topic) — structured entry point; required for mastery tracking
- Socratic teaching engine with structural no-answer constraint — the core product thesis; must be airtight before layering features
- Bilingual Hindi/English support — language preference drives system prompt; language injected on every API call (not just session start)
- Cross-session student memory — weak areas, pace, interests, last session summary; the primary differentiator
- Per-topic mastery tracking (4 states: not_started/learning/understood/mastered) — required for progress visibility
- Basic session persistence (resume last session) — required for "real tutor" feel
- Progress dashboard (student-facing) — makes learning tangible, drives retention
- Daily streak counter — highest engagement ROI relative to implementation cost
- Freemium paywall infrastructure — required to manage API costs before any public beta
- Safety guardrails (academic-only, anti-jailbreak) — non-negotiable with minor users
- Math rendering (KaTeX) — Class 9-12 STEM subjects are unusable without it

**Should have after validation (v1.x):**
- XP points and badges — add after streaks prove engagement pattern
- Parent dashboard — read-only linked account; requires mastery tracking maturity first
- Weak-area revisit scheduling — mimics real tutor recall; requires session data to be meaningful
- Google sign-in — secondary acquisition surface
- Subject-specific quick-start with interest pre-fill
- Adaptive difficulty based on mastery state

**Defer to v2+:**
- ICSE/State board curriculum trees
- Teacher/classroom accounts (B2B — different sales motion)
- Session export/share, voice input, WhatsApp OTP replacement

**Anti-features to reject outright:**
- "Just tell me the answer" toggle — destroys brand identity
- Leaderboards — demotivates 80% of users; Indian students are rank-anxiety-sensitive
- Offline AI tutoring — architecturally impossible; clarify connectivity requirement
- Exam mock tests — at odds with understanding-first philosophy

### Architecture Approach

GURUji follows the canonical four-component ITS architecture mapped to the Expo/Supabase stack. The Tutor Model (`app/api/chat+api.ts`) is the single point of contact with Claude — it assembles the system prompt from student memory + curriculum context + Socratic rules, then streams the response. The Domain Model is a static TypeScript curriculum tree (`lib/curriculum-data/`) that is imported at build time with zero runtime I/O. The Student Model lives in Supabase (`student_memory` + `topic_mastery` tables) and is read once at session start, written back asynchronously after session end. The Interface Layer is React Native screens backed by Zustand stores that are caches, not sources of truth. Supabase is the authoritative database.

**Major components:**
1. **Tutor Model** (`app/api/chat+api.ts`, `app/api/session-end+api.ts`) — context assembly, Claude streaming, post-session summarization
2. **Domain Model** (`lib/curriculum-data/`) — static NCERT tree: Class 6-12, all subjects, chapters, topics, prerequisites
3. **Student Model** (Supabase `student_memory`, `topic_mastery`) — persistent per-student knowledge state and learning profile
4. **Interface Layer** (Expo screens + Zustand caches) — chat, home dashboard, progress views, gamification
5. **Auth Layer** (Supabase Auth + expo-secure-store) — phone OTP, Google OAuth, parent-student linking via RLS
6. **Gamification Engine** (`lib/gamification.ts` + Supabase) — XP, streaks, badges; awards require demonstrated understanding, not engagement counts
7. **Usage Limits** (`lib/usage.ts`) — freemium quota checks before every Claude API call

### Critical Pitfalls

1. **Socratic prompt collapses to answer-giving** — Use a scaffolding ladder (question → smaller question → hint → partial reveal → guided completion), not just a negative constraint. Test against 5 adversarial variants ("exam is tomorrow," roleplay framing) before shipping. Fix: structural positive definition of Socratic behavior, scripted responses to "just tell me the answer."

2. **Student memory as raw transcripts** — Injecting full conversation history into every Claude call causes exponential token costs and context quality degradation after ~10 sessions. Fix: two-layer memory (last 5-10 turns as working memory + structured Supabase profile record as persistent memory). Haiku summarization at session end. Never design around raw transcript injection.

3. **TRAI DLT registration not done before launch** — Indian SMS OTP silently fails without DLT registration. No error in logs; OTPs just never arrive. Fix: start DLT registration 3-7 days before auth phase begins; use an Indian SMS provider (MSG91, 2Factor) that has pre-registered DLT infrastructure.

4. **API cost unsustainable on free tier** — A student with 10 sessions at 20 messages each consumes ~$0.60 in Sonnet tokens. Free tier at 2-8% conversion means 92-98% of users never pay. Fix: claude-haiku for free tier, Sonnet for paid; prompt caching from day one; token-budget limits (not message count limits) in `usage.ts`.

5. **Supabase RLS missing on student data tables** — Default Supabase tables ship with RLS disabled. Any authenticated user can read all other students' data via REST API. With minor users, this is both a PDPB violation and a serious reputational risk. Fix: enable RLS and write `USING (auth.uid() = user_id)` policy the moment each table is created; test cross-account access with two separate auth sessions.

6. **Language drift in bilingual sessions** — Claude follows the language of the most recent user message, not the system prompt's language preference set at session start. If a Hindi student sends one English message, subsequent responses drift to English. Fix: inject language preference on every API call, not just session initialization; explicitly require Devanagari script for Hindi (not transliteration).

7. **Auth tokens in AsyncStorage** — Budget Android devices with rooted OS are common in India's tier-2/3 market. AsyncStorage is readable without special privileges on rooted devices. Fix: expo-secure-store for all Supabase session tokens; AsyncStorage only for non-sensitive UI state.

## Implications for Roadmap

Based on the dependency graph from FEATURES.md and the build order from ARCHITECTURE.md, the suggested phase structure is:

### Phase 1: Foundation — Auth and Secure Session
**Rationale:** Every persistent feature (memory, mastery, gamification, paywall) requires a stable user identity. Auth is the hard dependency for everything else. SecureStore, RLS policies, and DLT registration must all be in place before any student data is stored.
**Delivers:** Phone OTP login, expo-secure-store token storage, Supabase profiles table with RLS, basic onboarding-to-session flow
**Addresses:** Phone OTP auth (table stakes), safety guardrails foundation
**Avoids:** AsyncStorage auth token vulnerability (Pitfall 7), RLS missing on first tables (Pitfall 10)
**Admin prerequisite:** DLT registration must START before this phase begins

### Phase 2: Domain Model — NCERT Curriculum Tree
**Rationale:** Topic identifiers from the curriculum tree are the foreign keys for mastery tracking, session routing, and progress dashboards. This is pure static TypeScript work with no external dependencies — build it early and let every later phase reference it.
**Delivers:** `lib/curriculum-data/` static tree for all classes 6-12 (CBSE/NCERT), topic IDs, prerequisites; stored in Supabase for updateability; subject navigation UI
**Addresses:** Subject/chapter navigation (table stakes), NCERT alignment (differentiator)
**Avoids:** Client-bundle hardcoding (Pitfall 8 — store in Supabase, version-hashed cache)
**Research flag:** Mapping all Class 6-12 NCERT topics is content-heavy; needs dedicated content work

### Phase 3: Student Model — Memory and Mastery Schema
**Rationale:** The Student Model tables must exist before the Tutor Model can read or write memory. This is schema work — not features yet. Establishing the structured memory architecture here prevents the raw-transcript anti-pattern from ever being introduced.
**Delivers:** `student_memory` and `topic_mastery` Supabase tables with RLS, `lib/memory.ts` helpers (fetch/update), session schema (`chat_sessions`, `chat_messages`)
**Addresses:** Cross-session memory (primary differentiator), per-topic mastery tracking
**Avoids:** Raw transcript memory explosion (Pitfall 2 — structured schema from the start)

### Phase 4: Tutor Model Enhancement — Personalized Socratic Engine
**Rationale:** With auth, curriculum, and memory schema in place, the chat API can be upgraded from a generic chatbot to a personalized Socratic tutor. This is the core product value delivery phase. The Socratic constraint system prompt must be built and adversarially tested here.
**Delivers:** Memory injection at session start, Socratic scaffolding ladder, language-consistent system prompt, `app/api/session-end+api.ts` async summarization, `lib/usage.ts` quota checks, prompt caching enabled
**Addresses:** Session continuity, bilingual support, safety guardrails, Socratic method
**Avoids:** Socratic collapse to answer-giving (Pitfall 1), language drift (Pitfall 5), prompt injection by students (Pitfall 9), API cost explosion (Pitfall 4)
**Research flag:** Socratic system prompt design; needs adversarial testing suite before phase sign-off

### Phase 5: Progress and Gamification — Visible Learning
**Rationale:** Once the Tutor Model writes mastery signals, those signals can power the progress dashboard and gamification. Gamification must come after mastery tracking — badges and XP require mastery states to be meaningful. Gamification without mastery anchor produces engagement-farming, not learning.
**Delivers:** Progress dashboard (per-topic mastery by subject), streak counter (mastery-gated, not login-gated), XP system (awarded on correct comprehension checks), lottie celebration animations
**Addresses:** Progress dashboard (table stakes), daily streak, XP and badges (differentiator)
**Avoids:** Gamification rewarding engagement over learning (Pitfall 6)

### Phase 6: Freemium Paywall — Sustainable Economics
**Rationale:** Must be in place before any public beta. API costs at scale are deterministic and calculable. Freemium without limits is a runway killer.
**Delivers:** RevenueCat integration, tiered model access (Haiku for free, Sonnet for paid), token-budget limits in `usage.ts`, soft paywall surface at session end (not mid-session), Supabase `usage_limits` table
**Addresses:** Configurable free tier (table stakes), API cost sustainability
**Avoids:** Economically unsustainable free tier (Pitfall 4); mid-session paywall UX trap

### Phase 7: Math Rendering — STEM Completeness
**Rationale:** Required for Class 9-12 Math and Science subjects to feel professional. Independent of the personalization features — can be delivered without affecting other systems. Placed after the core teaching loop is validated.
**Delivers:** `react-native-katex` integration, LaTeX detection in Claude responses, math bubble rendering in chat
**Addresses:** Math rendering (table stakes for STEM)
**Uses:** `react-native-webview` + `react-native-katex`; EAS development build required (no Expo Go)

### Phase 8: Parent Dashboard — Retention for Paying Families
**Rationale:** Indian K-12 parents pay. Visibility into their child's learning is a retention driver for subscriptions. This phase depends on mature mastery data (Phase 3-5) and a separate auth flow. Complexity justifies deferral until core loop is validated.
**Delivers:** Parent Supabase auth, `parent_links` table, RLS policy for parent-to-child read access, read-only progress views
**Addresses:** Parent dashboard (differentiator)
**Avoids:** Shared student login anti-pattern (Architecture Anti-Pattern 4), parent reading other students' data

### Phase Ordering Rationale

- Auth before everything because studentId is the foreign key for all persistent data
- Curriculum tree before mastery tracking because topic IDs are the mastery tracking keys
- Student Model schema before Tutor Model enhancement because the API route cannot write structured memory if the tables do not exist
- Progress before gamification because badges and XP cannot be meaningful without mastery states
- Freemium before public beta because API costs are immediately real
- Math rendering is independent and can ship as its own phase without blocking the teaching loop
- Parent dashboard is a v1.x feature; its dependency on mature mastery data makes early phases its prerequisite

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Curriculum Tree):** NCERT content mapping for 7 class levels across all subjects is high-volume content work. Needs a content inventory before scope can be estimated. The 2024 NEP 2020 curriculum revisions for Classes 6-8 may have changed chapter structures.
- **Phase 4 (Socratic Engine):** System prompt design for adversarial robustness is a research and testing problem, not just an implementation problem. Needs dedicated prompt engineering research and a defined adversarial test suite.
- **Phase 6 (Freemium):** RevenueCat configuration differs between iOS (App Store sandbox) and Google Play (test tracks). EAS build required to test IAP — needs build configuration research.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Auth):** Supabase phone OTP + expo-secure-store is thoroughly documented. Pattern is standard. DLT registration is the only non-standard element, and that is an administrative task.
- **Phase 3 (Student Model):** Schema design is fully specified in ARCHITECTURE.md. Supabase migration pattern is standard.
- **Phase 5 (Progress/Gamification):** Zustand store + Supabase pattern is well-documented. Lottie animations are standard.
- **Phase 8 (Parent Dashboard):** RLS + parent_links pattern is fully specified in ARCHITECTURE.md.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core stack already proven in project. New packages (katex, RevenueCat, i18next) verified against Expo SDK 55 New Architecture. Version numbers verified via npm. |
| Features | MEDIUM-HIGH | Competitor analysis verified. Indian edtech market behavior from general market data — not primary research. Gamification engagement stats from secondary sources. |
| Architecture | HIGH | ITS four-component architecture is academically established since 1980s. Memory summarization pattern verified against multiple LLM agent sources. Supabase schema fully specified. |
| Pitfalls | MEDIUM-HIGH | DLT regulatory pitfall verified against official TRAI sources. RLS and auth pitfalls verified against official Supabase/Expo docs. Socratic prompt failure mode verified against peer-reviewed NLP research. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **NCERT curriculum scope:** The full curriculum tree for Classes 6-12 (all subjects, chapters, topics) needs to be inventoried and structured before Phase 2 scope can be confirmed. NCERT's website and textbook PDFs are the authoritative source. NEP 2020 revisions (Classes 6-8 particularly) may affect expected chapter structure.
- **DLT registration entity requirement:** DLT registration requires a registered Indian business entity (PAN, GST, company registration). If the developer is a solo individual without a registered company, an alternative auth fallback (Google sign-in only at launch) must be designed. This should be clarified before Phase 1 begins.
- **Prompt caching behavior with dynamic content:** The student memory block changes per user — only the static persona + curriculum context portion is cacheable. The exact token split between cacheable static content and dynamic memory injection needs to be validated during Phase 4 to confirm cost model assumptions.
- **EAS build requirement for IAP and KaTeX:** Both RevenueCat (IAP) and react-native-katex (WebView native module) require an EAS development build rather than Expo Go. The EAS build pipeline needs to be set up before Phases 6 and 7 can be tested on device.

## Sources

### Primary (HIGH confidence)
- Expo SDK 55 Changelog — New Architecture mandatory, RN 0.83, breaking changes
- Supabase Phone Login Docs — Phone OTP, Twilio/Vonage providers, custom SMS provider configuration
- Supabase Auth React Native Quickstart — Official Expo integration pattern
- RevenueCat Expo Integration Blog — Official Expo + RevenueCat IAP tutorial
- react-native-webview GitHub — New Architecture (Fabric) support confirmed
- Expo SecureStore docs — auth token storage recommendation
- Supabase Row Level Security docs — RLS policy patterns
- Claude API Pricing (Anthropic) — token cost calculations for freemium model
- ITS Architecture (Wikipedia, Academia) — four-component ITS model canonical reference
- arxiv.org/html/2507.18882v1 — Comprehensive ITS review 2025

### Secondary (MEDIUM confidence)
- react-native-katex GitHub (v1.3.0, last published ~1 year ago) — WebView KaTeX mechanism stable
- @mem0/vercel-ai-provider npm (v2.0.5) — confirmed server-side only; not recommended for MVP
- Khanmigo AI Review 2025 — competitor feature analysis
- India SMS Messaging Regulations 2025 (TRAI DLT compliance guide) — regulatory requirements
- Freemium Models in EdTech (FasterCapital) — 2-8% conversion benchmarks
- Gamification engagement research (Plotline, BuddyBoss, Trophy.so) — streak/XP engagement data
- SocraticAI research (arxiv.org/abs/2512.03501) — scaffolded LLM tutoring patterns
- mem0.ai LLM Chat History Summarization Guide — session summarization pattern validation

### Tertiary (LOW confidence)
- Indian EdTech market behavior (SchoolNet India) — India-specific student/parent behavior inferred from general market data; no primary research
- Hinglish code-switching acceptance (BanglAssist arXiv) — cross-language AI behavior inferred from Bengali-English study

---
*Research completed: 2026-03-15*
*Ready for roadmap: yes*
