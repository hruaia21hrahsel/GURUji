# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GURUji is a Socratic AI tutor for Indian students (Class 6-12), aligned to the NCERT curriculum. Students chat with GURUji to get guided help with any subject — the AI never gives answers directly, instead guiding discovery through questions and hints.

## Tech Stack

- **Framework**: Expo SDK 55 (React Native) with Expo Router (file-based routing)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **AI**: Vercel AI SDK (`ai`, `@ai-sdk/anthropic`) + `useChat` hook
- **State**: Zustand with persist middleware (AsyncStorage)
- **Database**: Supabase (lazy/optional — app works without it)
- **Streaming**: `expo/fetch` for native streaming support

## Commands

```bash
npx expo start         # Start dev server
npx expo start --web   # Start web version
npm run android        # Start Android
npm run ios            # Start iOS
```

## Architecture

### App Flow

1. **Onboarding** — 3-step flow (class, board, language) stored in Zustand
2. **Tab Navigator** — Home, Ask GURUji (chat), Settings
3. **Chat** — `useChat` hook streams messages via `/api/chat` API route
4. **API Route** — `app/api/chat+api.ts` proxies to Claude API (keeps key server-side)

### Key Patterns

**Expo Router** — file-based routing in `app/` directory. `(tabs)` for tab navigator, `onboarding/` for onboarding stack.

**NativeWind** — Tailwind classes via `className` prop. Configured in `tailwind.config.js`, `metro.config.js`, `babel.config.js`.

**Zustand stores** — `useAppStore` (profile + onboarding state), `useChatStore` (chat sessions). Both persist to AsyncStorage.

**System prompt** — `lib/system-prompt.ts` embeds the full GURUji persona as a string constant. `buildSystemPrompt(profile)` appends dynamic context (class, board, language, grade-level instructions).

**Supabase client** — lazy singleton in `lib/supabase.ts`. Only initializes when env vars are present.

### Environment Variables

```
# Server-only (never in client bundle)
ANTHROPIC_API_KEY=sk-ant-...

# Client-accessible (optional)
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### Directory Structure

```
app/                     # Expo Router pages
  _layout.tsx            # Root layout (NativeWind, onboarding guard)
  (tabs)/                # Tab navigator
    _layout.tsx          # Tab config (Home, Chat, Settings)
    index.tsx            # Home dashboard
    chat.tsx             # Ask GURUji chat screen
    settings.tsx         # Settings
  onboarding/            # Onboarding stack
    index.tsx            # Select class
    board.tsx            # Select board
    language.tsx         # Select language
  api/
    chat+api.ts          # Claude API proxy (server-side only)
components/
  chat/                  # Chat UI components
lib/                     # Utilities, types, system prompt
store/                   # Zustand stores
```

## Git Workflow

**CRITICAL: After every meaningful unit of work, commit and immediately push to GitHub.**

**Commit format**:
```
<type>: <short summary>

[optional body]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `refactor`, `chore`, `style`

**Rules**:
- One logical change per commit
- Always `git push` immediately after committing
- Never force push to `main` without explicit user confirmation
