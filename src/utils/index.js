export const IS_DEV = true;

export const devLog = (...args) => IS_DEV && console.warn('[DEV]', ...args);

export const isBase64 = (str) => {
  try {
    return btoa(atob(str)) === str;
  } catch (_err) {
    return false;
  }
};

export const isDevelopment = () => IS_DEV;
