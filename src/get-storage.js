const noop = () => {};

const noopStorage = {
  getItem: noop,
  setItem: noop,
  removeItem: noop
};

export function hasStorage(storageType) {
  try {
    let storage = window[storageType];
    const testKey = '__web-storage__test';

    storage.setItem(testKey, 'test');
    storage.getItem(testKey);
    storage.removeItem(testKey);
  } catch (e) {
    return false;
  }

  return true;
}

export default function getStorage(storageType) {
  if (hasStorage(storageType)) {
    return window[storageType];
  } else {
    console && console.warn && console.warn('WebStorage failed to create sync storage; falling back to noop storage.');
    return noopStorage;
  }
}
