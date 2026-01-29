import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package
} from 'lucide-react';
import { orderAPI, emailAPI } from '../../services/api';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalOrders: 0,
    syncedOrders: 0,
    pendingSync: 0,
    avgConfidence: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
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

      // 1. Fetch Order Stats & Recent Orders in parallel
      const [statsRes, ordersRes] = await Promise.all([
        orderAPI.getStats(),
        orderAPI.getOrders({ limit: 10 })
      ]);

      // 2. Set stats from dedicated endpoint
      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data);
      }

      // 3. Set recent orders
      const orders = ordersRes?.data?.orders || [];
      setRecentOrders(orders);

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
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-indigo-600',
    },
    {
      title: 'Synced (SF)',
      value: stats.syncedOrders,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Sync',
      value: stats.pendingSync,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Automation Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time overview of AI-extracted orders and CRM sync status
            </p>
          </div>
          <button
            onClick={() => window.open('https://email-automation-backen-1.onrender.com/api/auth/gmail/connect', '_blank')}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-offset shadow-md font-medium"
          >
            Connect Gmail Account
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
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-xl shadow-inner`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                {stat.title === 'Total Orders' && (
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    {((stats.avgConfidence || 0) * 100).toFixed(0)}% AI Conf.
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-tight">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-bold text-gray-900">
              Recently Extracted Orders
            </h2>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
          >
            View all orders →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <ShoppingCart className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p>No orders extracted yet. New emails will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                   <th className="px-6 py-4">Customer</th>
                   <th className="px-6 py-4">Order ID</th>
                   <th className="px-6 py-4">Amount</th>
                   <th className="px-6 py-4">Sync Status</th>
                   <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate('/orders')}
                    className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {order.customer?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500 italic">{order.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                         {order.extractedOrderId || 'N/A'}
                       </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {order.currency} {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                         order.syncStatus === 'synced' ? 'bg-blue-50 text-blue-600' : 
                         order.syncStatus === 'failed' ? 'bg-red-50 text-red-600' : 
                         'bg-gray-50 text-gray-400'
                       }`}>
                         {order.syncStatus || 'pending'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
