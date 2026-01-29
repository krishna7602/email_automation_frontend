import { useState, useEffect, useCallback } from 'react';
import { emailAPI } from '../services/api';

export const useEmails = (initialFilters = {}) => {
  const [emails, setEmails] = useState([]); // ✅ always array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Axios already returns response.data
      const response = await emailAPI.getEmails(filters);
      const data = response?.data || {};

      setEmails(Array.isArray(data.emails) ? data.emails : []);

      setPagination({
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 10,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 1,
        hasNext: data.pagination?.hasNext || false,
        hasPrev: data.pagination?.hasPrev || false,
      });

    } catch (err) {
      setError(err.message);
      setEmails([]); // ✅ safe fallback
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // ✅ Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchEmails();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchEmails]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const goToPage = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const refresh = () => fetchEmails();

  return {
    emails,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    refresh,
  };
};
