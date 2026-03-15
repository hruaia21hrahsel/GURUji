# Requirements: GURUji

**Defined:** 2026-03-15
**Core Value:** Every student gets a tutor who knows them — their pace, their struggles, their strengths — and picks up exactly where yesterday's session left off.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign up and log in with phone number + OTP
- [ ] **AUTH-02**: User can sign in with Google (one-tap)
- [ ] **AUTH-03**: User can sign up and log in with email and password
- [ ] **AUTH-04**: User session persists across app restarts and devices via Supabase Auth
- [ ] **AUTH-05**: User profile (class, board, language) synced to server after auth

### Curriculum Navigation

- [ ] **CURR-01**: User can browse NCERT curriculum tree: Class → Subject → Chapter → Topic
- [ ] **CURR-02**: User can select any topic to start a tutoring session on that topic
- [ ] **CURR-03**: Curriculum covers all subjects for Class 6-12 (Science, Math, Social Studies, English, Hindi, Sanskrit)
- [ ] **CURR-04**: Curriculum data is CBSE/NCERT-aligned and hardcoded in TypeScript

### Socratic Teaching Engine

- [ ] **TUTR-01**: GURUji teaches through guided questions and hints, never gives direct answers
- [ ] **TUTR-02**: GURUji supports topic-driven learning (student picks a topic, GURUji teaches step-by-step)
- [ ] **TUTR-03**: GURUji supports doubt-driven learning (student asks a specific question, GURUji guides to answer)
- [ ] **TUTR-04**: GURUji checks understanding through mini-problems and scenarios before progressing
- [ ] **TUTR-05**: When student struggles, GURUji simplifies, backtracks to prerequisites, and uses relatable Indian examples
- [ ] **TUTR-06**: GURUji adapts tone and complexity based on student's class level and individual behavior
- [ ] **TUTR-07**: System prompt uses a structured scaffolding ladder (not just "don't give answers") to enforce Socratic constraint

### Student Memory

- [ ] **MEMO-01**: GURUji remembers student's learning pace per subject across sessions
- [ ] **MEMO-02**: GURUji remembers topics the student struggled with and references them in future sessions
- [ ] **MEMO-03**: GURUji remembers student's preferred teaching style (examples vs. analogies vs. step-by-step)
- [ ] **MEMO-04**: GURUji remembers student's interests (cricket, gaming, etc.) and weaves them into explanations
- [ ] **MEMO-05**: Session continuity — GURUji opens with context from last session ("Last time we covered X, you got Y but struggled with Z")
- [ ] **MEMO-06**: Student memory stored as structured profiles in Supabase (not raw transcripts)
- [ ] **MEMO-07**: Session-end summarization runs async via server-side function (does not block UI)

### Mastery Tracking

- [ ] **MAST-01**: Each topic has a mastery state: not_started / learning / understood / mastered
- [ ] **MAST-02**: Mastery state updates based on student's performance during tutoring sessions
- [ ] **MAST-03**: Mastery data persists in Supabase and syncs across devices

### Progress Dashboard

- [ ] **PROG-01**: Student sees "continue where you left off" on home screen with last session/topic
- [ ] **PROG-02**: Student sees subject-wise progress (topics mastered vs. total per subject)
- [ ] **PROG-03**: Student sees current streak count and study goals
- [ ] **PROG-04**: Student sees quick stats: topics mastered, current streak, time studied
- [ ] **PROG-05**: Subject browse grid available below the continue section

### Gamification

- [ ] **GAME-01**: Daily study streak counter that increments on each day the student studies
- [ ] **GAME-02**: XP points awarded for completing topics, passing understanding checks, finishing sessions
- [ ] **GAME-03**: Achievement badges for mastery milestones (e.g., "Biology Boss", "Math Marathon", "7-Day Streak")
- [ ] **GAME-04**: Progress bars per subject showing completion toward goals

### Content Rendering

- [ ] **RNDR-01**: Math equations and formulas rendered properly via KaTeX/LaTeX
- [ ] **RNDR-02**: Chat messages support markdown formatting (bold, lists, headings, code blocks)
- [ ] **RNDR-03**: Diagrams and images can be displayed inline during teaching where concepts need visual aid

### Bilingual Support

- [ ] **LANG-01**: GURUji can teach entirely in Hindi or entirely in English based on student's language preference
- [ ] **LANG-02**: Language preference from onboarding drives the system prompt language for every session
- [ ] **LANG-03**: UI elements (navigation, buttons, labels) support Hindi and English

### Parent Dashboard

- [ ] **PRNT-01**: Parent can create a separate account linked to their child's student account
- [ ] **PRNT-02**: Parent can view child's subject-wise progress and mastery levels
- [ ] **PRNT-03**: Parent can see topics covered, time spent studying, and streak history
- [ ] **PRNT-04**: Parent dashboard is read-only (cannot modify student data)

### Freemium

- [ ] **FREE-01**: Paywall infrastructure distinguishes free and paid users
- [ ] **FREE-02**: Free tier has configurable limits (sessions, messages, or time per day — exact limits decided later)
- [ ] **FREE-03**: Soft paywall surfaces when free limit is reached with upgrade prompt
- [ ] **FREE-04**: Paid tier unlocks unlimited tutoring

### Safety

- [ ] **SAFE-01**: GURUji stays strictly on academic topics and redirects non-educational conversations
- [ ] **SAFE-02**: System prompt includes anti-jailbreak measures to prevent bypassing academic-only constraint
- [ ] **SAFE-03**: No personal questions asked or personal information collected beyond what's needed for tutoring

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Personalization

- **PERS-01**: Weak-area revisit scheduling — proactively resurface struggled topics in future sessions
- **PERS-02**: Adaptive difficulty based on mastery state — harder problems for mastered topics, simpler for learning

### Additional Auth

- **AUTH-06**: WhatsApp OTP as alternative to SMS OTP (cheaper, more reliable in India)

### Board Expansion

- **BOAR-01**: ICSE board curriculum tree
- **BOAR-02**: State board curriculum trees (Maharashtra, Karnataka, Tamil Nadu, etc.)

### Collaboration

- **COLB-01**: Session summary export/share as read-only links

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Direct answer mode / "just tell me" toggle | Destroys product thesis — GURUji must enforce understanding, not give shortcuts |
| Leaderboards / social competition | Demotivates bottom 80% of Indian students; creates exam-rank anxiety |
| Offline tutoring mode | AI tutoring requires API connectivity; caching dialogue offline is not feasible |
| Video/audio content production | Shifts product from AI tutor to content platform — different business entirely |
| Exam mock tests / previous year papers | Conflicts with understanding-first philosophy; encourages rote preparation |
| Teacher/classroom accounts (B2B) | Different sales motion; kills consumer focus. Defer to v3+ |
| Real-time session sharing | Disrupts 1:1 Socratic dialogue; adds collaborative infrastructure complexity |
| Voice input | Complex to implement with Socratic constraints; defer to v2+ |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | TBD | Pending |
| AUTH-02 | TBD | Pending |
| AUTH-03 | TBD | Pending |
| AUTH-04 | TBD | Pending |
| AUTH-05 | TBD | Pending |
| CURR-01 | TBD | Pending |
| CURR-02 | TBD | Pending |
| CURR-03 | TBD | Pending |
| CURR-04 | TBD | Pending |
| TUTR-01 | TBD | Pending |
| TUTR-02 | TBD | Pending |
| TUTR-03 | TBD | Pending |
| TUTR-04 | TBD | Pending |
| TUTR-05 | TBD | Pending |
| TUTR-06 | TBD | Pending |
| TUTR-07 | TBD | Pending |
| MEMO-01 | TBD | Pending |
| MEMO-02 | TBD | Pending |
| MEMO-03 | TBD | Pending |
| MEMO-04 | TBD | Pending |
| MEMO-05 | TBD | Pending |
| MEMO-06 | TBD | Pending |
| MEMO-07 | TBD | Pending |
| MAST-01 | TBD | Pending |
| MAST-02 | TBD | Pending |
| MAST-03 | TBD | Pending |
| PROG-01 | TBD | Pending |
| PROG-02 | TBD | Pending |
| PROG-03 | TBD | Pending |
| PROG-04 | TBD | Pending |
| PROG-05 | TBD | Pending |
| GAME-01 | TBD | Pending |
| GAME-02 | TBD | Pending |
| GAME-03 | TBD | Pending |
| GAME-04 | TBD | Pending |
| RNDR-01 | TBD | Pending |
| RNDR-02 | TBD | Pending |
| RNDR-03 | TBD | Pending |
| LANG-01 | TBD | Pending |
| LANG-02 | TBD | Pending |
| LANG-03 | TBD | Pending |
| PRNT-01 | TBD | Pending |
| PRNT-02 | TBD | Pending |
| PRNT-03 | TBD | Pending |
| PRNT-04 | TBD | Pending |
| FREE-01 | TBD | Pending |
| FREE-02 | TBD | Pending |
| FREE-03 | TBD | Pending |
| FREE-04 | TBD | Pending |
| SAFE-01 | TBD | Pending |
| SAFE-02 | TBD | Pending |
| SAFE-03 | TBD | Pending |

**Coverage:**
- v1 requirements: 49 total
- Mapped to phases: 0
- Unmapped: 49 ⚠️

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 after initial definition*
