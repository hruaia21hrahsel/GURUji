# GURUji

## What This Is

GURUji is a personalized Socratic AI tutor for Indian students (Class 6-12), aligned to the NCERT/CBSE curriculum. Unlike existing edutech apps that act as QnA homework helpers, GURUji behaves like a real tutor — it remembers each student's learning pace, weak areas, teaching style preferences, and interests across sessions, using this memory to provide continuity and personalized guidance. It never gives answers directly; it guides students to discover understanding through questions, hints, and relatable examples.

## Core Value

Every student gets a tutor who knows them — their pace, their struggles, their strengths — and picks up exactly where yesterday's session left off.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Expo/React Native cross-platform scaffold (iOS, Android, Web) — existing
- ✓ File-based routing with Expo Router (tabs + onboarding) — existing
- ✓ 3-step onboarding flow (class, board, language selection) — existing
- ✓ Basic chat UI with streaming Claude API responses — existing
- ✓ Server-side API proxy keeping ANTHROPIC_API_KEY secure — existing
- ✓ Zustand state management with AsyncStorage persistence — existing
- ✓ NativeWind/Tailwind styling configured — existing
- ✓ System prompt builder with grade/board/language context — existing
- ✓ Lazy Supabase client (optional, app works without it) — existing

### Active

<!-- Current scope. Building toward these. -->

**Socratic Teaching Engine**
- [ ] GURUji teaches through guided questions, never gives direct answers
- [ ] Supports both topic-driven learning (student picks a topic) and doubt-driven learning (student asks a specific question)
- [ ] Checks understanding through mini-problems and scenarios before moving on
- [ ] When student struggles: simplifies, backtrack to prerequisites, uses relatable Indian examples (cricket, chai, daily life)

**Student Memory & Personalization**
- [ ] Tracks learning pace per subject (fast/slow learner)
- [ ] Records weak areas — topics the student struggled with — and revisits them
- [ ] Learns preferred teaching style (examples vs. analogies vs. step-by-step vs. direct)
- [ ] Remembers student interests (cricket, gaming, cooking, etc.) and weaves them into explanations
- [ ] Session continuity — "Last time we covered X, you got Y but struggled with Z"
- [ ] Adaptive personality — adjusts tone, formality, and complexity based on class level and individual student behavior

**NCERT Curriculum Structure**
- [ ] Hardcoded curriculum tree: Class → Subject → Chapter → Topic (CBSE/NCERT)
- [ ] All subjects covered: Science, Math, Social Studies, English, Hindi, etc.
- [ ] Claude's training knowledge used for actual teaching content within the curriculum structure
- [ ] CBSE board focus for v1 (ICSE, State boards deferred)

**Progress Tracking & Mastery**
- [ ] Per-topic mastery tracking (not started / learning / understood / mastered)
- [ ] Progress dashboard showing subject-wise completion and weak areas
- [ ] Suggested next topic based on curriculum sequence and student's current state

**Smart Home Screen**
- [ ] "Continue where you left off" — resume last session/topic
- [ ] Subject browse grid below
- [ ] Daily streak counter and study goals
- [ ] Quick stats (topics mastered, current streak, time studied)

**Gamification**
- [ ] Daily study streaks with visual streak counter
- [ ] XP points for completing topics, answering checks correctly
- [ ] Badges/achievements for mastery milestones (e.g., "Biology Boss", "Math Marathon")
- [ ] Progress bars per subject showing completion toward goals

**Rich Content**
- [ ] Math rendering (LaTeX/KaTeX) for equations and formulas
- [ ] Diagrams and images inline during teaching where concepts need visual aid
- [ ] Markdown formatting for structured explanations

**Bilingual Support**
- [ ] Full teaching in Hindi or English based on student's language preference
- [ ] Language preference from onboarding actually drives the teaching language
- [ ] Natural code-switching (Hinglish) where appropriate

**Authentication**
- [ ] Phone OTP login (primary)
- [ ] Google sign-in (secondary)
- [ ] Email/password (tertiary fallback)
- [ ] Session persistence across devices via Supabase auth

**Parent Dashboard**
- [ ] Parents can view child's study progress per subject
- [ ] See what topics were covered, time spent, mastery levels
- [ ] Separate parent login linked to student account

**Freemium Model**
- [ ] Paywall infrastructure built (free tier vs. paid)
- [ ] Exact limits (sessions/messages/time) configurable, not hardcoded
- [ ] Paid tier unlocks unlimited tutoring

**Backend & Data**
- [ ] Supabase as primary backend for all persistent data
- [ ] Student profiles, progress, session history stored server-side
- [ ] Cross-device sync (student can switch between phone and web)

**Safety**
- [ ] GURUji stays strictly on academic topics
- [ ] Redirects any non-educational conversation back to studying
- [ ] No personal questions, no harmful content

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- ICSE/State board-specific syllabi — CBSE/NCERT first, expand boards later
- Exam mode / previous year papers — understanding-first philosophy; if they truly get it, exams follow
- Offline learning — AI tutoring requires API connectivity; accept online-only for v1
- Real-time collaboration — single student + GURUji interaction only
- Video/audio content — text + images + math rendering sufficient for v1
- Parent-teacher messaging — parent dashboard is view-only for v1

## Context

GURUji addresses a fundamental gap in Indian edutech: existing apps (Doubtnut, Toppr, etc.) are QnA homework helpers — student asks, app answers. There's no memory, no continuity, no personalization. A real tutor remembers what was taught yesterday, knows the student's weak spots, adapts their teaching style. GURUji brings that real-tutor experience to every student's phone.

The existing codebase has a working scaffold: Expo Router with tabs, onboarding flow, basic chat with Claude streaming, Zustand state management. The foundation is solid but currently functions as a generic chatbot. The transformation is from "chat with AI" to "learn with your personal tutor."

Target audience: Indian students Class 6-12, primarily on Android, studying CBSE/NCERT curriculum. Many are in tier-2/tier-3 cities where quality tutoring is expensive or unavailable.

## Constraints

- **Tech stack**: Expo SDK 55 / React Native — already committed, cross-platform requirement
- **AI provider**: Claude via Anthropic API — already integrated via Vercel AI SDK
- **Backend**: Supabase — already partially integrated, use for all server-side data
- **Platform**: Android, iOS, Web simultaneously via Expo
- **API costs**: Freemium model must manage Claude API costs — free tier needs session limits
- **Content safety**: All users are minors (Class 6-12) — strict academic-only guardrails required
- **Language**: Hindi and English bilingual support required from v1
- **Curriculum**: NCERT/CBSE only for v1

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Socratic method over direct answers | Real tutors guide discovery, not spoon-feed. Builds deeper understanding. | — Pending |
| Student memory as core differentiator | Every competing app lacks session continuity. This is what makes GURUji feel like a real tutor. | — Pending |
| CBSE/NCERT only for v1 | Most widely used curriculum, covers majority of students. Reduce scope. | — Pending |
| Understanding over exam prep | If students truly understand concepts, exam performance follows naturally. | — Pending |
| Phone OTP as primary auth | Most Indian students don't have email; phone is universal. | — Pending |
| Supabase for backend | Already partially integrated, good free tier, real-time capabilities for future use. | — Pending |
| Strict academic guardrails | All users are minors — safety is non-negotiable. | — Pending |

---
*Last updated: 2026-03-15 after initialization*
