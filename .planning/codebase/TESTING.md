# Testing Patterns

**Analysis Date:** 2026-03-15

## Test Framework

**Current Status:** Not yet implemented

**Recommended Runner:**
- Jest with React Native preset (for unit and integration tests)
- Detox or Expo test library for E2E testing
- Vitest as alternative for faster unit tests

**Assertion Library:**
- Jest's built-in matchers (no additional library needed)

**Run Commands (when implemented):**
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
npx expo test              # Expo-integrated testing (alternative)
```

## Test File Organization

**Location:**
- Co-located with source files preferred
- Pattern: Feature file at `src/Feature.tsx`, tests at `src/Feature.test.tsx`
- Alternatively: Dedicated `__tests__/` directory parallel to source

**Naming:**
- `[component].test.ts` for unit tests
- `[component].spec.ts` for integration tests
- `[feature].e2e.test.ts` for end-to-end tests

**Structure:**
```
app/
├── (tabs)/
│   ├── chat.tsx
│   ├── chat.test.tsx         # Tests for chat screen
│   └── chat.spec.tsx         # Integration tests
store/
├── appStore.ts
└── appStore.test.ts          # Tests for Zustand store
lib/
├── system-prompt.ts
└── system-prompt.test.ts     # Tests for system prompt builder
```

## Test Structure

**Suite Organization:**

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { buildSystemPrompt } from '@/lib/system-prompt';

describe('buildSystemPrompt', () => {
  describe('with CBSE board', () => {
    it('should include CBSE-specific curriculum references', () => {
      const prompt = buildSystemPrompt({
        class: 10,
        board: 'CBSE',
        language: 'en',
      });
      expect(prompt).toContain('CBSE');
      expect(prompt).toContain('Class 10');
    });

    it('should include grade-level specific language', () => {
      const prompt = buildSystemPrompt({
        class: 9,
        board: 'CBSE',
        language: 'en',
      });
      expect(prompt).toContain('board exam');
    });
  });

  describe('language support', () => {
    it('should support English prompts', () => {
      const prompt = buildSystemPrompt({
        class: 6,
        board: 'ICSE',
        language: 'en',
      });
      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should support Hindi prompts', () => {
      const prompt = buildSystemPrompt({
        class: 6,
        board: 'ICSE',
        language: 'hi',
      });
      expect(prompt).toBeDefined();
    });
  });
});
```

**Patterns:**
- Use `describe()` to group related tests by feature or component
- Use `it()` for individual test cases with clear, descriptive names
- `beforeEach()` for setup common to multiple tests
- `afterEach()` for cleanup (e.g., clearing mocks, AsyncStorage)

## Mocking

**Framework:** Jest's built-in mocking system

**Patterns:**

Mocking Zustand stores:
```typescript
import { useAppStore } from '@/store/appStore';

jest.mock('@/store/appStore', () => ({
  useAppStore: jest.fn(),
}));

const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

describe('ChatScreen', () => {
  beforeEach(() => {
    mockUseAppStore.mockReturnValue({
      studentProfile: {
        class: 10,
        board: 'CBSE',
        language: 'en',
      },
      updateProfile: jest.fn(),
    });
  });
});
```

Mocking API calls:
```typescript
global.fetch = jest.fn();

beforeEach(() => {
  (global.fetch as jest.Mock).mockClear();
});

it('should handle API errors gracefully', async () => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(
    new Error('Network error')
  );

  const result = await chatAPI.sendMessage('Hello');
  expect(result).toEqual({ error: 'Failed to send message' });
});
```

Mocking AsyncStorage:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
```

**What to Mock:**
- External API calls (fetch, Supabase)
- Zustand stores and their selectors
- AsyncStorage operations
- React Native modules (Linking, Share, etc.)
- Heavy computations or time-dependent operations

**What NOT to Mock:**
- Pure utility functions (e.g., `buildSystemPrompt()`)
- React hooks lifecycle (unless testing specific hook behavior)
- Custom hooks in isolation (test through components or use `@testing-library/react-hooks`)
- Tailwind/NativeWind class application

## Fixtures and Factories

**Test Data:**

Student profile fixture:
```typescript
export const mockStudentProfile = {
  class: 10,
  board: 'CBSE',
  language: 'en',
};

export const mockStudentProfiles = {
  class6CBSEEnglish: { class: 6, board: 'CBSE', language: 'en' },
  class12ICSEHindi: { class: 12, board: 'ICSE', language: 'hi' },
  class9StateBoard: { class: 9, board: 'State', language: 'en' },
};
```

Chat message fixture:
```typescript
export const mockChatMessage = {
  id: 'msg-1',
  role: 'user',
  content: 'What is photosynthesis?',
  timestamp: Date.now(),
};

export const mockChatMessages = [
  { ...mockChatMessage, id: 'msg-1' },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'Let me ask you a question first...',
    timestamp: Date.now() + 1000,
  },
];
```

**Location:**
- `__tests__/fixtures/` directory for shared test data
- File structure: `__tests__/fixtures/[feature].ts`
- Example: `__tests__/fixtures/studentProfiles.ts`, `__tests__/fixtures/chatMessages.ts`
- Import in tests: `import { mockStudentProfile } from '@/__tests__/fixtures/studentProfiles'`

## Coverage

**Requirements:** Not yet enforced

**Recommended Targets (when coverage implemented):**
- Overall: 80%+ coverage
- Statements: 80%+
- Branches: 70%+ (hard to test all conditionals)
- Functions: 80%+
- Lines: 80%+

**View Coverage:**
```bash
npm test -- --coverage
```

**Coverage report locations:**
- Console output: Summary of coverage percentages
- HTML report: `coverage/lcov-report/index.html` (open in browser)

## Test Types

**Unit Tests:**
- Scope: Individual functions, utilities, and hooks in isolation
- Approach: Test pure functions with various inputs and edge cases
- Examples:
  - `buildSystemPrompt()` with different student profiles
  - Zustand selector logic
  - Message formatting utilities
  - Error handling in utility functions

**Integration Tests:**
- Scope: Component behavior with real Zustand stores and child components
- Approach: Use React Testing Library to render and interact with components
- Examples:
  - ChatScreen component displaying messages
  - Onboarding flow (user selects class → board → language)
  - Message sending through useChat hook

**E2E Tests:**
- Framework: Expo test library or Detox (when implemented)
- Scope: User workflows across multiple screens
- Examples:
  - Complete onboarding flow
  - Ask a question → receive Socratic response → continue conversation
  - Switch between tabs and return to conversation history
  - Persist state across app restart

## Common Patterns

**Async Testing:**
```typescript
it('should fetch chat response asynchronously', async () => {
  const response = await chatAPI.sendMessage('Hello');
  expect(response.message).toBeDefined();
  expect(response.message.length).toBeGreaterThan(0);
});

it('should handle streaming responses', async () => {
  const messages = [];
  const onStream = (chunk) => messages.push(chunk);

  await chatAPI.streamMessage('Question', onStream);
  expect(messages.length).toBeGreaterThan(0);
});
```

**Error Testing:**
```typescript
it('should throw error for invalid student profile', () => {
  expect(() => {
    buildSystemPrompt({
      class: 99,  // Invalid class
      board: 'CBSE',
      language: 'en',
    });
  }).toThrow('Invalid class');
});

it('should gracefully handle network errors', async () => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(
    new Error('Network timeout')
  );

  const result = await chatAPI.sendMessage('Hi');
  expect(result.error).toBe('Failed to send message');
  expect(result.error).not.toContain('timeout');  // User doesn't see internal error
});
```

**Zustand Store Testing:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '@/store/appStore';

it('should update profile and persist to AsyncStorage', async () => {
  const { result } = renderHook(() => useAppStore());

  act(() => {
    result.current.updateProfile({ class: 11, language: 'hi' });
  });

  expect(result.current.studentProfile.class).toBe(11);
  expect(result.current.studentProfile.language).toBe('hi');
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(
    'app-store',
    expect.stringContaining('"class":11')
  );
});
```

## CI/CD Integration

**When testing infrastructure is added:**
- Run tests on every PR with GitHub Actions
- Fail PR if coverage drops below thresholds
- Run separate test suites: unit, integration, e2e
- Generate coverage reports as PR artifacts

---

*Testing analysis: 2026-03-15*
