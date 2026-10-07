import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ShippingFormPage } from './pages/ShippingFormPage';
import { SuccessPage } from './pages/SuccessPage';
import { InvalidMerchantPage } from './pages/InvalidMerchantPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Primary entry route /form?merchant=... */}
      <Route path="/form" element={<ShippingFormPage />} />

      {/* Standalone success page */}
      <Route path="/success" element={<SuccessPage />} />

      {/* Root redirect to default demo merchant */}
      <Route path="/" element={<Navigate to="/form?merchant=merchant-fabet" replace />} />

      {/* 404 / Invalid routes */}
      <Route path="*" element={<InvalidMerchantPage />} />
    </Routes>
  );
};

export default App;
