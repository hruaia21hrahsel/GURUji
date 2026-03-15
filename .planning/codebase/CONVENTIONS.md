# Coding Conventions

**Analysis Date:** 2026-03-15

## Naming Patterns

**Files:**
- React/TSX components: PascalCase (e.g., `ChatScreen.tsx`, `UserProfile.tsx`)
- Utilities and helpers: camelCase (e.g., `buildSystemPrompt.ts`, `fetchMessages.ts`)
- Stores: descriptive camelCase with "store" suffix (e.g., `appStore.ts`, `chatStore.ts`)
- API routes: route structure matches Expo Router pattern with `+api` suffix (e.g., `chat+api.ts`)
- Type definition files: match the feature they describe (e.g., `types.ts` or inline in component files)

**Functions:**
- camelCase for all functions and methods
- Action functions use verb prefix pattern (e.g., `buildSystemPrompt()`, `fetchChat()`, `saveSession()`)
- Zustand store hooks use `use` prefix convention (e.g., `useAppStore()`, `useChatStore()`)

**Variables:**
- camelCase for constants and variables
- Boolean variables may use `is` or `has` prefix for clarity (e.g., `isLoading`, `hasError`)
- Exported constants uppercase with underscores only if they are true constants (rare in this codebase)

**Types:**
- PascalCase for all TypeScript types and interfaces (e.g., `ChatMessage`, `StudentProfile`)
- Component prop types use `[ComponentName]Props` pattern (e.g., `ChatScreenProps`, `UserProfileProps`)
- Zustand store state uses descriptive PascalCase names

## Code Style

**Formatting:**
- Prettier configured implicitly through Expo defaults
- 2-space indentation (Expo standard)
- Semicolons required at end of statements
- Single quotes preferred (Expo convention)

**Linting:**
- ESLint configuration: Not explicitly configured yet (Expo defaults applied)
- TypeScript strict mode enabled in `tsconfig.json` with `"strict": true`
- Path aliases configured: `@/*` maps to project root for absolute imports

**Import Organization:**
- External dependencies first (React, React Native, Expo)
- AI SDK imports (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`)
- UI/Component libraries (NativeWind, icons)
- Internal utilities and types
- Relative imports for same-directory files at end

**Order example:**
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useChat } from '@ai-sdk/react';
import { useAppStore } from '@/store/appStore';
import { buildSystemPrompt } from '@/lib/system-prompt';
import ChatInput from './ChatInput';
```

**Path Aliases:**
- Use `@/` prefix for absolute imports from project root
- Examples: `@/store/appStore`, `@/lib/system-prompt`, `@/components/chat/ChatInput`

## Error Handling

**Patterns:**
- Try-catch blocks used for async operations (API calls, Supabase operations)
- Error logging uses `console.error()` with descriptive context
- User-facing errors wrapped in simple string messages for UI display
- No error objects exposed to UI layer — sanitized messages only

**Example pattern:**
```typescript
try {
  const response = await fetch('/api/chat', { /* ... */ });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
} catch (error) {
  console.error('Chat API error:', error);
  throw new Error('Failed to send message. Please try again.');
}
```

## Logging

**Framework:** `console` object (no external logging library)

**Patterns:**
- `console.log()` for informational messages (component mount/unmount in dev)
- `console.error()` for errors and exceptions
- `console.warn()` for deprecation warnings (rare)
- Logs include context prefix for debugging (e.g., `[Chat] Starting stream`, `[SystemPrompt] Building`)
- No logging in production except critical errors (check `__DEV__` or environment)

## Comments

**When to Comment:**
- Explain *why*, not *what* — code should be self-documenting
- Complex Zustand selector logic warrants a comment
- Non-obvious Expo Router conventions (e.g., `+api` suffix, `_layout.tsx` purpose)
- Business logic related to NCERT curriculum or Socratic pedagogy
- Workarounds or temporary solutions (always mark with TODO)

**JSDoc/TSDoc:**
- Used sparingly for public API functions in `lib/` and `store/`
- Component props documented inline near the type definition if needed
- Example:
```typescript
/**
 * Build the GURUji system prompt with grade-level context
 * @param profile Student profile (class, board, language)
 * @returns Complete system prompt string for Claude API
 */
export function buildSystemPrompt(profile: StudentProfile): string {
  // ...
}
```

## Function Design

**Size:**
- Keep component bodies under 100 lines (extract hooks and render logic)
- Utility functions under 50 lines preferred
- Break complex data transformations into separate helpers

**Parameters:**
- Maximum 3 positional parameters; use object destructuring for > 3
- Object parameters always destructured in function signature
- Avoid boolean flags; use enum or object with explicit keys instead

**Return Values:**
- Explicit return types on all functions
- No implicit `any` or `void` without good reason
- Async functions always return `Promise<T>`

## Module Design

**Exports:**
- Default export for single component per file (e.g., `export default ChatScreen`)
- Named exports for utilities, stores, and multiple helpers
- Each file should have one primary responsibility

**Barrel Files:**
- `index.ts` files used in `components/chat/`, `store/`, `lib/` to group related exports
- Example: `components/chat/index.ts` exports all chat-related components
- Avoid nested barrel files (max 1 level deep)

## Component Patterns

**Functional Components Only:**
- All components written as function expressions with explicit return type
- Use TypeScript for prop typing
- Hook-based state management (Zustand for global, React hooks for local)

**Example structure:**
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useAppStore } from '@/store/appStore';

type ChatScreenProps = {
  title: string;
  onClose?: () => void;
};

export default function ChatScreen({ title, onClose }: ChatScreenProps): React.ReactElement {
  const userClass = useAppStore((state) => state.studentProfile.class);

  return (
    <View className="flex-1 bg-background">
      <Text className="text-2xl font-bold text-text-primary">{title}</Text>
    </View>
  );
}
```

## NativeWind Styling

**Tailwind Classes:**
- Use `className` prop on all components (not `style` prop)
- Follow Tailwind naming: `flex`, `flex-1`, `bg-primary`, `text-text-secondary`
- Custom colors defined in `tailwind.config.js`: `primary`, `secondary`, `background`, `surface`, `text-primary`, `text-secondary`
- Responsive classes (prefixes like `md:`, `lg:`) work on web but limited on native
- Prefer layout with flexbox (`flex`, `flex-col`, `justify-center`, etc.)

## AI SDK v6 Patterns

**useChat Hook Usage:**
- Hook returns `{ messages, sendMessage, status }` (not `append`, `isLoading`, `handleSubmit`)
- Status values: `"submitted" | "streaming" | "ready" | "error"`
- Send messages with `sendMessage({ text })`
- Messages array contains `UIMessage[]` objects with `parts[]` array (not `content`)
- Each part has `type` and `text` properties

**API Route Pattern:**
- Use `streamText()` from `ai` package for streaming responses
- Always call `result.toUIMessageStreamResponse()` to convert to client format
- Never expose API keys in client code; keep `ANTHROPIC_API_KEY` server-only
- Example:
```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const result = await streamText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  system: systemPrompt,
  messages: messages,
});

return result.toUIMessageStreamResponse();
```

## Zustand Store Patterns

**Store Definition:**
- Stores in `store/` directory with descriptive names
- Use `create<T>()` with generic type for full type safety
- Include persist middleware for AsyncStorage integration
- Selector pattern for accessing nested state: `useStore((state) => state.nested.value)`

**Example:**
```typescript
import { create } from 'zustand';
import { persist, AsyncStorage } from 'zustand/middleware';

type AppStoreState = {
  studentProfile: StudentProfile;
  updateProfile: (profile: Partial<StudentProfile>) => void;
};

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      studentProfile: { class: 6, board: 'CBSE', language: 'en' },
      updateProfile: (profile) =>
        set((state) => ({
          studentProfile: { ...state.studentProfile, ...profile },
        })),
    }),
    {
      name: 'app-store',
      storage: AsyncStorage,
    }
  )
);
```

---

*Convention analysis: 2026-03-15*
