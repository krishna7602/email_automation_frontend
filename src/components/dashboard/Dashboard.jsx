import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { emailAPI } from '../../services/api';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
  });
  const [recentEmails, setRecentEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ✅ Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Stats & Recent Emails in parallel
      const [statsRes, emailsRes] = await Promise.all([
        emailAPI.getStats(),
        emailAPI.getEmails({ limit: 10 })
      ]);

      // 2. Set stats from dedicated endpoint
      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data);
      }

      // 3. Set recent emails
      const emails = emailsRes?.data?.emails || [];
      setRecentEmails(emails);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading dashboard..." />;
  if (error)
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />;

  const statCards = [
    {
      title: 'Total Emails',
      value: stats.total,
      icon: Mail,
      color: 'bg-blue-500',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Processing',
      value: stats.processing,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Failed',
      value: stats.failed,
      icon: AlertCircle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Overview of your email processing system
            </p>
          </div>
          <button
            onClick={() => window.open('http://localhost:3000/api/auth/gmail/connect', '_blank')}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Mail className="h-4 w-4 mr-2" />
            Connect Gmail
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Emails */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Emails
            </h2>
          </div>
          <button
            onClick={() => navigate('/emails')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all →
          </button>
        </div>

        {recentEmails.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No emails yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentEmails.map((email) => (
              <div
                key={email._id}
                onClick={() =>
                  navigate(`/emails/${email.trackingId}`)
                }
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs md:max-w-md">
                      {email.subject || 'No Subject'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      From: {email.senderName}
                    </p>
                    {email.to && email.to.length > 0 && (
                      <p className="text-xs text-gray-500">
                        To: {email.to.join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(email.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
