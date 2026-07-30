import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Storefront from './screens/Storefront.jsx';
import ContactPage from './screens/ContactPage.jsx';
import ProductDetail from './screens/ProductDetail.jsx';
import { AuthProvider } from './lib/AuthContext';
import { CartProvider } from './lib/CartContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Storefront />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/panel" element={<App />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
