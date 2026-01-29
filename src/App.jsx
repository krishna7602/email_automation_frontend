import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import EmailList from './components/email/EmailList';
import OrderList from './components/orders/OrderList';
import EmailDetail from './components/email/EmailDetail';
import EmailUpload from './components/email/EmailUpload';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/emails" element={<EmailList />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/emails/:trackingId" element={<EmailDetail />} />
          <Route path="/upload" element={<EmailUpload />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;