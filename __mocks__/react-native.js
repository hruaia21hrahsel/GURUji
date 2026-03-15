// Minimal react-native mock for Node.js Jest test environment
// Avoids TurboModule/DevMenu/native module errors in unit tests

let appStateCallback = null;

const AppState = {
  currentState: 'active',
  addEventListener: jest.fn((event, callback) => {
    if (event === 'change') {
      appStateCallback = callback;
      global.__appStateCallback = callback;
    }
    return { remove: jest.fn() };
  }),
  removeEventListener: jest.fn(),
};

const Platform = {
  OS: 'ios',
  select: jest.fn((obj) => obj.ios ?? obj.default),
  Version: '16',
};

const Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 812, scale: 2, fontScale: 1 })),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
};

const Alert = {
  alert: jest.fn(),
};

const Keyboard = {
  dismiss: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
};

module.exports = {
  AppState,
  Platform,
  Dimensions,
  Alert,
  Keyboard,
  // Stub component factories
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  SafeAreaView: 'SafeAreaView',
  Image: 'Image',
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
  NativeModules: {},
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
};
