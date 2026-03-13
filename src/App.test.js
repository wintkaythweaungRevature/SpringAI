import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';

test('renders app without crashing', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
});
