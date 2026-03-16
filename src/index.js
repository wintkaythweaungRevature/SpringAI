import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

const rootElement = document.getElementById('root');

function Root() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  if (path === '/privacy-policy') return <PrivacyPolicy />;
  if (path === '/terms-of-service') return <TermsOfService />;
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
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