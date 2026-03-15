// Supabase mock with all auth methods needed for testing

const mockStartAutoRefresh = jest.fn(() => Promise.resolve());
const mockStopAutoRefresh = jest.fn(() => Promise.resolve());
const mockSignInWithOtp = jest.fn(() => Promise.resolve({ data: {}, error: null }));
const mockSignInWithPassword = jest.fn(() => Promise.resolve({ data: {}, error: null }));
const mockSignUp = jest.fn(() => Promise.resolve({ data: {}, error: null }));
const mockSignInWithIdToken = jest.fn(() => Promise.resolve({ data: {}, error: null }));
const mockVerifyOtp = jest.fn(() => Promise.resolve({ data: {}, error: null }));
const mockGetSession = jest.fn(() => Promise.resolve({ data: { session: null }, error: null }));
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

const mockUpsert = jest.fn(() => Promise.resolve({ error: null }));
const mockUpdate = jest.fn(function () { return this; });
const mockSelect = jest.fn(() => Promise.resolve({ data: [], error: null }));
const mockEq = jest.fn(function () { return this; });

const mockFrom = jest.fn(() => ({
  upsert: mockUpsert,
  update: mockUpdate,
  select: mockSelect,
  eq: mockEq,
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
  from: mockFrom,
};

module.exports = {
  createClient: jest.fn(() => mockClient),
  // Export mocks for direct access in tests
  __mocks: {
    startAutoRefresh: mockStartAutoRefresh,
    stopAutoRefresh: mockStopAutoRefresh,
    signInWithOtp: mockSignInWithOtp,
    signInWithPassword: mockSignInWithPassword,
    signUp: mockSignUp,
    signInWithIdToken: mockSignInWithIdToken,
    verifyOtp: mockVerifyOtp,
    getSession: mockGetSession,
    signOut: mockSignOut,
    getUser: mockGetUser,
    onAuthStateChange: mockOnAuthStateChange,
  },
};
