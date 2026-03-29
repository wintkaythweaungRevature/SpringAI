import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Helper component that exposes auth context values
function AuthConsumer({ onRender }) {
  const auth = useAuth();
  onRender(auth);
  return <div data-testid="auth-consumer" />;
}

function renderWithProvider(onRender, token = null) {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
  return render(
    <AuthProvider>
      <AuthConsumer onRender={onRender} />
    </AuthProvider>
  );
}

// Helper to make a resolved fetch mock response
function mockFetchOk(data) {
  return {
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

function mockFetchFail(status, data) {
  return {
    ok: false,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ─── useAuth guard ────────────────────────────────────────────────────────

  test('throws error when useAuth is used outside AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    function BadComponent() {
      useAuth();
      return null;
    }
    expect(() => render(<BadComponent />)).toThrow(
      'useAuth must be used within AuthProvider'
    );
    spy.mockRestore();
  });

  // ─── Initial state (no token) ─────────────────────────────────────────────

  test('provides unauthenticated initial state when no token stored', async () => {
    global.fetch.mockResolvedValue(mockFetchFail(401, {}));

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; });
    });

    expect(authValue.user).toBeNull();
    expect(authValue.isLoggedIn).toBe(false);
    expect(authValue.isSubscribed).toBe(false);
    expect(authValue.loading).toBe(false);
  });

  test('sets authAvailable to false when server returns 404', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; });
    });

    expect(authValue.authAvailable).toBe(false);
  });

  test('sets authAvailable to false on network error', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; });
    });

    expect(authValue.authAvailable).toBe(false);
  });

  // ─── Token restoration on load ────────────────────────────────────────────

  test('restores user from stored token on mount', async () => {
    global.fetch.mockResolvedValue(
      mockFetchOk({ email: 'user@example.com', membershipType: 'FREE', emailVerified: true })
    );

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; }, 'stored-token');
    });

    expect(authValue.user).not.toBeNull();
    expect(authValue.user.email).toBe('user@example.com');
    expect(authValue.isLoggedIn).toBe(true);
  });

  test('clears token when server returns 401 on restore', async () => {
    global.fetch.mockResolvedValue(mockFetchFail(401, {}));

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; }, 'bad-token');
    });

    expect(authValue.user).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  // ─── login ────────────────────────────────────────────────────────────────

  test('login stores token and sets user', async () => {
    // Initial mount (no token)
    global.fetch.mockResolvedValueOnce(mockFetchFail(401, {}));

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; });
    });

    // login call + /me fetch
    global.fetch
      .mockResolvedValueOnce(
        mockFetchOk({ token: 'new-token', email: 'user@example.com', membershipType: 'FREE' })
      )
      .mockResolvedValueOnce(
        mockFetchOk({ email: 'user@example.com', membershipType: 'FREE', emailVerified: true })
      );

    await act(async () => {
      await authValue.login('user@example.com', 'pass123');
    });

    expect(localStorage.getItem('authToken')).toBe('new-token');
    expect(authValue.isLoggedIn).toBe(true);
    expect(authValue.user.email).toBe('user@example.com');
  });

  test('login throws on bad credentials', async () => {
    global.fetch.mockResolvedValueOnce(mockFetchFail(401, {}));

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; });
    });

    global.fetch.mockResolvedValueOnce(
      mockFetchFail(401, { error: 'Invalid email or password' })
    );

    await expect(
      act(async () => {
        await authValue.login('bad@example.com', 'wrong');
      })
    ).rejects.toThrow('Invalid email or password');
  });

  test('login trims email whitespace', async () => {
    global.fetch.mockResolvedValueOnce(mockFetchFail(401, {}));

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; });
    });

    global.fetch
      .mockResolvedValueOnce(
        mockFetchOk({ token: 'tok', email: 'user@example.com', membershipType: 'FREE' })
      )
      .mockResolvedValueOnce(
        mockFetchOk({ email: 'user@example.com', membershipType: 'FREE', emailVerified: true })
      );

    await act(async () => {
      await authValue.login('  user@example.com  ', 'pass');
    });

    const loginCall = global.fetch.mock.calls[1];
    const body = JSON.parse(loginCall[1].body);
    expect(body.email).toBe('user@example.com');
  });

  // ─── logout ───────────────────────────────────────────────────────────────

  test('logout clears user and removes token from localStorage', async () => {
    global.fetch.mockResolvedValue(
      mockFetchOk({ email: 'user@example.com', membershipType: 'FREE', emailVerified: true })
    );

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; }, 'valid-token');
    });

    act(() => {
      authValue.logout();
    });

    expect(authValue.user).toBeNull();
    expect(authValue.isLoggedIn).toBe(false);
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  // ─── signup ───────────────────────────────────────────────────────────────

  test('signup stores token when returned by server', async () => {
    global.fetch.mockResolvedValueOnce(mockFetchFail(401, {}));

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; });
    });

    global.fetch.mockResolvedValueOnce(
      mockFetchOk({ token: 'signup-token', email: 'new@example.com', membershipType: 'FREE' })
    );

    await act(async () => {
      await authValue.signup('new@example.com', 'pass123', 'New', 'User');
    });

    expect(localStorage.getItem('authToken')).toBe('signup-token');
  });

  test('signup throws on failure', async () => {
    global.fetch.mockResolvedValueOnce(mockFetchFail(401, {}));

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; });
    });

    global.fetch.mockResolvedValueOnce(
      mockFetchFail(400, { error: 'Email already registered' })
    );

    await expect(
      act(async () => {
        await authValue.signup('dup@example.com', 'pass', '', '');
      })
    ).rejects.toThrow('Email already registered');
  });

  // ─── isSubscribed ─────────────────────────────────────────────────────────

  test('isSubscribed is true when membershipType is MEMBER', async () => {
    global.fetch.mockResolvedValue(
      mockFetchOk({ email: 'user@example.com', membershipType: 'MEMBER', emailVerified: true })
    );

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; }, 'member-token');
    });

    expect(authValue.isSubscribed).toBe(true);
  });

  test('isSubscribed is false when membershipType is FREE', async () => {
    global.fetch.mockResolvedValue(
      mockFetchOk({ email: 'user@example.com', membershipType: 'FREE', emailVerified: true })
    );

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; }, 'free-token');
    });

    expect(authValue.isSubscribed).toBe(false);
  });

  test('isSubscribed is true when membershipType is GROWTH', async () => {
    global.fetch.mockResolvedValue(
      mockFetchOk({ email: 'user@example.com', membershipType: 'GROWTH', emailVerified: true })
    );

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; }, 'growth-token');
    });

    expect(authValue.isSubscribed).toBe(true);
  });

  // ─── emailVerified ────────────────────────────────────────────────────────

  test('emailVerified defaults to true when not provided by server', async () => {
    global.fetch.mockResolvedValue(
      mockFetchOk({ email: 'user@example.com', membershipType: 'FREE' })
    );

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; }, 'token');
    });

    expect(authValue.emailVerified).toBe(true);
  });

  test('emailVerified is false when server returns false', async () => {
    global.fetch.mockResolvedValue(
      mockFetchOk({ email: 'user@example.com', membershipType: 'FREE', emailVerified: false })
    );

    let authValue;
    await act(async () => {
      renderWithProvider((val) => { authValue = val; }, 'token');
    });

    expect(authValue.emailVerified).toBe(false);
  });
});
