import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Helper component to expose AuthContext values
function AuthConsumer({ onReady }) {
  const auth = useAuth();
  React.useEffect(() => {
    if (!auth.loading) onReady(auth);
  }, [auth, onReady]);
  return <div data-testid="status">{auth.loading ? 'loading' : 'ready'}</div>;
}

function renderWithAuth(onReady) {
  return render(
    <AuthProvider>
      <AuthConsumer onReady={onReady} />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('starts with no user when no token is stored', async () => {
    global.fetch.mockResolvedValue({
      status: 404,
      ok: false,
      json: async () => ({}),
    });

    const onReady = jest.fn();
    renderWithAuth(onReady);

    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(onReady).toHaveBeenCalledWith(expect.objectContaining({ user: null, isLoggedIn: false }));
  });

  it('login stores token and sets user', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.test';
    const fakeUser = { id: 1, email: 'test@example.com', membershipType: 'FREE' };

    global.fetch
      // Initial /me check (no token)
      .mockResolvedValueOnce({ status: 404, ok: false, json: async () => ({}) })
      // POST /api/auth/login
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: fakeToken, email: fakeUser.email, membershipType: 'FREE', id: 1 }),
      })
      // GET /api/auth/me after login
      .mockResolvedValueOnce({
        ok: true,
        json: async () => fakeUser,
      });

    let capturedAuth;
    renderWithAuth(auth => { capturedAuth = auth; });
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));

    await act(async () => {
      await capturedAuth.login('test@example.com', 'password123');
    });

    expect(localStorage.getItem('authToken')).toBe(fakeToken);
  });

  it('login throws on bad credentials', async () => {
    global.fetch
      // Initial /me check
      .mockResolvedValueOnce({ status: 404, ok: false, json: async () => ({}) })
      // POST /api/auth/login — 401
      .mockResolvedValueOnce({
        ok: false,
        text: async () => JSON.stringify({ error: 'Invalid email or password' }),
      });

    let capturedAuth;
    renderWithAuth(auth => { capturedAuth = auth; });
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));

    await expect(
      act(async () => capturedAuth.login('wrong@example.com', 'bad'))
    ).rejects.toThrow('Invalid email or password');
  });

  it('logout clears token and user', async () => {
    localStorage.setItem('authToken', 'existing-token');
    const fakeUser = { id: 1, email: 'test@example.com', membershipType: 'FREE', emailVerified: true };

    global.fetch
      // Initial /me check with existing token
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => fakeUser });

    let capturedAuth;
    renderWithAuth(auth => { capturedAuth = auth; });
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));

    act(() => capturedAuth.logout());

    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('signup calls /api/auth/register with correct body', async () => {
    const fakeToken = 'new-token';
    global.fetch
      // Initial /me check
      .mockResolvedValueOnce({ status: 404, ok: false, json: async () => ({}) })
      // POST /api/auth/register
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: fakeToken, email: 'new@example.com', membershipType: 'FREE', id: 2 }),
      });

    let capturedAuth;
    renderWithAuth(auth => { capturedAuth = auth; });
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));

    await act(async () => {
      await capturedAuth.signup('new@example.com', 'pass123', 'New User');
    });

    const registerCall = global.fetch.mock.calls.find(c => c[0].includes('/api/auth/register'));
    expect(registerCall).toBeDefined();
    const body = JSON.parse(registerCall[1].body);
    expect(body.email).toBe('new@example.com');
    expect(body.password).toBe('pass123');
    expect(localStorage.getItem('authToken')).toBe(fakeToken);
  });

  it('throws if useAuth is used outside AuthProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    function BadConsumer() {
      useAuth();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow('useAuth must be used within AuthProvider');
    consoleError.mockRestore();
  });
});
