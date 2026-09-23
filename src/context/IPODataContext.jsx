import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchIPOList } from '../services/ipoApi';
import fallbackData, { getStatusLabel, getStatusBadgeClass, formatCurrency, formatDate } from '../data/ipoData';

const IPODataContext = createContext();

// Cache duration: 5 minutes (matches the backend's own list cache, so
// there's little point holding onto a client copy longer than that).
const CACHE_DURATION = 5 * 60 * 1000;

export function IPODataProvider({ children }) {
  const [ipos, setIpos] = useState(fallbackData);
  const [isLive, setIsLive] = useState(false);
  const [backendUnavailable, setBackendUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchLiveData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await fetchIPOList();
      setIpos(list.map(ipo => ({ ...ipo, _isLive: true })));
      setIsLive(true);
      setBackendUnavailable(false);
      setLastFetched(new Date());

      try {
        sessionStorage.setItem('vitta-ipo-cache', JSON.stringify({ data: list, timestamp: Date.now() }));
      } catch { /* storage might be full */ }
    } catch (err) {
      // Backend is unreachable (not running, network error, etc). Fall
      // back to the 2 curated sample IPOs and say so plainly — never
      // silently blend sample content into what looks like a live list.
      console.warn('[Vitta IPO] Backend unavailable, showing sample data:', err.message);
      setError(err.message);
      setIpos(fallbackData.map(ipo => ({ ...ipo, _isLive: false, _isSample: true })));
      setIsLive(false);
      setBackendUnavailable(true);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('vitta-ipo-cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION && data?.length > 0) {
          setIpos(data.map(ipo => ({ ...ipo, _isLive: true })));
          setIsLive(true);
          setLastFetched(new Date(timestamp));
          setLoading(false);
          return;
        }
      }
    } catch { /* ignore cache errors */ }

    fetchLiveData();
  }, [fetchLiveData]);

  useEffect(() => {
    const interval = setInterval(fetchLiveData, CACHE_DURATION);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  const getAllIPOs = useCallback(() => ipos, [ipos]);
  const getIPOBySlug = useCallback((slug) => ipos.find(ipo => ipo.id === slug), [ipos]);
  const getIPOsByStatus = useCallback((status) => ipos.filter(ipo => ipo.status === status), [ipos]);

  return (
    <IPODataContext.Provider value={{
      ipos,
      isLive,
      backendUnavailable,
      loading,
      error,
      lastFetched,
      getAllIPOs,
      getIPOBySlug,
      getIPOsByStatus,
      refreshData: fetchLiveData,
    }}>
      {children}
    </IPODataContext.Provider>
  );
}

export function useIPOData() {
  const context = useContext(IPODataContext);
  if (!context) throw new Error('useIPOData must be used within IPODataProvider');
  return context;
}

// Re-export utility functions so components can import from one place
export { getStatusLabel, getStatusBadgeClass, formatCurrency, formatDate };
