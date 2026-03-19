import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import SEOPublicLayout from './pages/SEOPublicLayout';

const rootElement = document.getElementById('root');

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/features" element={<SEOPublicLayout />} />
        <Route path="/pricing" element={<SEOPublicLayout />} />
        <Route path="/use-cases" element={<SEOPublicLayout />} />
        <Route path="/docs" element={<SEOPublicLayout />} />
        <Route path="/*" element={
          <AuthProvider>
            <App />
          </AuthProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

if (!rootElement) {
  console.error("Root element not found! Make sure id='root' exists in index.html");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
}

reportWebVitals();
