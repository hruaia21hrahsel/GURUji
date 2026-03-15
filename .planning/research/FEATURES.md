# Feature Research

**Domain:** AI-powered Socratic tutoring app for Indian K-12 students (NCERT/CBSE)
**Researched:** 2026-03-15
**Confidence:** MEDIUM-HIGH (WebSearch verified against known platforms; Indian-specific behavior from general market data)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Persistent chat history | Every messaging app since WhatsApp has trained this expectation. Students want to re-read explanations. | MEDIUM | Store per-session in Supabase; load on session resume. |
| Streaming AI responses | ChatGPT/Gemini normalized token-by-token streaming. Static waits feel broken. | LOW | Already implemented via Vercel AI SDK + expo/fetch. |
| Subject/chapter navigation | Students arrive with a specific topic in mind. No browse = no entry point. | MEDIUM | Hardcoded NCERT curriculum tree: Class → Subject → Chapter → Topic. |
| Phone OTP login | India has 750M+ smartphone users. Most students (especially tier-2/3) have no email. OTP is the universal login. | MEDIUM | Supabase Auth supports phone OTP. WhatsApp OTP emerging as cheaper/encrypted alternative. |
| Progress dashboard | Students (and parents) need to see what has been covered. "Am I actually learning?" requires visual proof. | MEDIUM | Per-topic mastery states: Not started / Learning / Understood / Mastered. |
| Responsive markdown rendering | Structured explanations with bullet points, bold terms, numbered steps — expected from any AI assistant. | LOW | React Native Markdown library; already scaffolded. |
| Bilingual support (Hindi/English) | NCERT curriculum is taught in both languages. Most tier-2/3 students are more comfortable in Hindi. Forcing English creates friction. | MEDIUM | Language set at onboarding; drives system prompt context. Hinglish code-switching is a bonus. |
| Safety guardrails | All users are minors. Parents will abandon app if GURUji can be manipulated into non-academic conversations. | LOW | System prompt enforcement; topic classification layer. |
| Session continuity ("continue where you left off") | A real tutor picks up from last session. Without this, GURUji is just a chatbot reset. | HIGH | Requires persistent session storage in Supabase + session summary injection into context. |
| Configurable free tier | Students and parents will test before paying. Hard paywalls at first interaction kill acquisition. | MEDIUM | Message/session count limit configurable server-side. Soft paywall surfaces at limit. |

---

### Differentiators (Competitive Advantage)

Features that set GURUji apart from Doubtnut (camera QnA), Byju's (video lectures), and generic AI chat.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Cross-session student memory | Every competing app forgets the student between sessions. GURUji remembers weak areas, pace, preferred teaching style, and interests. This is the primary differentiator. | HIGH | Requires structured memory schema in Supabase: weak_topics[], learning_pace, style_preference, interests[]. Injected into system prompt on session start. |
| Socratic method as a hard constraint | Competitors either give direct answers (Doubtnut) or passive video (Byju's). GURUji never gives answers — it guides discovery. Builds real understanding vs. homework completion. | MEDIUM | System prompt must be airtight against answer-giving. Needs fallback paths when student is stuck (simplify, backtrack, use analogy). |
| NCERT curriculum alignment | Students and parents care deeply that help is "on syllabus." Generic AI tutors offer no curriculum guarantee. | MEDIUM | Hardcoded curriculum tree. Claude's training knowledge is extensive on NCERT content; no external content pipeline needed for v1. |
| Relatable Indian examples | Explaining physics using cricket ball trajectories, chemistry using chai making, math using market pricing. Increases comprehension for target demographic. | LOW | System prompt directive with example bank. Driven by student interest profile. |
| Adaptive difficulty based on mastery state | AI adjusts question complexity based on per-topic mastery, not just session performance. Student who "understands" fractions gets harder fraction problems; student still "learning" gets simpler ones. | HIGH | Requires mastery state read on each session start + system prompt injection. |
| Weak-area revisit scheduling | After a session where a student struggled with quadratic equations, next relevant session opens with a revisit question. Mimics real tutor behavior. | HIGH | Needs "scheduled revisit" queue in student profile. Triggered on session start for relevant subject. |
| Daily streak + XP gamification | Duolingo's internal data shows 2.3x higher daily engagement after 7+ day streaks. Streaks + XP drive habit formation, which is critical for learning outcomes. | LOW | Streak counter in Zustand/Supabase. XP accrual on: topic complete, check passed, session done. |
| Math rendering (LaTeX/KaTeX) | Math tutoring without proper equation rendering feels amateur. Class 9-12 students doing calculus, trigonometry, and algebra need clean formula display. | MEDIUM | react-native-katex via WebView — known solution in React Native ecosystem. Performance acceptable for isolated equations. |
| Parent dashboard (view-only) | Indian K-12 market: parents pay. Parents who can see their child's progress are more likely to stay subscribed. Competitor apps offer no parent visibility. | MEDIUM | Separate parent auth linked to student account. Read-only views: subjects covered, time studied, mastery per topic. |

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Direct answer mode / "just tell me the answer" toggle | Students get frustrated during Socratic dialogue, especially under exam pressure. Many will request a shortcut. | Defeats the entire product thesis. If GURUji gives direct answers on demand, it becomes indistinguishable from Doubtnut. Destroys brand identity. | Progressive hint system: if student is genuinely stuck after 3 attempts, GURUji gives a stronger hint (not the answer) and explains the reasoning step. |
| Leaderboards / social competition | Gamification research shows leaderboards increase engagement for top performers but demotivate the bottom 80%. Indian students are acutely exam-rank sensitive — a leaderboard creates anxiety not motivation. | Demotivates majority of the target audience. Creates toxic competition among classmates. Adds social infrastructure complexity. | Personal bests only. "You mastered 3 more topics this week than last week." Internal progress comparison, not inter-student comparison. |
| Offline mode | Connectivity is improving in tier-2/3 India but still patchy. Offline tutoring sounds useful. | AI tutoring requires API connectivity. Caching conversations is feasible; generating new Socratic dialogue offline is not. Complex sync logic, large storage use, and a broken experience when student expects a real tutor response. | Download summary of past sessions for offline review. Make it clear the app needs connectivity for live tutoring. |
| Video/audio content production | "Students learn better with video" is true. Khanmigo does text + KA's video library. | Producing quality NCERT-aligned videos is a massive separate workload. It shifts the product from AI tutor to content platform — a different business entirely. | Claude's explanations + math rendering + diagrams (where available) are sufficient for v1 Socratic tutoring. Add video links to official NCERT content as supplementary, not native. |
| Exam mock tests / previous year papers | Students and parents will ask for this constantly — it's a known edutech category. | Fundamentally at odds with the understanding-first philosophy. Mock tests encourage rote preparation, which is the exact problem GURUji aims to solve. Adding this creates an identity crisis. | Concept-check mini-problems after each topic. "Understanding checks" that feel like practice, not exams. |
| Teacher/classroom accounts | Schools might want to deploy GURUji. Seems like a market expansion. | B2B school sales cycle is long and kills focus. Enterprise features (class management, bulk accounts, teacher dashboards) add significant complexity that diverts from the core consumer product. | Defer to v3+. Build consumer product-market fit first, then enterprise can follow. |
| Real-time session sharing with friends | Study groups are common in India. Students might want to share a session. | Adds collaborative infrastructure complexity. Chat is fundamentally a 1:1 Socratic dialogue — a third party disrupts the adaptive tutoring flow. | Let students export/share session summaries as read-only links. Doesn't require real-time infra. |

---

## Feature Dependencies

```
Authentication (Phone OTP)
    └──required by──> Student Profile (cross-device)
                          └──required by──> Cross-session Memory
                          └──required by──> Mastery Tracking
                          └──required by──> Parent Dashboard
                          └──required by──> Freemium Paywall (user-level limits)

NCERT Curriculum Tree
    └──required by──> Subject Navigation
    └──required by──> Mastery Tracking (topic identifiers)
    └──required by──> Weak-area Revisit Scheduling
    └──required by──> Progress Dashboard

Mastery Tracking
    └──enhances──> Adaptive Difficulty (reads mastery state)
    └──enhances──> Weak-area Revisit Scheduling (reads struggle history)
    └──enhances──> Progress Dashboard (visualization)
    └──enhances──> Parent Dashboard (data source)

Cross-session Memory
    └──required by──> Session Continuity ("continue where you left off")
    └──enhances──> Socratic Engine (personalizes hints and examples)
    └──enhances──> Interest-based Examples (reads interests[])

Gamification (Streaks, XP)
    └──requires──> Authentication (to persist across devices)
    └──enhances──> Progress Dashboard (streak display)

Math Rendering (KaTeX)
    └──independent──> (can ship without affecting other features)

Parent Dashboard
    └──requires──> Authentication (separate parent account)
    └──requires──> Mastery Tracking (data to display)

Freemium Paywall
    └──requires──> Authentication (user-level limit tracking)
    └──conflicts──> Anonymous guest mode (limits can't be enforced without identity)
```

### Dependency Notes

- **Authentication gates everything persistent:** Cross-session memory, mastery tracking, parent dashboard, and paywall enforcement all require a persistent user identity. Authentication must ship before any of these.
- **Curriculum tree gates mastery tracking:** Topic identifiers must be defined before mastery states can be recorded. The curriculum schema is a hard prerequisite.
- **Cross-session memory is the differentiator but not the foundation:** It sits on top of auth + curriculum + mastery. Can ship basic chat first, then layer memory. But without memory, GURUji is just a chatbot — so memory must follow quickly.
- **Parent dashboard is a late phase feature:** It requires auth, mastery tracking, and a separate auth flow for parents. Don't attempt before those foundations exist.
- **Gamification is low-dependency:** Streaks and XP only require auth for cross-device persistence. Can be added early for engagement without complex infrastructure.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — validates "personal Socratic tutor who knows you" thesis.

- [ ] Phone OTP authentication — without this, no persistence, no memory, no paywall
- [ ] NCERT curriculum browse (Class → Subject → Chapter → Topic) — entry point to structured learning
- [ ] Socratic chat engine — the core product; must enforce no-direct-answer constraint
- [ ] Bilingual Hindi/English — language set at onboarding already; needs to actually drive system prompt
- [ ] Basic session persistence — store/resume last session; minimal session continuity
- [ ] Per-topic mastery tracking (4 states) — needed to make progress visible
- [ ] Cross-session student memory — weak areas, pace, interests; this is the primary differentiator
- [ ] Progress dashboard (student-facing) — makes learning tangible; drives retention
- [ ] Daily streak counter — simplest gamification; high engagement ROI per implementation cost
- [ ] Configurable freemium paywall — required to manage Claude API costs at any user scale
- [ ] Safety guardrails (academic-only) — non-negotiable with minor users
- [ ] Math rendering (KaTeX) — required for Math/Science subjects to feel professional

### Add After Validation (v1.x)

Features to add once core tutoring loop is validated.

- [ ] XP points and badges — add after streak proves engagement pattern; more gamification complexity
- [ ] Parent dashboard — adds retention for paying parents; requires mastery tracking to be mature first
- [ ] Weak-area revisit scheduling — sophisticated tutoring behavior; requires session data to be meaningful
- [ ] Google sign-in — secondary auth for students who have Google accounts; adds acquisition surface
- [ ] Subject-specific quick start (interest pre-fill) — reduces friction to starting a session on a specific topic
- [ ] Markdown + image rendering — richer explanations; lower priority than math rendering

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] ICSE / State board curriculum trees — significant curriculum mapping work; low priority until CBSE/NCERT validated
- [ ] Teacher/classroom accounts — B2B requires separate sales motion; wait for consumer PMF
- [ ] Session summary export/share — nice social feature; not core to tutoring thesis
- [ ] WhatsApp OTP (replace SMS OTP) — cheaper + more reliable in India; worth revisiting once SMS OTP friction is measured
- [ ] Voice input — hands-free study for commuting students; complex to implement well with Socratic constraints

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Phone OTP auth | HIGH | MEDIUM | P1 |
| NCERT curriculum tree | HIGH | MEDIUM | P1 |
| Socratic engine (no-answer constraint) | HIGH | MEDIUM | P1 |
| Cross-session memory | HIGH | HIGH | P1 |
| Mastery tracking (4 states) | HIGH | MEDIUM | P1 |
| Session continuity | HIGH | MEDIUM | P1 |
| Progress dashboard | HIGH | MEDIUM | P1 |
| Bilingual Hindi/English | HIGH | LOW | P1 |
| Math rendering (KaTeX) | HIGH | MEDIUM | P1 |
| Daily streaks | MEDIUM | LOW | P1 |
| Safety guardrails | HIGH | LOW | P1 |
| Freemium paywall infra | HIGH | MEDIUM | P1 |
| XP + badges | MEDIUM | LOW | P2 |
| Parent dashboard | HIGH | HIGH | P2 |
| Weak-area revisit scheduling | HIGH | HIGH | P2 |
| Adaptive difficulty | HIGH | HIGH | P2 |
| Google sign-in | MEDIUM | LOW | P2 |
| Image/diagram rendering | MEDIUM | MEDIUM | P2 |
| Session export/share | LOW | MEDIUM | P3 |
| ICSE/State board curricula | MEDIUM | HIGH | P3 |
| Teacher/classroom accounts | MEDIUM | HIGH | P3 |
| Voice input | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Doubtnut | Byju's | Khanmigo | GURUji Approach |
|---------|----------|--------|----------|-----------------|
| Teaching method | Camera QnA → instant video solution | Pre-recorded video lectures + quizzes | Socratic dialogue via GPT-4 | Socratic dialogue via Claude; stricter no-answer constraint |
| Session memory | None — stateless | None — no personal tutor | Within-session only | Cross-session memory as core differentiator |
| Curriculum alignment | NCERT-aware (content library) | NCERT/JEE/NEET structured | Khan Academy library (US-focused) | Hardcoded NCERT tree, CBSE-first |
| Language support | Hindi + English | Hindi + English | English-primary | Hindi + English + Hinglish code-switching |
| Gamification | None meaningful | Basic streaks | XP + badges (limited) | Streaks + XP + milestone badges |
| Progress tracking | None | Video completion % | Per-exercise mastery | Per-topic mastery (4 states) |
| Parent dashboard | None | Basic reports | None | Read-only progress for parents |
| Freemium model | Ad-supported free | Hard paywall (premium required) | $9/month (no free tier) | Configurable free tier with soft paywall |
| Math rendering | Images/videos | Images/videos | Basic text | KaTeX in-chat rendering |
| Platform | Android/iOS | Android/iOS/Web | Web | Android/iOS/Web (Expo) |

---

## Sources

- [Khanmigo AI Review 2025 — AI Models Rank](https://www.aimodelsrank.com/reviews/khan-academy-khanmigo)
- [Best AI Tutoring Apps for Kids 2026 — SpellingJoy](https://spellingjoy.com/best-apps/ai-tutoring-apps)
- [Gamification for Learning — BuddyBoss](https://buddyboss.com/blog/gamification-for-learning-to-boost-engagement-with-points-badges-rewards/)
- [Streaks and Milestones for Gamification — Plotline](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps)
- [22 Education App Gamification Examples 2025 — Trophy](https://trophy.so/blog/education-gamification-examples)
- [Top 10 Features of EdTech Apps 2025 — BuzzyBrains](https://www.buzzybrains.com/blog/top-features-of-edtech-apps/)
- [Freemium Model for EdTech — FasterCapital](https://fastercapital.com/content/Freemium-model-for-edtech-apps--Monetizing-Education--A-Deep-Dive-into-Freemium-Strategies.html)
- [AI Tutoring in Schools 2025 — Hunt Institute](https://hunt-institute.org/resources/2025/06/ai-tutoring-alpha-school-personalized-learning-technology-k-12-education/)
- [Socratic AI Tutoring Pitfalls — AI Competence](https://aicompetence.org/ai-socratic-tutors/)
- [Enhancing Critical Thinking via Socratic Chatbot — arXiv](https://arxiv.org/html/2409.05511v1)
- [Indian EdTech Companies — SchoolNet India](https://www.schoolnetindia.com/blog/edtech-companies-top-12-edtech-products-in-india-by-leading-companies-in-2024/)
- [react-native-katex — npm](https://www.npmjs.com/package/react-native-katex)
- [Mobile OTP Verification India 2026 — SpringVerify](https://in.springverify.com/blog/mobile-otp-verification/)

---
*Feature research for: AI Socratic tutoring app (Indian K-12, NCERT/CBSE)*
*Researched: 2026-03-15*
