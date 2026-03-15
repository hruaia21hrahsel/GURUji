// In-memory SecureStore mock
let store = new Map();

const SecureStore = {
  getItemAsync: jest.fn((key) => Promise.resolve(store.get(key) ?? null)),
  setItemAsync: jest.fn((key, value) => {
    store.set(key, value);
    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn((key) => {
    store.delete(key);
    return Promise.resolve();
  }),
  __reset: () => {
    store = new Map();
  },
};

module.exports = SecureStore;
