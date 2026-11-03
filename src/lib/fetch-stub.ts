const safeFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    return window.fetch(input, init);
  }
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch(input, init);
  }
  throw new Error('Fetch API is not available in current environment.');
};

export default safeFetch;
export const fetch = safeFetch;
export const Headers = typeof window !== 'undefined' ? window.Headers : globalThis.Headers;
export const Request = typeof window !== 'undefined' ? window.Request : globalThis.Request;
export const Response = typeof window !== 'undefined' ? window.Response : globalThis.Response;

