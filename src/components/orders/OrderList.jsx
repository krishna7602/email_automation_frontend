import React, { useEffect, useState } from 'react';
import { orderAPI } from '../../services/api';
import { ShoppingCart, CheckCircle, AlertTriangle, Search, ChevronDown, ChevronUp, FileText, User, Mail, Phone, MapPin, Building2, ExternalLink } from 'lucide-react';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getOrders();
      setOrders(response.data.orders);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    if (score >= 0.5) return 'text-amber-700 bg-amber-50 border-amber-100';
    return 'text-rose-700 bg-rose-50 border-rose-100';
  };

  const resolveCustomerName = (order) => {
    if (order.customer?.name && order.customer.name !== 'Unknown') return order.customer.name;
    if (order.emailId?.senderName && order.emailId.senderName !== 'Unknown') return order.emailId.senderName;
    const fromText = order.emailId?.from || '';
    if (fromText.includes('<')) {
      const namePart = fromText.split('<')[0].trim().replace(/^["']|["']$/g, '');
      if (namePart) return namePart;
    }
    return 'Unknown Customer';
  };

  const resolveCustomerEmail = (order) => {
    if (order.customer?.email) return order.customer.email;
    const fromText = order.emailId?.from || '';
    if (fromText.includes('<')) {
      return fromText.match(/<([^>]+)>/)?.[1] || fromText;
    }
    return order.emailId?.from || 'N/A';
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Orders Ledger</h1>
          <p className="text-gray-500 mt-2 text-lg">Manage AI-extracted purchasing data from your inbox</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 w-full md:w-auto">
          <Search className="w-5 h-5 text-gray-400 ml-1" />
          <input
            type="text"
            placeholder="Search by name, ID or amount..."
            className="outline-none text-sm w-full md:w-64 bg-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-8 border border-rose-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center">
          <div className="bg-gray-50 p-6 rounded-full mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Queue is empty</h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">New unread emails will automatically appear here once processed.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {orders.map((order) => {
            const isExpanded = expandedId === order._id;
            const customerName = resolveCustomerName(order);
            const customerEmail = resolveCustomerEmail(order);
            
            return (
              <div 
                key={order._id}
                className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden
                  ${isExpanded ? 'border-indigo-300 ring-8 ring-indigo-50/50 shadow-xl' : 'border-gray-100 hover:border-indigo-200 hover:shadow-lg'}
                `}
              >
                {/* Card Header */}
                <div 
                  onClick={() => toggleExpand(order._id)}
                  className="p-6 cursor-pointer flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-5 w-full lg:w-auto">
                     <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border transition-colors ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-indigo-50 border-indigo-100'}`}>
                       <ShoppingCart className="w-7 h-7" />
                     </div>
                     <div className="flex-1">
                       <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                         {customerName}
                       </h3>
                       <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 font-medium">
                         <span className="font-mono bg-gray-50 text-gray-600 px-2 py-0.5 rounded-lg border border-gray-100">{order.extractedOrderId || 'No ID'}</span>
                         <span className="hidden sm:inline">•</span>
                         <span className="flex items-center gap-1.5 underline decoration-gray-200 underline-offset-4">{customerEmail}</span>
                       </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0">
                    <div className="flex flex-col items-end gap-1.5">
                      <p className="font-black text-gray-900 text-2xl tracking-tight">
                        {order.currency} {order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest flex items-center gap-1.5 ${
                        order.syncStatus === 'synced' ? 'bg-sky-50 text-sky-700 border-sky-100' : 
                        order.syncStatus === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${order.syncStatus === 'synced' ? 'bg-sky-500' : order.syncStatus === 'failed' ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                         SF Sync: {order.syncStatus || 'pending'}
                      </div>
                    </div>

                    <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-2 shadow-sm ${getConfidenceColor(order.aiConfidence)}`}>
                       {order.aiConfidence > 0.8 ? <CheckCircle className="w-3.5 h-3.5"/> : <AlertTriangle className="w-3.5 h-3.5"/>}
                       {(order.aiConfidence * 100).toFixed(0)}% AI Conf.
                    </div>
                    
                    <div className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                      {isExpanded ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="bg-gray-50/30 border-t border-gray-100 p-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                      
                      {/* Items Table */}
                      <div className="xl:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                           <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Ordered Product List</h4>
                           <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                             {order.items.length} unique items
                           </span>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                              <tr>
                                <th className="px-5 py-4">Description / SKU</th>
                                <th className="px-5 py-4 text-center">Quantity</th>
                                <th className="px-5 py-4 text-right">Unit Price</th>
                                <th className="px-5 py-4 text-right">Total Price</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {order.items.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-indigo-50/20 transition-colors">
                                  <td className="px-5 py-5">
                                    <div className="font-bold text-gray-800">{item.description}</div>
                                    {item.sku && <div className="text-[10px] text-gray-400 mt-0.5 font-mono">SKU: {item.sku}</div>}
                                  </td>
                                  <td className="px-5 py-5 text-center font-bold text-gray-700 bg-gray-50/20">{item.quantity}</td>
                                  <td className="px-5 py-5 text-right font-medium text-gray-600">{order.currency} {item.unitPrice?.toFixed(2) || '0.00'}</td>
                                  <td className="px-5 py-5 text-right font-black text-indigo-600">
                                    {order.currency} {(item.totalPrice || (item.quantity * item.unitPrice))?.toFixed(2) || '0.00'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-indigo-600 text-white shadow-inner">
                              <tr className="border-t-4 border-indigo-700/20">
                                <td colSpan="3" className="px-6 py-4 text-right uppercase text-[10px] font-black tracking-widest opacity-80">Settlement Amount</td>
                                <td className="px-6 py-4 text-right font-black text-lg">{order.currency} {order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* Customer & Sidebar */}
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 leading-none">Intelligence Audit</h4>
                          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-7">
                            
                            {/* Unified Customer Info Section */}
                            <div className="grid gap-6">
                              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-100 transition-colors group">
                                <div className="p-2.5 rounded-lg bg-white shadow-sm border border-gray-100 text-indigo-500">
                                  <User className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Customer Name</span>
                                  <p className="font-bold text-gray-900 truncate text-[15px]">{customerName}</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-100 transition-colors group">
                                <div className="p-2.5 rounded-lg bg-white shadow-sm border border-gray-100 text-emerald-500">
                                  <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Email Signature</span>
                                  <p className="font-bold text-gray-900 truncate text-[15px]">{customerEmail}</p>
                                </div>
                              </div>

                              {order.customer?.company && (
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                  <div className="p-2.5 rounded-lg bg-white shadow-sm border border-gray-100 text-amber-500">
                                    <Building2 className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Organization</span>
                                    <p className="font-bold text-gray-900 truncate text-[15px]">{order.customer.company}</p>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="p-2.5 rounded-lg bg-white shadow-sm border border-gray-100 text-rose-500">
                                  <MapPin className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Shipping Profile</span>
                                  <p className="font-bold text-gray-900 text-[13px] leading-relaxed italic text-gray-600">
                                    {order.customer?.address || 'No physical address detected in email content.'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <hr className="border-gray-50" />

                            <div className="flex flex-col gap-3">
                               <button className="w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition duration-200">
                                  Approve & Push to Cloud
                                </button>
                                <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-gray-100 bg-white hover:bg-gray-50 transition duration-200 font-bold text-sm text-gray-700">
                                  <ExternalLink className="w-4 h-4" /> View Original Email
                                </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderList;
