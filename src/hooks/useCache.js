import { useState, useEffect } from 'react';
const DEFAULT_TTL = 60 * 1000; // 1 minutes

function useCache(ttl = DEFAULT_TTL) {
  const [cache, setCache] = useState({});

  const isExpired = (entry) => {
    if (!entry) return true;
    return Date.now() - entry.fetchedAt > ttl;
  };

  const get = (key) => {
    const entry = cache[key];
    if (!entry || isExpired(entry)) return null;
    return entry.data;
  };

  const set = (key, data) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        fetchedAt: Date.now(),
      },
    }));
  };

  const update = (key, partial) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data: {
          ...prev[key]?.data,
          ...partial,
        },
        fetchedAt: prev[key]?.fetchedAt ?? Date.now(),
      },
    }));
  };

  const invalidate = (key) => {
    setCache(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const clear = () => setCache({});

  return { get, set, update, invalidate, clear };
}
export default useCache;