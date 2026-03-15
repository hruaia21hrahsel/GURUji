# Roadmap: GURUji

## Overview

Starting from a working Expo chat scaffold, GURUji is transformed into a genuine Socratic AI tutor that knows each student across sessions. The build follows strict dependency order: user identity first, then the curriculum vocabulary those identities interact with, then the memory schema that makes personalization possible, then the personalized teaching engine itself. Progress visibility, gamification, freemium enforcement, rich content rendering, and parent visibility follow in the order they depend on earlier phases being complete.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Auth** - Users can sign in with phone OTP, Google, or email and stay logged in across devices
- [ ] **Phase 2: Curriculum** - Students can browse the complete NCERT/CBSE curriculum tree and start a session on any topic
- [ ] **Phase 3: Student Model** - GURUji tracks per-student learning pace, weak areas, interests, and per-topic mastery in Supabase
- [ ] **Phase 4: Tutor Engine** - GURUji teaches Socratically with memory injection, bilingual support, and strict academic guardrails
- [ ] **Phase 5: Progress and Gamification** - Students see subject-wise progress, mastery levels, streaks, XP, and badges
- [ ] **Phase 6: Freemium** - Free and paid tiers are enforced with configurable limits and a soft paywall
- [ ] **Phase 7: Rich Content** - Math equations, markdown formatting, and inline diagrams render properly in chat
- [ ] **Phase 8: Parent Dashboard** - Parents can view their child's progress and mastery in a read-only linked account

## Phase Details

### Phase 1: Auth
**Goal**: Users can securely sign in and stay authenticated across devices
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. User can sign up and log in with a phone number and OTP
  2. User can sign in with one-tap Google authentication
  3. User can sign up and log in with email and password
  4. User remains logged in after closing and reopening the app on any device
  5. User's class, board, and language preferences from onboarding sync to Supabase after login
**Plans**: 3 plans
Plans:
- [ ] 01-01-PLAN.md — App scaffold, Supabase client with LargeSecureStore, Zustand stores, navigation guard, test framework
- [ ] 01-02-PLAN.md — Unified auth screen with phone OTP, Google sign-in, and email/password
- [ ] 01-03-PLAN.md — PIN/biometric lock, profile sync, settings auth management, end-to-end verification

### Phase 2: Curriculum
**Goal**: Students can navigate the full NCERT Class 6-12 curriculum and launch a tutoring session on any topic
**Depends on**: Phase 1
**Requirements**: CURR-01, CURR-02, CURR-03, CURR-04
**Success Criteria** (what must be TRUE):
  1. Student can browse a hierarchy of Class → Subject → Chapter → Topic
  2. Student can tap any topic to start a tutoring session scoped to that topic
  3. All subjects for Classes 6-12 (Science, Math, Social Studies, English, Hindi, Sanskrit) are present
  4. Curriculum data is CBSE/NCERT-aligned and loads instantly without a network call
**Plans**: TBD

### Phase 3: Student Model
**Goal**: GURUji knows each student's history — their pace, weak areas, interests, mastery per topic — and stores it durably in Supabase
**Depends on**: Phase 2
**Requirements**: MEMO-01, MEMO-02, MEMO-03, MEMO-04, MEMO-05, MEMO-06, MEMO-07, MAST-01, MAST-02, MAST-03
**Success Criteria** (what must be TRUE):
  1. GURUji opens each session with a summary of what was covered and struggled with last time
  2. Each topic shows one of four mastery states: not started, learning, understood, or mastered
  3. Mastery state updates after the student completes understanding checks during a session
  4. Student memory (pace, interests, weak areas) persists in Supabase and is available on any device
  5. After a session ends, a session summary is written to Supabase without blocking the chat UI
**Plans**: TBD

### Phase 4: Tutor Engine
**Goal**: GURUji teaches through Socratic questions in the student's language, personalizing every response using stored memory, and refusing non-academic conversation
**Depends on**: Phase 3
**Requirements**: TUTR-01, TUTR-02, TUTR-03, TUTR-04, TUTR-05, TUTR-06, TUTR-07, LANG-01, LANG-02, LANG-03, SAFE-01, SAFE-02, SAFE-03
**Success Criteria** (what must be TRUE):
  1. GURUji never gives a direct answer — it always responds with a guiding question, hint, or partial reveal
  2. A student asking about a topic receives step-by-step guided instruction; a student asking a specific doubt gets guided to the answer
  3. GURUji checks understanding with a mini-problem before moving to the next concept
  4. When a student is stuck, GURUji simplifies and uses a cricket, chai, or daily-life example
  5. GURUji teaches entirely in Hindi or English based on the student's onboarding preference, without drifting languages mid-session
  6. GURUji redirects any non-academic message back to studying and cannot be jailbroken into giving direct answers
**Plans**: TBD

### Phase 5: Progress and Gamification
**Goal**: Students see their learning progress made tangible — topics mastered, daily streaks, XP earned, and subject completion bars
**Depends on**: Phase 3
**Requirements**: PROG-01, PROG-02, PROG-03, PROG-04, PROG-05, GAME-01, GAME-02, GAME-03, GAME-04
**Success Criteria** (what must be TRUE):
  1. Home screen shows the last topic studied with a one-tap "continue" button
  2. Student sees subject-wise progress: how many topics are mastered out of total per subject
  3. Student sees a daily streak counter that increments only on days they complete at least one understanding check
  4. Student earns XP for passing understanding checks and completing topics, visible in their profile
  5. Student receives a badge when reaching a mastery milestone (e.g., mastering all topics in a subject chapter)
**Plans**: TBD

### Phase 6: Freemium
**Goal**: Free-tier usage is capped at configurable limits, paid tier is unlocked via in-app purchase, and the paywall surfaces gracefully without disrupting mid-session flow
**Depends on**: Phase 4
**Requirements**: FREE-01, FREE-02, FREE-03, FREE-04
**Success Criteria** (what must be TRUE):
  1. Free-tier users are blocked from starting a new session once their daily limit is reached
  2. The daily limit (sessions, messages, or tokens) is configurable in server-side config without a code deploy
  3. A free-tier user who hits the limit sees a soft upgrade prompt (not an abrupt error)
  4. A paid-tier user can tutor without any session or message limits
**Plans**: TBD

### Phase 7: Rich Content
**Goal**: Math equations, markdown-formatted explanations, and inline diagrams render properly in the chat interface
**Depends on**: Phase 4
**Requirements**: RNDR-01, RNDR-02, RNDR-03
**Success Criteria** (what must be TRUE):
  1. A LaTeX math expression sent by GURUji renders as a formatted equation, not raw LaTeX text
  2. GURUji responses with bold, lists, headings, and code blocks display with proper formatting
  3. GURUji can display a diagram or image inline within a chat message when teaching a visual concept
**Plans**: TBD

### Phase 8: Parent Dashboard
**Goal**: Parents can view their child's study activity, mastery levels, and streak in a separate read-only account
**Depends on**: Phase 5
**Requirements**: PRNT-01, PRNT-02, PRNT-03, PRNT-04
**Success Criteria** (what must be TRUE):
  1. A parent can create a separate account and link it to their child's student account
  2. Parent sees subject-wise mastery levels and topics covered for their child
  3. Parent sees time spent studying, session history, and streak count
  4. Parent account has no controls that can modify the student's profile, progress, or sessions
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Auth | 0/3 | Planning complete | - |
| 2. Curriculum | 0/? | Not started | - |
| 3. Student Model | 0/? | Not started | - |
| 4. Tutor Engine | 0/? | Not started | - |
| 5. Progress and Gamification | 0/? | Not started | - |
| 6. Freemium | 0/? | Not started | - |
| 7. Rich Content | 0/? | Not started | - |
| 8. Parent Dashboard | 0/? | Not started | - |
