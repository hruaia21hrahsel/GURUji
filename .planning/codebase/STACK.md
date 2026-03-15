# Technology Stack

**Analysis Date:** 2026-03-15

## Languages

**Primary:**
- TypeScript 5.3.3 - Core language for all app and type safety
- JavaScript - Babel presets and configuration

**Secondary:**
- CSS - Tailwind CSS for styling via NativeWind
- JSX/TSX - React component syntax via React 19.1.0

## Runtime

**Environment:**
- Node.js (version not pinned in repository)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)
- Configuration: `.npmrc` with `legacy-peer-deps=true` to handle React 19.2.0 vs AI SDK peer dependency conflicts

## Frameworks

**Core:**
- Expo SDK 54.0.0 - React Native framework for iOS, Android, Web
- Expo Router 4.0.22 - File-based routing for native mobile apps
- React 19.1.0 - UI framework
- React Native 0.81.4 - Native iOS/Android renderer

**Styling:**
- NativeWind 4.1.23 - Tailwind CSS for React Native via className syntax
- Tailwind CSS 3.4.17 - Utility-first CSS framework

**AI & Chat:**
- Vercel AI SDK (`ai` 6.0.116) - Streaming API client for LLMs
- `@ai-sdk/anthropic` 3.0.58 - Anthropic Claude SDK adapter
- `@ai-sdk/react` 3.0.118 - React hooks (`useChat`) for AI interactions

**State Management:**
- Zustand 5.0.11 - Lightweight state management with persist middleware for AsyncStorage

**Navigation & UI:**
- React Native Gesture Handler 2.20.2 - Gesture handling for navigation
- React Native Screens 4.4.0 - Native navigation views (performance optimization)
- React Native Safe Area Context 4.12.0 - Safe area insets for notches/edges
- Expo Safe Area (via safe-area-context)

**Data & Persistence:**
- `@react-native-async-storage/async-storage` 2.1.2 - Device-level persistent storage
- Expo Secure Store 14.0.1 - Encrypted secure storage for sensitive data

**Utilities & Icons:**
- `@expo/vector-icons` 14.0.4 - Material Design and other icon sets
- React Native Markdown Display 7.0.2 - Markdown rendering for educational content
- React Native Worklets 0.7.2 - Performance-critical worklet runtime
- Expo Linking 7.0.5 - Deep linking and URL handling
- Expo System UI 4.0.9 - System UI integration
- Expo Status Bar 2.0.1 - Status bar management
- Expo Constants 17.0.8 - App constants and manifest access

**Development:**
- Babel Preset Expo 14.0.4 - Babel configuration for Expo
- Expo Metro Runtime 4.0.0 - Metro bundler runtime for Expo

## Key Dependencies

**Critical:**
- `@ai-sdk/anthropic` & `ai` - Enables streaming chat with Claude; powers main GURUji chat functionality
- Zustand - Application state and chat session persistence via AsyncStorage
- Expo/React Native - Enables single codebase for iOS, Android, Web

**Infrastructure:**
- Expo Router - File-based routing; eliminates need for manual navigation setup
- NativeWind - Brings Tailwind CSS styling to React Native for consistent cross-platform UI
- AsyncStorage - Device-level chat history and user profile persistence
- Expo Secure Store - Stores authentication tokens if needed

**Peer Dependency Note:**
- React 19.1.0 conflicts with `@ai-sdk/react` peer dependency requirements
- Solution: `.npmrc` configured with `legacy-peer-deps=true` to suppress warnings

## Configuration

**Environment:**
- `ANTHROPIC_API_KEY` - Server-only (never exposed to client bundle). Required for Claude API access via `/api/chat` endpoint.
- `EXPO_PUBLIC_SUPABASE_URL` - Client-accessible (prefixed `EXPO_PUBLIC_`). Optional for Supabase initialization.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Client-accessible (prefixed `EXPO_PUBLIC_`). Optional for Supabase initialization.
- No .env file in repository; configure locally or via CI/CD secrets

**Build Configuration:**
- `app.json` - Expo app manifest with platform-specific configs (iOS bundle ID: `com.guruji.app`, Android package: `com.guruji.app`)
- `babel.config.js` - Babel presets for Expo + NativeWind JSX transformation
- `metro.config.js` - Metro bundler config with NativeWind integration (`global.css` input)
- `tailwind.config.js` - Tailwind configuration with custom color palette (primary: #6C47FF, secondary: #F97316)
- `tsconfig.json` - TypeScript strict mode enabled; extends `expo/tsconfig.base`; path alias `@/*` maps to root
- `.npmrc` - Forces legacy peer dependency handling for React 19.1.0

**Styling:**
- `global.css` - Tailwind directives imported at app boot
- Tailwind theme extends with custom colors for GURUji brand
- NativeWind configured in Babel and Metro to process `className` props

## Platform Requirements

**Development:**
- Node.js (version not specified; npm modules lock to ~54.0.0 for Expo)
- npm with `--legacy-peer-deps` flag (pre-configured in `.npmrc`)
- Expo CLI (`npx expo` available)
- Optional: iOS development tools (Xcode) for native iOS builds
- Optional: Android development tools (Android Studio) for native Android builds

**Production:**
- **Mobile:** EAS Build (Expo's build service) for iOS/Android builds, or local native build tools
- **Web:** Node.js server for Expo web output (configured in `app.json` with `"output": "server"`)
- **Platform-specific identifiers:** iOS bundle ID `com.guruji.app`, Android package `com.guruji.app`

**Deployment:**
- Expo Go app can run development builds directly
- EAS Submit for App Store/Play Store publishing
- Self-hosted web server for web version

---

*Stack analysis: 2026-03-15*
