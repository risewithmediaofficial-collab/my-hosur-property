const STORAGE_KEY = "myhosurproperty:inquiry-history";

const readStore = () => {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeStore = (store) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const getInquiryHistory = (userId) => {
  if (!userId) return [];
  const store = readStore();
  return Array.isArray(store[userId]) ? store[userId] : [];
};

export const saveInquiryHistoryItem = (userId, item) => {
  if (!userId || !item?.id) return [];

  const store = readStore();
  const currentItems = Array.isArray(store[userId]) ? store[userId] : [];
  const nextItems = [item, ...currentItems.filter((entry) => entry.id !== item.id)].slice(0, 50);
  store[userId] = nextItems;
  writeStore(store);
  return nextItems;
};

export const updateInquiryHistoryItem = (userId, inquiryId, updates) => {
  if (!userId || !inquiryId) return [];

  const store = readStore();
  const currentItems = Array.isArray(store[userId]) ? store[userId] : [];
  const nextItems = currentItems.map((entry) => (entry.id === inquiryId ? { ...entry, ...updates } : entry));
  store[userId] = nextItems;
  writeStore(store);
  return nextItems;
};
