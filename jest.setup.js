// ============================================================
// Global mocks for native modules — referenced throughout tests
// ============================================================

// NOTE: jest.mock() factories cannot reference out-of-scope vars directly.
// Variables MUST be prefixed with "mock" to satisfy Jest's variable hoisting rule.

// ---- AsyncStorage (in-memory) ----
const mockAsyncStorageMap = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key) => Promise.resolve(mockAsyncStorageMap.get(key) ?? null)),
  setItem: jest.fn((key, value) => {
    mockAsyncStorageMap.set(key, value);
    return Promise.resolve();
  }),
  removeItem: jest.fn((key) => {
    mockAsyncStorageMap.delete(key);
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockAsyncStorageMap.clear();
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve([...mockAsyncStorageMap.keys()])),
  multiGet: jest.fn((keys) =>
    Promise.resolve(keys.map((k) => [k, mockAsyncStorageMap.get(k) ?? null]))
  ),
  multiSet: jest.fn((pairs) => {
    pairs.forEach(([k, v]) => mockAsyncStorageMap.set(k, v));
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys) => {
    keys.forEach((k) => mockAsyncStorageMap.delete(k));
    return Promise.resolve();
  }),
}));

// ---- SecureStore (in-memory) ----
const mockSecureStoreMap = new Map();

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key) => Promise.resolve(mockSecureStoreMap.get(key) ?? null)),
  setItemAsync: jest.fn((key, value) => {
    mockSecureStoreMap.set(key, value);
    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn((key) => {
    mockSecureStoreMap.delete(key);
    return Promise.resolve();
  }),
}));

// ---- expo-local-authentication ----
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
}));

// ---- @supabase/supabase-js ----
jest.mock('@supabase/supabase-js', () => {
  const mockStartAutoRefresh = jest.fn(() => Promise.resolve());
  const mockStopAutoRefresh = jest.fn(() => Promise.resolve());
  const mockSignInWithOtp = jest.fn(() => Promise.resolve({ data: {}, error: null }));
  const mockSignInWithPassword = jest.fn(() => Promise.resolve({ data: {}, error: null }));
  const mockSignUp = jest.fn(() => Promise.resolve({ data: {}, error: null }));
  const mockSignInWithIdToken = jest.fn(() => Promise.resolve({ data: {}, error: null }));
  const mockVerifyOtp = jest.fn(() => Promise.resolve({ data: {}, error: null }));
  const mockGetSession = jest.fn(() =>
    Promise.resolve({ data: { session: null }, error: null })
  );
  const mockSignOut = jest.fn(() => Promise.resolve({ error: null }));
  const mockGetUser = jest.fn(() => Promise.resolve({ data: { user: null }, error: null }));
  const mockGetUserIdentities = jest.fn(() =>
    Promise.resolve({ data: { identities: [] }, error: null })
  );
  const mockLinkIdentity = jest.fn(() => Promise.resolve({ data: {}, error: null }));
  const mockUnlinkIdentity = jest.fn(() => Promise.resolve({ data: {}, error: null }));
  const mockUpdateUser = jest.fn(() => Promise.resolve({ data: {}, error: null }));
  const mockOnAuthStateChange = jest.fn((_callback) => ({
    data: { subscription: { unsubscribe: jest.fn() } },
  }));

  const mockClient = {
    auth: {
      startAutoRefresh: mockStartAutoRefresh,
      stopAutoRefresh: mockStopAutoRefresh,
      signInWithOtp: mockSignInWithOtp,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signInWithIdToken: mockSignInWithIdToken,
      verifyOtp: mockVerifyOtp,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
      getUser: mockGetUser,
      getUserIdentities: mockGetUserIdentities,
      linkIdentity: mockLinkIdentity,
      unlinkIdentity: mockUnlinkIdentity,
      updateUser: mockUpdateUser,
    },
    from: jest.fn(() => ({
      upsert: jest.fn(() => Promise.resolve({ error: null })),
      update: jest.fn().mockReturnThis(),
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      eq: jest.fn().mockReturnThis(),
    })),
  };

  return {
    createClient: jest.fn(() => mockClient),
  };
});

// ---- react-native-get-random-values (polyfill — no-op in Node.js test env) ----
jest.mock('react-native-get-random-values', () => {});

// ---- Reset state between tests ----
beforeEach(() => {
  global.__appStateCallback = null;
  mockAsyncStorageMap.clear();
  mockSecureStoreMap.clear();
  jest.clearAllMocks();
});
