import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Generic hook for API calls with loading, error, and data states.
 * Supports automatic cancellation on unmount to prevent race conditions.
 */
export function useApi(apiFn, { immediate = false, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const callIdRef = useRef(0);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args) => {
    const callId = ++callIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      // Only update state if this is still the latest call and component is mounted
      if (mountedRef.current && callId === callIdRef.current) {
        setData(result);
        setLoading(false);
      }
      return result;
    } catch (err) {
      if (mountedRef.current && callId === callIdRef.current) {
        const message = err.response?.data?.message || err.response?.data?.error || err.message || 'An error occurred';
        setError(message);
        setLoading(false);
      }
      throw err;
    }
  }, [apiFn]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  return { data, loading, error, execute, reset, setData };
}
