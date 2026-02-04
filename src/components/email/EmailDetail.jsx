import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Package, Check, AlertTriangle } from 'lucide-react';
import { emailAPI } from '../../services/api';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';

const EmailDetail = () => {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const [emailData, setEmailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeOrderIndex, setActiveOrderIndex] = useState(0);

  useEffect(() => {
    fetchEmail();
  }, [trackingId]);

  const fetchEmail = async () => {
    try {
      setLoading(true);
      const response = await emailAPI.getEmailByTrackingId(trackingId);
      // Backend returns { email, order } OR { email, orders: [...] }
      // Normalize to always have an orders array
      const rawData = response.data;
      let orders = [];
      
      if (rawData.orders && Array.isArray(rawData.orders)) {
        orders = rawData.orders;
      } else if (rawData.order) {
        orders = [rawData.order];
      }

      setEmailData({ ...rawData, orders });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading email..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchEmail} />;
  if (!emailData || !emailData.email) return <ErrorMessage message="Email not found" />;

  const { email, orders } = emailData;
  const currentOrder = orders.length > 0 ? orders[activeOrderIndex] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/emails')} className="flex items-center mb-6 text-gray-600 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inbox
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Email Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{email.subject}</h1>
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-50">
               <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                 {email.senderName?.charAt(0) || email.from?.charAt(0).toUpperCase()}
               </div>
               <div>
                  <p className="font-semibold text-gray-900">{email.senderName || 'Unknown Sender'}</p>
                  <p className="text-sm text-gray-500">{email.from}</p>
               </div>
            </div>

            <div className="prose max-w-none">
              <pre className="text-gray-700 bg-gray-50/50 p-6 rounded-xl border border-gray-100 whitespace-pre-wrap font-sans text-base leading-relaxed">
                {email.body}
              </pre>
            </div>

            {email.attachments && email.attachments.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                   Attachments <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{email.attachments.length}</span>
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {email.attachments.map((att) => (
                    <div key={att.attachmentId} className="border border-gray-200 rounded-xl p-5 bg-white hover:border-indigo-200 transition-colors group">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{att.filename}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded">
                           {att.extractionMethod}
                        </span>
                      </div>
                      {att.extractedText ? (
                        <div className="mt-2">
                          <pre className="text-xs text-gray-600 bg-gray-50 p-4 border border-gray-100 rounded-lg max-h-40 overflow-y-auto whitespace-pre-wrap italic">
                            {att.extractedText}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Binary file - No text extracted</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-gray-50 flex justify-between items-center">
              <button
                onClick={async () => {
                  if(window.confirm('Are you sure you want to delete this email?')) {
                    await emailAPI.deleteEmail(trackingId);
                    navigate('/emails');
                  }
                }}
                className="text-red-500 flex items-center hover:text-red-700 transition-colors gap-2 text-sm font-medium"
              >
                <Trash2 className="h-4 w-4" /> Delete email
              </button>
            </div>
          </div>
        </div>

        {/* Structured Order Data Sidebar */}
        <div className="lg:col-span-1">
          <div className={`sticky top-8 rounded-2xl border transition-all duration-300 ${orders.length > 0 ? 'bg-white border-green-100 shadow-xl' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
            <div className={`p-6 border-b ${orders.length > 0 ? 'border-green-50 bg-green-50/30' : 'border-gray-200 bg-gray-100/50'} rounded-t-2xl`}>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Structured Order Data
                {orders.length > 0 && <span className="bg-green-500 h-2 w-2 rounded-full animate-pulse"></span>}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {orders.length > 0 ? `AI extracted ${orders.length} unique order${orders.length > 1 ? 's' : ''}` : 'No order data was extracted'}
              </p>
            </div>

            <div className="p-6">
              {orders.length > 0 ? (
                <div className="space-y-6">
                  {/* Multi-Order Tabs */}
                  {orders.length > 1 && (
                    <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar">
                      {orders.map((_, i) => (
                        <button 
                          key={i}
                          onClick={() => setActiveOrderIndex(i)}
                          className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-colors border ${
                            i === activeOrderIndex 
                             ? 'bg-indigo-600 text-white border-indigo-600' 
                             : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          Order #{i + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg border border-gray-200 text-indigo-600">
                         <Package className="h-4 w-4" />
                      </div>
                      <div>
                         <p className="text-xs uppercase font-bold text-gray-400">Customer</p>
                         <p className="font-bold text-gray-900 text-sm">
                           {currentOrder.customer?.name || 'Unknown Name'}
                         </p>
                         <p className="text-xs text-gray-500">{currentOrder.customer?.email}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Items</span>
                      <div className="space-y-2">
                          {currentOrder.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <div>
                                <span className="font-medium text-gray-800 block">{item.description}</span>
                                <span className="text-xs text-gray-400">{item.sku}</span>
                              </div>
                              <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded text-xs">×{item.quantity}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Total</span>
                        <p className="text-lg font-black text-gray-900">{currentOrder.currency} {currentOrder.totalAmount}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Confidence</span>
                        <p className={`text-lg font-black ${(currentOrder.aiConfidence * 100) > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {(currentOrder.aiConfidence * 100).toFixed(0)}%
                        </p>
                      </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => navigate('/orders')}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                    >
                      View in Order List
                    </button>

                    <button 
                      className="w-full border-2 border-orange-200 text-orange-700 py-3 rounded-xl font-bold bg-orange-50 hover:bg-orange-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      onClick={async (e) => {
                          const btnElement = e.currentTarget;
                          try {
                            btnElement.disabled = true;
                            btnElement.innerText = '🌀 Processing Multi-Line...';
                            
                            const result = await emailAPI.reprocessEmail(trackingId);
                            // Refresh email data
                            const response = await emailAPI.getEmailByTrackingId(trackingId);
                            const rawData = response.data;
                            let newOrders = [];
                            if (rawData.orders) newOrders = rawData.orders;
                            else if (rawData.order) newOrders = [rawData.order];
                            
                            setEmailData({ ...rawData, orders: newOrders });
                            setActiveOrderIndex(0);

                            alert(`Success! Found ${newOrders.length} orders.`);
                          } catch (err) {
                            alert('Reprocessing Error: ' + err.message);
                          } finally {
                            btnElement.disabled = false;
                            btnElement.innerText = 'Re-run AI Extraction (FIX)';
                          }
                      }}
                    >
                      Re-run AI Extraction (FIX)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-6 font-medium">If AI missed it, try re-triggering or mark it manually:</p>
                  
                  <div className="space-y-3">
                    <button 
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={async (e) => {
                          const btnElement = e.currentTarget;
                          try {
                            btnElement.disabled = true;
                            btnElement.innerHTML = '🌀 Extracting...';
                            
                            const result = await emailAPI.reprocessEmail(trackingId);
                            
                            // Handle case where result is directly the response wrapper or data
                            const ordersData = result.data?.orders || (result.data?.order ? [result.data.order] : []);
                            
                            if (ordersData.length > 0) {
                              const response = await emailAPI.getEmailByTrackingId(trackingId);
                              let newOrders = response.data.orders || (response.data.order ? [response.data.order] : []);
                              setEmailData({ ...response.data, orders: newOrders });
                              alert(`Success! Extracted ${newOrders.length} orders.`);
                            } else if (result.data?.noOrderFound) {
                               alert('AI Result: No orders found.');
                            }

                          } catch (err) {
                            alert('Reprocessing Error: ' + err.message);
                          } finally {
                            btnElement.disabled = false;
                            btnElement.innerText = 'Re-run AI Extraction';
                          }
                      }}
                    >
                      Re-run AI Extraction
                    </button>
                    
                    <button 
                      className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                      onClick={async () => {
                        if(window.confirm('This will skip AI and manually create an order entry. Continue?')) {
                            try {
                              await emailAPI.convertToOrder(trackingId);
                              await fetchEmail();
                              alert('Email successfully marked as Order.');
                            } catch (err) {
                              alert('Conversion failed: ' + err.message);
                            }
                        }
                      }}
                    >
                      Force Mark as Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;
