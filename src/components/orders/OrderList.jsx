import React, { useEffect, useState } from 'react';
import { orderAPI } from '../../services/api';
import { ShoppingCart, CheckCircle, AlertTriangle, Search, ChevronDown, ChevronUp, FileText } from 'lucide-react';

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
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automation Orders</h1>
          <p className="text-gray-500 mt-1">AI-extracted orders from emails</p>
        </div>
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            className="outline-none text-sm w-64"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No orders found</h3>
          <p className="text-gray-500 mt-2">Forward an email with an order to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div 
              key={order._id}
              className={`bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden
                ${expandedId === order._id ? 'border-indigo-200 ring-4 ring-indigo-50 z-10' : 'border-gray-100 hover:border-indigo-100 hover:shadow-md'}
              `}
            >
              {/* Card Header */}
              <div 
                onClick={() => toggleExpand(order._id)}
                className="p-6 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                     <ShoppingCart className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-gray-900">
                       {(() => {
                          if (order.customer?.name && order.customer.name !== 'Unknown') return order.customer.name;
                          if (order.emailId?.senderName && order.emailId.senderName !== 'Unknown') return order.emailId.senderName;
                          const fromText = order.emailId?.from || '';
                          if (fromText.includes('<')) {
                            const namePart = fromText.split('<')[0].trim().replace(/^["']|["']$/g, '');
                            if (namePart) return namePart;
                          }
                          return 'Unknown Customer';
                       })()}
                     </h3>
                     <div className="flex items-center gap-2 text-sm text-gray-500">
                       <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{order.extractedOrderId || 'N/A'}</span>
                       <span>•</span>
                       <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                     </div>
                   </div>
                </div>

                  <div className="text-right flex items-center gap-6">
                    <div className="flex flex-col items-end gap-1">
                      <p className="font-bold text-gray-900 text-lg">
                        {order.currency} {order.totalAmount.toFixed(2)}
                      </p>
                      
                      {/* Salesforce Sync Status */}
                      <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                        order.syncStatus === 'synced' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                        order.syncStatus === 'failed' ? 'bg-red-50 text-red-600 border-red-200' : 
                        'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                         SF Sync: {order.syncStatus || 'pending'}
                      </div>
                    </div>

                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${getConfidenceColor(order.aiConfidence)}`}>
                       {order.aiConfidence > 0.8 ? <CheckCircle className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                       {(order.aiConfidence * 100).toFixed(0)}% AI Conf.
                    </div>
                  </div>
                  
                  {expandedId === order._id ? <ChevronUp className="text-gray-400"/> : <ChevronDown className="text-gray-400"/>}
                </div>

                {/* Expanded Details */}
                {expandedId === order._id && (
                  <div className="bg-gray-50/50 border-t border-gray-100 p-6 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      {/* Items Table */}
                      <div className="md:col-span-1">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Ordered Items</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-medium">
                              <tr>
                                <th className="px-4 py-2 rounded-tl-lg">Description</th>
                              <th className="px-4 py-2 text-center">Qty</th>
                              <th className="px-4 py-2 text-right">Price</th>
                              <th className="px-4 py-2 text-right rounded-tr-lg">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {order.items.map((item, idx) => (
                              <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-900">{item.description}</td>
                                <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                                <td className="px-4 py-3 text-right text-gray-600">{item.unitPrice?.toFixed(2) || '0.00'}</td>
                                <td className="px-4 py-3 text-right font-semibold text-indigo-600">
                                  {item.totalPrice?.toFixed(2) || (item.quantity * item.unitPrice)?.toFixed(2) || '0.00'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50 font-bold border-t-2 border-indigo-100">
                            <tr>
                              <td colSpan="3" className="px-4 py-2 text-right text-gray-600">Grand Total</td>
                              <td className="px-4 py-2 text-right text-indigo-700">{order.currency} {order.totalAmount.toFixed(2)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* Customer & Meta Info */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Order Source & Customer</h4>
                         <div className="bg-white p-4 rounded-lg border border-gray-100 text-sm space-y-3">
                            <div className="flex flex-col gap-1">
                               <span className="text-xs font-bold text-indigo-500 uppercase tracking-tighter">Source Email (Sender)</span>
                               <p className="font-medium text-gray-900 bg-indigo-50 p-2 rounded-md border border-indigo-100 italic">
                                 {order.emailId?.from || 'Unknown Sender'}
                               </p>
                            </div>
                            
                            <hr className="border-gray-50" />

                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                  <span className="text-gray-500 text-xs block">Extracted Name:</span>
                                  <span className="font-semibold">{order.customer?.name || '-'}</span>
                               </div>
                               <div>
                                  <span className="text-gray-500 text-xs block">Extracted Email:</span>
                                  <span className="font-semibold">{order.customer?.email || '-'}</span>
                               </div>
                               <div>
                                  <span className="text-gray-500 text-xs block">Phone:</span>
                                  <span className="font-semibold">{order.customer?.phone || '-'}</span>
                               </div>
                               <div>
                                  <span className="text-gray-500 text-xs block">Company:</span>
                                  <span className="font-semibold">{order.customer?.company || '-'}</span>
                               </div>
                            </div>
                            
                            <div>
                               <span className="text-gray-500 text-xs block">Delivery Address:</span>
                               <span className="font-medium break-words italic text-gray-700">{order.customer?.address || '-'}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex gap-3">
                         <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
                            Approve Order
                         </button>
                         <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-white transition text-gray-600">
                            <FileText className="w-4 h-4" /> View Email
                         </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;
