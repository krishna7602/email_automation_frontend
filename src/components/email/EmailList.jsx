import React, { useState } from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import { useEmails } from '../../hooks/useEmails';
import EmailCard from './EmailCard';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import Pagination from '../common/Pagination';
import { EMAIL_STATUS, PRIORITY_LEVELS } from '../../utils/constants';

const EmailList = () => {
  const [showFilters, setShowFilters] = useState(false);

  const {
    emails = [], // ✅ fallback
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    refresh,
  } = useEmails();

  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value || undefined });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Emails</h1>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border rounded-md text-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>

            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white border rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">All Status</option>
                {Object.values(EMAIL_STATUS).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">All Priority</option>
                {Object.values(PRIORITY_LEVELS).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <input
                type="email"
                placeholder="Filter by sender"
                value={filters.from || ''}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="border p-2 rounded"
              />
            </div>
          </div>
        )}
      </div>

      {loading && <Loader message="Loading emails..." />}
      {error && <ErrorMessage message={error} onRetry={refresh} />}

      {!loading && !error && emails.length === 0 && (
        <p className="text-center text-gray-500 py-12">
          No emails found
        </p>
      )}

      {!loading && !error && emails.length > 0 && (
        <>
          <div className="space-y-4 mb-6">
            {emails.map((email) => (
              <EmailCard key={email._id} email={email} />
            ))}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={goToPage}
          />
        </>
      )}
    </div>
  );
};

export default EmailList;
