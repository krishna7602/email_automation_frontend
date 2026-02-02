import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { 
  ShoppingCart, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  RefreshCcw,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Mail,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    syncedOrders: 0,
    pendingSync: 0,
    totalRevenue: 0,
    avgConfidence: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        orderAPI.getStats(),
        orderAPI.getOrders({ limit: 5 })
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.orders);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.03] -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform`}></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 leading-none">{title}</p>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
          {subtitle && <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-1.5">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  const resolveDisplayName = (order) => {
    if (order.customer?.name && order.customer.name !== 'Unknown') return order.customer.name;
    if (order.emailId?.senderName && order.emailId.senderName !== 'Unknown') return order.emailId.senderName;
    const fromText = order.emailId?.from || '';
    if (fromText.includes('<')) {
      return fromText.split('<')[0].trim().replace(/^["']|["']$/g, '');
    }
    return 'Unknown Customer';
  };

  const resolveDisplayEmail = (order) => {
    if (order.customer?.email) return order.customer.email;
    const from = order.emailId?.from || '';
    if (from.includes('<')) return from.match(/<([^>]+)>/)?.[1] || from;
    return from;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50/50">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="h-8 w-8 text-indigo-600 animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 lg:px-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <span className="bg-indigo-600 text-[10px] font-black text-white px-2 py-0.5 rounded uppercase tracking-widest">Enterprise Edition</span>
             <span className="w-1 h-1 rounded-full bg-gray-300"></span>
             <span className="text-xs font-bold text-gray-400">v2.0 Beta</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">Executive Summary</h1>
          <p className="text-gray-500 mt-4 text-xl font-medium max-w-2xl leading-relaxed">
            AI-driven commerce orchestration is running. Current processing efficiency is <span className="text-indigo-600 font-bold">{(stats.avgConfidence * 100).toFixed(0)}%</span> across all channels.
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={fetchDashboardData}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white border-2 border-gray-100 text-gray-700 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
          >
            <RefreshCcw className="h-4 w-4" /> Sync
          </button>
          <a 
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-1 active:scale-95"
          >
            <Mail className="h-4 w-4" /> Connect Gmail
          </a>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <StatCard 
          title="Consolidated Orders" 
          value={stats.totalOrders} 
          icon={ShoppingCart} 
          color="from-indigo-600 to-indigo-700"
          subtitle={`${stats.pendingSync} pending synchronization`}
        />
        <StatCard 
          title="Revenue Pipeline" 
          value={`$${stats.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          icon={TrendingUp} 
          color="from-emerald-500 to-emerald-600"
          subtitle="Processed volume today"
        />
        <StatCard 
          title="BC Sync Success" 
          value={`${((stats.syncedOrders / (stats.totalOrders || 1)) * 100).toFixed(0)}%`} 
          icon={CheckCircle} 
          color="from-sky-500 to-sky-600"
          subtitle={`${stats.syncedOrders} records in BC`}
        />
        <StatCard 
          title="AI Precision Grade" 
          value={`${(stats.avgConfidence * 100).toFixed(0)}%`} 
          icon={Zap} 
          color="from-amber-500 to-amber-600"
          subtitle="Confidence across extraction"
        />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-10 py-8 flex items-center justify-between border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
               <Clock className="h-6 w-6 text-indigo-600" />
             </div>
             <div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order Stream</h2>
               <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Real-time extractions</p>
             </div>
          </div>
          <button 
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            View Full Ledger <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-10 py-24 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900">No Orders In Queue</h3>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">Waiting for unread purchase emails from your connected Gmail account.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                   <th className="px-10 py-6">Customer Representative</th>
                   <th className="px-10 py-6 text-center">Cloud ID</th>
                   <th className="px-10 py-6 text-right">Settlement Amount</th>
                   <th className="px-10 py-6 text-center">Sync Matrix</th>
                   <th className="px-10 py-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => {
                  const displayName = resolveDisplayName(order);
                  const displayEmail = resolveDisplayEmail(order);
                  
                  return (
                    <tr
                      key={order._id}
                      onClick={() => navigate('/orders')}
                      className="hover:bg-indigo-50/30 cursor-pointer transition-all group border-transparent border-l-4 hover:border-indigo-600"
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-gray-100">
                             <UserIcon className="h-6 w-6" />
                           </div>
                           <div>
                            <div className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors text-lg tracking-tight">
                              {displayName}
                            </div>
                            <div className="text-xs text-gray-400 font-bold mt-0.5">{displayEmail}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center font-mono">
                         <span className="text-[11px] font-black bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200">
                           {order.extractedOrderId || 'N/A'}
                         </span>
                      </td>
                      <td className="px-10 py-8 text-right font-black text-gray-900 text-lg tabular-nums">
                         {order.currency} {(() => {
                           const itemSum = order.items?.reduce((sum, item) => sum + (item.totalPrice || (item.quantity * item.unitPrice) || 0), 0) || 0;
                           const valueToDisplay = (order.totalAmount > 0 && Math.abs(order.totalAmount - itemSum) < 1) ? order.totalAmount : itemSum;
                           return valueToDisplay.toLocaleString(undefined, { minimumFractionDigits: 2 });
                         })()}
                      </td>
                      <td className="px-10 py-8 text-center">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                          order.syncStatus === 'synced' ? 'bg-sky-50 text-sky-700 border-sky-100' : 
                          order.syncStatus === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                          'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${order.syncStatus === 'synced' ? 'bg-sky-500' : order.syncStatus === 'failed' ? 'bg-rose-500' : 'bg-slate-400'}`}></div>
                          {order.syncStatus || 'pending'}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="text-sm font-black text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Processing Finalized</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default Dashboard;
