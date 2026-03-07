# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GURUji is an AI-powered NCERT lesson explainer for Indian students (Class 6–12). Students scan a textbook page, and the app generates an animated, narrated lesson using Claude AI and TTS.

## Tech Stack

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: Zustand
- **Backend**: Supabase (auth, DB, storage)
- **PWA**: next-pwa
- **AI**: Claude API (lesson generation), ElevenLabs or Google TTS (audio)

## Commands

```bash
npm run dev       # Start dev server → localhost:3000
npm run build     # Production build
npm run lint      # ESLint
```

## Architecture

### App Flow

1. **Onboarding** — 3-step flow (class, subject, language preferences) stored in Zustand
2. **PageScanner** — camera capture / image upload / manual text input → `/api/identify-page`
3. **Lesson Generation** — identified page → `/api/generate-lesson` → animated lesson JSON
4. **LessonPlayer** — renders lesson using a canvas-based TimelineEngine driven by a RAF loop
5. **Audio** — `/api/lesson-audio/[id]` serves TTS audio synced to the timeline

### Key Architectural Patterns

**Supabase client** is a lazy singleton Proxy — only initializes when env vars are present. The app works fully without Supabase configured (all phases use mock APIs during development).

**Canvas coordinate system** — all visual positions are stored as 0–1 fractions of canvas dimensions. Scale to pixels with `x * canvasWidth`, `y * canvasHeight`. Font sizes use `fontSize * (cw / 800)` for responsive scaling.

**Lesson JSON format**:
- `segments[].visuals[].timestamp` — ms when visual starts (absolute from lesson start)
- `segments[].visuals[].duration` — ms for the animation to complete
- `progress = (currentMs - timestamp) / duration` drives all animations 0→1

**TimelineEngine** — RAF loop that computes current progress for each visual and calls the appropriate canvas draw function. All animation functions are pure: `(ctx, progress, params) => void`.

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY
ELEVENLABS_API_KEY   # or Google TTS credentials
```

## Git Workflow

Commit and push after every meaningful unit of work.

**Format**:
```
<type>: <short summary>

[optional body — why, not what]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `refactor`, `chore`, `style`

Rules:
- One logical change per commit — never batch unrelated changes
- Always `git push` immediately after committing
- Never force push to `main` without explicit user confirmation
