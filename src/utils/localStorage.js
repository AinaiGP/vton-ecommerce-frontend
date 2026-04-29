const ACCESS_TOKEN_KEY = 'ainai_access_token';
const REFRESH_TOKEN_KEY = 'ainai_refresh_token';
const CART_ID_KEY = "cartId";
const USER_KEY = "user";
const REMEMBER_ME_KEY = 'ainai_remember_me';

const getFromStorage = (key) => {
  const localValue = localStorage.getItem(key);
  if (localValue) {
    return localValue;
  }
  return sessionStorage.getItem(key) || null;
};

const setInStorage = (key, value, rememberMe) => {
  const target = rememberMe ? localStorage : sessionStorage;
  target.setItem(key, value);
};

const removeFromStorage = (key) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

export const getAccessToken = () => {
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    sessionStorage.getItem(ACCESS_TOKEN_KEY) ||
    null
  );
};

export const getRefreshToken = () => {
  return (
    localStorage.getItem(REFRESH_TOKEN_KEY) ||
    sessionStorage.getItem(REFRESH_TOKEN_KEY) ||
    null
  );
};

export const getCartId = () => getFromStorage(CART_ID_KEY);

export const getUserData = () => {
  const rawUser =
    localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

export const setTokens = (accessToken, refreshToken, rememberMe = true) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(rememberMe));
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const setCartId = (id, rememberMe = true) => {
  setInStorage(CART_ID_KEY, id, rememberMe);
};

export const setUserData = (user, rememberMe = true) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(USER_KEY, JSON.stringify(user));
};

export const getTokenStorageType = () => {
  if (localStorage.getItem(REFRESH_TOKEN_KEY)) {
    return "local";
  }

  if (sessionStorage.getItem(REFRESH_TOKEN_KEY)) {
    return "session";
  }

  return "local";
};

export const clearAll = () => {
  clearTokens();
  localStorage.removeItem(CART_ID_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(CART_ID_KEY);
  sessionStorage.removeItem(USER_KEY);
};
