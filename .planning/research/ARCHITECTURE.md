# Architecture Research

**Domain:** AI-powered Socratic tutoring app with persistent student memory (Expo/React Native)
**Researched:** 2026-03-15
**Confidence:** HIGH (core ITS architecture is well-established; implementation patterns for this specific stack are MEDIUM)

## Standard Architecture

The Intelligent Tutoring System (ITS) research tradition, developed since the 1980s and now dominant in LLM-based tutoring, defines four canonical components that map cleanly onto GURUji's feature set. Every feature in the project brief falls into one of these four layers.

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Expo / React Native)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────┐  ┌─────────────┐ │
│  │  Chat Screen │  │  Home Dashboard │  │   Progress UI │  │  Settings/  │ │
│  │  (useChat)   │  │  (streak, next  │  │  (per-subject │  │  Onboarding │ │
│  │              │  │   topic, stats) │  │   mastery)    │  │             │ │
│  └──────┬───────┘  └────────┬────────┘  └───────┬───────┘  └──────┬──────┘ │
│         │                  │                   │                  │         │
│  ┌──────┴──────────────────┴───────────────────┴──────────────────┴──────┐  │
│  │              Zustand Stores (in-memory + AsyncStorage)                 │  │
│  │   useAppStore (profile, onboarding)  |  useChatStore (active session) │  │
│  │   useProgressStore (local mastery cache)  |  useGameStore (XP, streak)│  │
│  └──────────────────────────────────┬─────────────────────────────────────┘ │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │ HTTP / Supabase realtime
┌─────────────────────────────────────┼───────────────────────────────────────┐
│                    SERVER (Expo API Routes / Edge Functions)                 │
├─────────────────────────────────────┼───────────────────────────────────────┤
│                                     │                                        │
│  ┌──────────────────────────────────▼────────────────────────────────────┐  │
│  │                    TUTOR MODEL  (app/api/chat+api.ts)                  │  │
│  │  Pedagogical engine — decides: ask question? give hint? check mastery?│  │
│  │  Context assembly: system prompt + student profile + session memory   │  │
│  │  Calls Claude API via Vercel AI SDK streamText()                       │  │
│  └──────────┬──────────────────────────────────┬─────────────────────────┘  │
│             │                                  │                             │
│  ┌──────────▼──────────┐           ┌───────────▼──────────────────────────┐ │
│  │   DOMAIN MODEL       │           │          STUDENT MODEL               │ │
│  │   (lib/curriculum.ts)│           │     (Supabase: student_memory table) │ │
│  │                      │           │                                      │ │
│  │  Static JSON tree:   │           │  Per-student, per-topic rows:        │ │
│  │  Class→Subject→      │           │  mastery_level, weak_areas,          │ │
│  │  Chapter→Topic       │           │  teaching_style_pref, interests,     │ │
│  │                      │           │  last_session_summary, pace          │ │
│  │  Prerequisite edges  │           │                                      │ │
│  │  between topics      │           │  Session summaries (LLM-generated)   │ │
│  └──────────────────────┘           └──────────────────────────────────────┘ │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────┼───────────────────────────────────────┐
│                           SUPABASE (Postgres + Auth)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  profiles | student_memory | topic_mastery | chat_sessions | chat_messages  │
│  gamification | badges | parent_links | usage_limits                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **Tutor Model** (`app/api/chat+api.ts`) | Assembles context, calls Claude, enforces Socratic constraints. The only place that touches the Claude API. | Domain Model (reads curriculum), Student Model (reads/writes memory), Supabase (persists messages) |
| **Domain Model** (`lib/curriculum.ts`) | Authoritative curriculum tree: Class 6-12, all NCERT subjects, chapters, topics, prerequisites. Pure static data — no I/O. | Read-only by Tutor Model and Progress UI |
| **Student Model** (Supabase `student_memory` + `topic_mastery`) | Persistent per-student state: mastery levels, weak areas, learning pace, teaching style preference, interests, session summaries. | Written by Tutor Model post-session; read by Tutor Model at session start |
| **Interface Layer** (Chat screen, Home, Progress UI) | Renders streaming responses, shows mastery progress, triggers topic navigation, displays gamification. | Zustand stores (local cache of Student Model data) |
| **Auth Layer** (Supabase Auth) | Phone OTP, Google sign-in, session tokens. Separate parent accounts linked to student via `parent_links` table. | All Supabase table access (Row Level Security enforces ownership) |
| **Gamification Engine** (`lib/gamification.ts` + Supabase) | Computes XP awards, streak updates, badge unlocks. Called post-session by Tutor Model. | Student Model writes; Interface Layer reads |
| **Usage Limits** (`lib/usage.ts`) | Freemium enforcement — counts messages/sessions against free tier quotas. | Checked in Tutor Model before each Claude API call |

## Recommended Project Structure

```
app/
├── api/
│   ├── chat+api.ts          # Tutor Model: context assembly + Claude streaming
│   ├── session-end+api.ts   # Post-session: save summary, update mastery, award XP
│   └── progress+api.ts      # Serve student mastery data for dashboard
├── (tabs)/
│   ├── index.tsx            # Home: "continue where you left off", subject grid
│   ├── chat.tsx             # Active chat (delegates to chat/[sessionId])
│   ├── progress.tsx         # Progress dashboard: mastery per subject
│   └── settings.tsx
├── chat/
│   └── [sessionId].tsx      # Individual session screen with useChat
├── onboarding/
│   ├── index.tsx            # Class selection
│   ├── board.tsx            # Board selection
│   └── language.tsx         # Language selection
├── auth/
│   ├── index.tsx            # Phone OTP entry
│   ├── verify.tsx           # OTP verification
│   └── parent.tsx           # Parent account login/link
└── subject/
    └── [subjectId].tsx      # Subject detail: chapters, topic picker

lib/
├── curriculum.ts            # Domain Model: static NCERT tree (Class→Subject→Chapter→Topic)
├── curriculum-data/
│   ├── class6.ts            # Per-class curriculum definitions
│   ├── class7.ts
│   └── ...class12.ts
├── system-prompt.ts         # GURUji persona (existing) — extended with student memory injection
├── memory.ts                # Student Model helpers: fetch, summarize, update
├── gamification.ts          # XP formulas, streak logic, badge rules
├── usage.ts                 # Freemium quota checks
└── supabase.ts              # Supabase client singleton (existing)

store/
├── app-store.ts             # Profile + onboarding (existing)
├── chat-store.ts            # Active session messages (existing)
├── progress-store.ts        # Local cache of topic_mastery rows
└── game-store.ts            # Local cache of XP, streak, badges

components/
├── chat/                    # Chat UI (existing — extend for math rendering)
├── curriculum/
│   ├── SubjectGrid.tsx      # Subject selection cards
│   ├── ChapterList.tsx      # Chapter navigation
│   └── TopicPicker.tsx      # Topic entry point for a session
├── progress/
│   ├── MasteryBar.tsx       # Per-topic mastery indicator
│   └── SubjectProgress.tsx  # Subject-level completion wheel
└── gamification/
    ├── StreakCounter.tsx
    ├── XPBadge.tsx
    └── AchievementToast.tsx

supabase/
└── migrations/
    ├── 001_profiles.sql
    ├── 002_curriculum_mastery.sql
    ├── 003_chat_sessions.sql
    ├── 004_gamification.sql
    └── 005_parent_links.sql
```

### Structure Rationale

- **`app/api/` routes** keep all Claude API calls server-side (API key never in client bundle). `chat+api.ts` stays the single entry point for teaching; `session-end+api.ts` handles post-session writes separately so it's not blocking the stream.
- **`lib/curriculum-data/`** splits per class to keep each file manageable (~50-100 topics per class). Imported at build time — zero runtime I/O.
- **`store/` split by domain** — progress and gamification caches are separate from the existing app/chat stores so they can be cleared/re-synced independently without touching chat history.
- **`supabase/migrations/`** keeps schema changes version-controlled alongside the app.

## Architectural Patterns

### Pattern 1: Memory-Augmented System Prompt

**What:** At the start of each chat session, fetch the student's memory record from Supabase and inject a compressed summary into the system prompt. Claude then behaves as if it genuinely remembers the student.

**When to use:** Every session. This is the core mechanism that differentiates GURUji from a generic chatbot.

**Trade-offs:** Adds ~200-400 tokens to every request (negligible against Claude's 200K context). Risk: if the student record grows unbounded, injection becomes expensive — mitigate with session summarization (see Pattern 2).

**Example:**
```typescript
// lib/memory.ts
export async function buildMemoryBlock(studentId: string): Promise<string> {
  const memory = await supabase
    .from('student_memory')
    .select('*')
    .eq('student_id', studentId)
    .single();

  return `
## Student Memory
- Name: ${memory.display_name}, Class ${memory.class_level}
- Pace: ${memory.learning_pace} (fast/average/slow per subject)
- Teaching style preference: ${memory.style_pref}
- Interests: ${memory.interests.join(', ')}
- Weak areas: ${memory.weak_topics.slice(0, 5).join(', ')}
- Last session: ${memory.last_session_summary}
- Current topic: ${memory.current_topic_id}
`.trim();
}

// app/api/chat+api.ts
const memoryBlock = await buildMemoryBlock(studentId);
const systemPrompt = buildSystemPrompt(profile, memoryBlock);
```

### Pattern 2: End-of-Session Memory Update

**What:** After each conversation ends (user closes chat or hits a natural breakpoint), call an LLM to summarize the session and write updates to the Student Model. This keeps the injected memory compact while preserving continuity.

**When to use:** Every session end. Do it asynchronously — don't block the user.

**Trade-offs:** Costs one extra Claude call per session (~1K tokens). Worth it: without this, memory either grows unbounded (expensive) or gets stale (no learning). Use a cheap/fast model (e.g., claude-haiku) for summarization.

**Example:**
```typescript
// app/api/session-end+api.ts
export async function POST(req: Request) {
  const { sessionId, studentId, messages } = await req.json();

  // 1. LLM summarizes what happened this session
  const summary = await generateText({
    model: anthropic('claude-haiku-4-5'),
    prompt: buildSessionSummaryPrompt(messages),
  });

  // 2. Extract mastery updates from summary
  const masteryUpdates = parseMasteryFromSummary(summary.text);

  // 3. Write to Supabase in parallel
  await Promise.all([
    supabase.from('student_memory').update({
      last_session_summary: summary.text,
      weak_topics: updatedWeakTopics,
    }).eq('student_id', studentId),
    supabase.from('topic_mastery').upsert(masteryUpdates),
    supabase.from('gamification').rpc('award_session_xp', { student_id: studentId }),
  ]);
}
```

### Pattern 3: Curriculum as Static Typed Tree

**What:** Represent the entire NCERT curriculum as a TypeScript object tree — not a database table, not an API call. Import it at build time.

**When to use:** For GURUji v1 covering one board (CBSE/NCERT) with a fixed syllabus. The curriculum doesn't change at runtime.

**Trade-offs:** Fast (zero network calls), type-safe, can be tree-shaken. Downside: adding a new board requires a code change and redeploy. Acceptable for v1; migrate to DB when adding ICSE/State boards.

**Example:**
```typescript
// lib/curriculum.ts
export type MasteryLevel = 'not_started' | 'learning' | 'understood' | 'mastered';

export interface Topic {
  id: string;          // e.g. "c8_science_ch2_t1"
  title: string;
  prerequisites: string[];  // topic IDs
  estimatedMinutes: number;
}

export interface Chapter {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface ClassLevel {
  class: 6 | 7 | 8 | 9 | 10 | 11 | 12;
  subjects: Subject[];
}

export const NCERT_CURRICULUM: ClassLevel[] = [...]; // populated in curriculum-data/
```

### Pattern 4: Socratic Constraint via System Prompt Guardrails

**What:** The Socratic behavior is enforced entirely through the system prompt — not through code logic or a separate agent. The prompt defines: never give the answer directly, always ask a guiding question first, simplify and backtrack when the student is stuck, use Indian cultural examples.

**When to use:** Always. This is the right level of abstraction for this problem — trying to enforce Socratic behavior through code branching is over-engineering.

**Trade-offs:** Relies on Claude following instructions reliably (HIGH confidence — Claude Sonnet follows detailed system prompt instructions well). Easier to tune than code logic. Risk: Claude may occasionally slip and give direct answers — mitigate with a post-response check or stronger negative examples in the prompt.

**Example:**
```typescript
// lib/system-prompt.ts (addition to existing)
const SOCRATIC_RULES = `
## Teaching Rules (NEVER break these)
1. NEVER give the answer directly. Always guide with a question.
2. If the student is stuck after 2 attempts, give a targeted hint — not the answer.
3. If stuck after 3 attempts, backtrack to a simpler prerequisite concept.
4. Before moving to the next topic, ask one check question to verify understanding.
5. Use examples from: cricket, chai, Bollywood, Indian festivals, everyday Indian life.
6. Teaching in ${language}: respond entirely in ${language === 'hindi' ? 'Hindi' : 'English'}.
`.trim();
```

## Data Flow

### Session Start Flow

```
Student opens chat (selects topic from curriculum)
    ↓
chat/[sessionId].tsx → useChat initializes with sessionId + topicId
    ↓
First message sent → app/api/chat+api.ts
    ↓
  [1] Fetch student_memory from Supabase (student profile + last session summary)
  [2] Look up topic in NCERT_CURRICULUM (static — no I/O)
  [3] Check usage_limits (free tier quota)
    ↓
  Assemble system prompt:
    GURUji persona
    + student memory block (who this student is, where they left off)
    + current topic context (chapter, prerequisites)
    + Socratic rules
    ↓
  streamText({ model: claude-sonnet, system, messages })
    ↓
  toUIMessageStreamResponse() → streamed to client
    ↓
Chat screen renders streaming tokens via useChat
```

### Session End Flow

```
User closes chat / natural session end
    ↓
chat-store triggers onSessionEnd(sessionId, messages)
    ↓
POST /api/session-end (fire-and-forget, non-blocking)
    ↓
  [1] LLM summarizes session (claude-haiku: cheap, fast)
  [2] Parse: what topics covered? mastery signals? struggles?
  [3] Supabase writes (parallel):
      - student_memory.last_session_summary = summary
      - topic_mastery UPSERT (new mastery levels)
      - gamification RPC: award XP, check streak, unlock badges
      - chat_messages bulk insert (UIMessage[] → Supabase rows)
    ↓
Client: Zustand progress-store and game-store refreshed
    ↓
Home screen shows updated streak, XP, "continue where you left off"
```

### Parent Dashboard Flow

```
Parent logs in (separate Supabase auth user)
    ↓
parent_links table: parent_id → [student_id_1, student_id_2]
    ↓
GET /api/progress?studentId=X (parent's token + RLS policy verifies link)
    ↓
Returns: topic_mastery rows + session history summaries
    ↓
Parent dashboard renders subject-wise progress view (read-only)
```

### State Management

```
Supabase (source of truth, server-side)
    ↓ (on app load / after session end)
Zustand stores (client-side cache)
    ↓ (subscribe)
React components ← dispatch actions → Zustand
    ↑
    └── On Supabase write: invalidate + re-fetch relevant store slice
```

The rule: **Zustand stores are caches, Supabase is the database.** Never treat local Zustand state as authoritative for anything that must survive device changes. On cross-device sync, re-hydrate stores from Supabase on auth.

## Supabase Schema (Core Tables)

```sql
-- Student profile (extends Supabase auth.users)
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  display_name text,
  class_level int,           -- 6-12
  board text DEFAULT 'cbse',
  language text DEFAULT 'english',
  created_at timestamptz
)

-- Student Model: the memory that makes GURUji feel like it remembers
student_memory (
  id uuid PRIMARY KEY,
  student_id uuid REFERENCES profiles,
  learning_pace jsonb,        -- { math: 'fast', science: 'slow', ... }
  style_pref text,            -- 'examples' | 'analogies' | 'step-by-step'
  interests text[],           -- ['cricket', 'gaming', ...]
  weak_topics text[],         -- topic IDs that need revisiting
  current_topic_id text,      -- last active topic
  last_session_summary text,  -- LLM-generated summary, ~200 words
  updated_at timestamptz
)

-- Per-topic mastery: the knowledge state
topic_mastery (
  id uuid PRIMARY KEY,
  student_id uuid REFERENCES profiles,
  topic_id text,              -- matches NCERT_CURRICULUM topic.id
  mastery_level text,         -- 'not_started' | 'learning' | 'understood' | 'mastered'
  attempt_count int DEFAULT 0,
  last_practiced_at timestamptz,
  UNIQUE(student_id, topic_id)
)

-- Chat sessions
chat_sessions (
  id uuid PRIMARY KEY,
  student_id uuid REFERENCES profiles,
  topic_id text,
  started_at timestamptz,
  ended_at timestamptz,
  message_count int
)

-- Chat messages (UIMessage parts format)
chat_messages (
  id uuid PRIMARY KEY,        -- UIMessage.id
  session_id uuid REFERENCES chat_sessions,
  role text,                  -- 'user' | 'assistant'
  parts jsonb,                -- UIMessage.parts[]
  created_at timestamptz
)

-- Gamification
gamification (
  student_id uuid PRIMARY KEY REFERENCES profiles,
  xp_total int DEFAULT 0,
  current_streak_days int DEFAULT 0,
  longest_streak_days int DEFAULT 0,
  last_study_date date,
  level int GENERATED ALWAYS AS (floor(sqrt(xp_total / 50.0))::int) STORED
)

xp_transactions (
  id uuid PRIMARY KEY,
  student_id uuid REFERENCES profiles,
  amount int,
  reason text,               -- 'topic_completed' | 'check_correct' | 'streak_bonus'
  created_at timestamptz
)

badges (
  student_id uuid REFERENCES profiles,
  badge_id text,
  earned_at timestamptz,
  PRIMARY KEY (student_id, badge_id)
)

-- Parent linking
parent_links (
  parent_id uuid REFERENCES auth.users,
  student_id uuid REFERENCES profiles,
  confirmed_at timestamptz,
  PRIMARY KEY (parent_id, student_id)
)

-- Freemium usage tracking
usage_limits (
  student_id uuid PRIMARY KEY REFERENCES profiles,
  messages_today int DEFAULT 0,
  sessions_this_month int DEFAULT 0,
  is_paid boolean DEFAULT false,
  reset_date date
)
```

## Build Order (Phase Dependencies)

The components have hard dependencies that dictate build order:

```
Phase 1: Foundation (no dependencies)
  └── Auth (Supabase Auth, profiles table, phone OTP)
      └── Required by: everything that needs studentId

Phase 2: Domain Model (no runtime dependencies)
  └── NCERT curriculum static tree (lib/curriculum-data/)
      └── Required by: Tutor Model context, Progress UI, topic navigation

Phase 3: Student Model (depends on: Auth)
  └── student_memory + topic_mastery tables
  └── Memory fetch/write helpers (lib/memory.ts)
      └── Required by: Tutor Model, Progress UI, Home screen

Phase 4: Tutor Model enhancement (depends on: Auth + Student Model + Domain Model)
  └── Extend app/api/chat+api.ts with memory injection
  └── Session-end API (summarization + mastery update)
  └── Socratic system prompt rules
      └── Required by: quality Socratic teaching

Phase 5: Progress UI (depends on: Student Model)
  └── Progress store, mastery bars, subject completion views
      └── Required by: Home screen "continue" feature

Phase 6: Gamification (depends on: Auth + Student Model)
  └── XP, streaks, badges (can be bolted on after core teaching works)

Phase 7: Parent Dashboard (depends on: Auth + Progress UI)
  └── Separate parent auth flow + read-only linked-account views

Phase 8: Freemium (depends on: Auth)
  └── Usage limits table + quota checks in Tutor Model
```

**Key insight:** The Tutor Model (Phase 4) depends on all foundational data models being in place first. Don't try to build personalization before the schema and memory helpers exist — it leads to retrofitting.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1K students | Single Supabase project, one API route handles all. Current architecture is fine. |
| 1K-50K students | Supabase free tier exhausted — upgrade to Pro. Cache student_memory in Redis (Upstash) to avoid Supabase reads on every message. Add rate limiting in `usage.ts`. |
| 50K+ students | Move session-end processing to Supabase Edge Functions (async, not blocking the client). Consider read replicas for progress dashboard queries. Claude API costs dominate — tighten freemium limits. |

### First Bottleneck

**Claude API cost, not infrastructure.** At 10K daily active students sending 20 messages each, at ~1,500 tokens/request, that's ~300M tokens/day. Claude Sonnet at $3/M input tokens = ~$900/day. Free tier must be tight (8-10 messages/day matches SocraticAI's real deployment). This is not a scaling problem — it's a freemium design problem that must be addressed from Phase 1.

### Second Bottleneck

**Supabase reads per message.** Every Claude API call fetches `student_memory`. At scale, this becomes a bottleneck. Fix: cache the memory record in Zustand (on session start, fetch once) and only write back at session end. Already implied by the architecture above.

## Anti-Patterns

### Anti-Pattern 1: Storing Full Chat History in System Prompt

**What people do:** Append the full previous conversation (all past sessions) to the system prompt for "memory."

**Why it's wrong:** Exponential token cost growth. A student with 50 sessions would inject 50,000+ tokens into every new request. Context quality also degrades with length (Context Rot research shows performance drops in middle of long contexts).

**Do this instead:** Use Pattern 2 — LLM-generated session summary (~200 words). Inject only the summary, not raw messages. Raw messages stay in the database for parent dashboard display but never go into the Claude context.

### Anti-Pattern 2: Mastery Tracking by Message Count

**What people do:** Mark a topic as "mastered" after N messages or after the student says "I understand."

**Why it's wrong:** Students lie ("I get it" to move on). Self-report is unreliable. Message count is meaningless.

**Do this instead:** Mastery is inferred by the Tutor Model from responses to check questions. The session-end summarization prompt explicitly asks: "Did the student demonstrate understanding of [topic] by correctly answering check questions? Rate as learning/understood/mastered." This inference from behavior, not self-report, is standard in ITS literature.

### Anti-Pattern 3: Curriculum as a Database Table

**What people do:** Store NCERT curriculum structure in Supabase and query it at runtime.

**Why it's wrong:** The CBSE/NCERT curriculum for v1 is static and known at build time. Adding database round-trips for curriculum lookups adds latency on every session start with zero benefit. The curriculum won't change at runtime.

**Do this instead:** Static TypeScript tree (Pattern 3). Fast, type-safe, zero latency. Migrate to DB only when adding multiple boards with dynamic curriculum differences.

### Anti-Pattern 4: Parent Dashboard with Shared Student Login

**What people do:** Give parents the student's password so they can check progress.

**Why it's wrong:** Students stop being honest with the tutor. Privacy violation. No audit trail. If parent resets progress "for motivation," it corrupts Student Model.

**Do this instead:** Separate `parent_links` table. Parents have their own auth.users entry. Row Level Security (RLS) policies on `topic_mastery` allow parent reads only for linked students. Student's actual auth account is never shared.

### Anti-Pattern 5: Blocking Session-End Processing

**What people do:** Run session summarization and mastery updates synchronously before the chat screen closes.

**Why it's wrong:** LLM summarization takes 2-5 seconds. Blocking the UI on this makes the app feel slow and wastes it if the user force-quits.

**Do this instead:** Fire-and-forget POST to `/api/session-end`. Use React Native's `AppState` listener to trigger it when the app backgrounds. If the call fails, retry on next app open by checking for sessions without summaries.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Anthropic Claude | Vercel AI SDK `streamText()` + `toUIMessageStreamResponse()` — already wired | Use `claude-sonnet-4-5` for teaching, `claude-haiku-4-5` for session summarization (cost) |
| Supabase Auth | `@supabase/supabase-js` client with `expo-secure-store` for token storage | Phone OTP via Supabase Auth built-in SMS provider (Twilio underneath) |
| Supabase DB | Direct client queries from API routes (server-side) + client queries for read-only progress data | Use RLS on all tables — never expose admin key to client |
| KaTeX / math rendering | `react-native-katex` or `react-native-math-view` for inline LaTeX in chat messages | Requires native module — EAS build required, not Expo Go |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Chat screen ↔ Tutor Model API | HTTP streaming via `useChat` DefaultChatTransport | Already working — extend system prompt only |
| Tutor Model ↔ Student Model | Direct Supabase client call (server-side API route) | Fetch on session start, write on session end |
| Tutor Model ↔ Domain Model | Direct TypeScript import (no I/O) | Static — no async, no network |
| Client ↔ Progress data | Supabase client (from Zustand store hydration) | Re-hydrate on auth; local cache for fast UI |
| Session-end API ↔ Gamification | Supabase RPC function or direct upsert | Atomic: XP award and mastery update in same transaction |

## Sources

- ITS Four-Component Architecture: [Intelligent tutoring system — Wikipedia](https://en.wikipedia.org/wiki/Intelligent_tutoring_system); [ITS Architecture and Characteristics — Academia](https://www.academia.edu/7891885/Intelligent_Tutoring_Systems_Architecture_and_Characteristics)
- Comprehensive ITS Review 2025: [arxiv.org/html/2507.18882v1](https://arxiv.org/html/2507.18882v1)
- SocraticAI (scaffolded LLM tutor): [arxiv.org/abs/2512.03501](https://arxiv.org/abs/2512.03501); [arxiv.org/html/2512.03501v1](https://arxiv.org/html/2512.03501v1)
- SocraticLM multi-agent teaching: [OpenReview — SocraticLM](https://openreview.net/forum?id=qkoZgJhxsA)
- Persistent memory for LLM agents: [Let's Data Science — AI Agent Memory](https://www.letsdatascience.com/blog/ai-agent-memory-architecture)
- Session summarization pattern: [Mem0 — LLM Chat History Summarization Guide](https://mem0.ai/blog/llm-chat-history-summarization-guide-2025)
- MemGPT context management: [Information Matters — MemGPT](https://informationmatters.org/2025/10/memgpt-engineering-semantic-memory-through-adaptive-retention-and-context-summarization/)
- Context personalization with system prompts: [OpenAI Cookbook — Context Personalization](https://developers.openai.com/cookbook/examples/agents_sdk/context_personalization/)
- Context window management: [Context Window Management at Scale](https://thread-transfer.com/blog/2025-07-11-context-window-at-scale/); [Claude context windows docs](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- Vercel AI SDK persistence pattern: [GitHub Discussion #4845](https://github.com/vercel/ai/discussions/4845)
- Knowledge tracing survey: [ACM — Knowledge Tracing: A Survey](https://dl.acm.org/doi/10.1145/3569576)
- Gamification schema: [Playbooks — gamification-xp skill](https://playbooks.com/skills/openclaw/skills/gamification-xp)
- Parent dashboard patterns: [TutorLMS Parent Access](https://wooninjas.com/downloads/tutorlms-parent-and-student-access/)
- Supabase + Expo integration: [Supabase Expo quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native)

---
*Architecture research for: AI Socratic tutoring app (GURUji) — Expo/React Native + Claude + Supabase*
*Researched: 2026-03-15*
