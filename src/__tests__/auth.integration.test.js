/**
 * Auth Integration Tests
 *
 * These tests use the REAL AuthProvider (no mock) combined with real
 * Login/Signup/MemberGate/AskAIGate components to verify end-to-end
 * user authentication flows. fetch() is mocked at the network layer.
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import Login from '../components/Login';
import Signup from '../components/Signup';
import MemberGate from '../components/MemberGate';
import AskAIGate from '../components/AskAIGate';

function makeOkResponse(data) {
  return { ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) };
}
function makeFailResponse(status, data) {
  return { ok: false, status, json: async () => data, text: async () => JSON.stringify(data) };
}

function Wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('Auth Integration: Login flow', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('Feature: user can log in successfully and onSuccess callback fires', async () => {
    // Initial AuthProvider mount (no token) probes /api/auth/me → 401
    global.fetch.mockResolvedValueOnce(makeFailResponse(401, {}));

    const onSuccess = jest.fn();
    await act(async () => {
      render(
        <Wrapper>
          <Login onSuccess={onSuccess} />
        </Wrapper>
      );
    });

    // Login POST → success, /me GET → user details
    global.fetch
      .mockResolvedValueOnce(
        makeOkResponse({ token: 'tok123', email: 'user@example.com', membershipType: 'FREE' })
      )
      .mockResolvedValueOnce(
        makeOkResponse({ email: 'user@example.com', membershipType: 'FREE', emailVerified: true })
      );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(localStorage.getItem('authToken')).toBe('tok123');
  });

  test('Feature: login shows error when credentials are wrong', async () => {
    global.fetch.mockResolvedValueOnce(makeFailResponse(401, {}));

    await act(async () => {
      render(
        <Wrapper>
          <Login />
        </Wrapper>
      );
    });

    global.fetch.mockResolvedValueOnce(
      makeFailResponse(401, { error: 'Invalid email or password' })
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() =>
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    );
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  test('Feature: deactivated account shows reactivate option then reactivates', async () => {
    global.fetch.mockResolvedValueOnce(makeFailResponse(401, {}));

    const onSuccess = jest.fn();
    await act(async () => {
      render(
        <Wrapper>
          <Login onSuccess={onSuccess} />
        </Wrapper>
      );
    });

    // Login fails with deactivated message
    global.fetch.mockResolvedValueOnce(
      makeFailResponse(401, { error: 'Account is deactivated' })
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /reactivate account/i })).toBeInTheDocument()
    );

    // Reactivate POST → success, /me → user data
    global.fetch
      .mockResolvedValueOnce(
        makeOkResponse({ token: 'reactivated-tok', email: 'user@example.com', membershipType: 'FREE' })
      )
      .mockResolvedValueOnce(
        makeOkResponse({ email: 'user@example.com', membershipType: 'FREE', emailVerified: true })
      );

    fireEvent.click(screen.getByRole('button', { name: /reactivate account/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });
});

describe('Auth Integration: Signup flow', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('Feature: user can sign up and sees success message', async () => {
    global.fetch.mockResolvedValueOnce(makeFailResponse(401, {}));

    await act(async () => {
      render(
        <Wrapper>
          <Signup />
        </Wrapper>
      );
    });

    global.fetch.mockResolvedValueOnce(
      makeOkResponse({ token: 'new-tok', email: 'new@example.com', membershipType: 'FREE' })
    );

    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'New User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await waitFor(() =>
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument()
    );
  });

  test('Feature: duplicate email shows error', async () => {
    global.fetch.mockResolvedValueOnce(makeFailResponse(401, {}));

    await act(async () => {
      render(
        <Wrapper>
          <Signup />
        </Wrapper>
      );
    });

    global.fetch.mockResolvedValueOnce(
      makeFailResponse(400, { error: 'Email already registered' })
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'dup@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await waitFor(() =>
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    );
  });
});

describe('Auth Integration: MemberGate access control', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('Feature: unauthenticated user sees login form, not protected content', async () => {
    // No token → probe returns 401
    global.fetch.mockResolvedValue(makeFailResponse(401, {}));

    await act(async () => {
      render(
        <Wrapper>
          <MemberGate>
            <div>secret member content</div>
          </MemberGate>
        </Wrapper>
      );
    });

    expect(screen.queryByText('secret member content')).not.toBeInTheDocument();
    expect(screen.getByText('Members Only')).toBeInTheDocument();
  });

  test('Feature: free user sees upgrade prompt, not member content', async () => {
    global.fetch.mockResolvedValue(
      makeOkResponse({ email: 'free@example.com', membershipType: 'FREE', emailVerified: true })
    );

    await act(async () => {
      render(
        <Wrapper>
          <MemberGate>
            <div>member only content</div>
          </MemberGate>
        </Wrapper>
      );
    });

    expect(screen.queryByText('member only content')).not.toBeInTheDocument();
    expect(screen.getByText(/member subscription required/i)).toBeInTheDocument();
  });

  test('Feature: subscribed user sees protected content', async () => {
    global.fetch.mockResolvedValue(
      makeOkResponse({ email: 'member@example.com', membershipType: 'MEMBER', emailVerified: true })
    );

    await act(async () => {
      render(
        <Wrapper>
          <MemberGate>
            <div>member only content</div>
          </MemberGate>
        </Wrapper>
      );
    });

    await waitFor(() =>
      expect(screen.getByText('member only content')).toBeInTheDocument()
    );
  });

  test('Feature: user with unverified email sees verification screen', async () => {
    global.fetch.mockResolvedValue(
      makeOkResponse({ email: 'unverified@example.com', membershipType: 'FREE', emailVerified: false })
    );

    await act(async () => {
      render(
        <Wrapper>
          <MemberGate>
            <div>protected</div>
          </MemberGate>
        </Wrapper>
      );
    });

    await waitFor(() =>
      expect(screen.getByText(/please verify your email/i)).toBeInTheDocument()
    );
    expect(screen.queryByText('protected')).not.toBeInTheDocument();
  });
});

describe('Auth Integration: AskAIGate access control', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('Feature: free verified user can access Ask AI (no subscription needed)', async () => {
    global.fetch.mockResolvedValue(
      makeOkResponse({ email: 'free@example.com', membershipType: 'FREE', emailVerified: true })
    );

    await act(async () => {
      render(
        <Wrapper>
          <AskAIGate featureName="Ask AI">
            <div>ask ai interface</div>
          </AskAIGate>
        </Wrapper>
      );
    });

    await waitFor(() =>
      expect(screen.getByText('ask ai interface')).toBeInTheDocument()
    );
  });

  test('Feature: unauthenticated user cannot access Ask AI', async () => {
    global.fetch.mockResolvedValue(makeFailResponse(401, {}));

    await act(async () => {
      render(
        <Wrapper>
          <AskAIGate featureName="Ask AI">
            <div>ask ai interface</div>
          </AskAIGate>
        </Wrapper>
      );
    });

    expect(screen.queryByText('ask ai interface')).not.toBeInTheDocument();
    expect(screen.getByText(/sign in to use Ask AI/i)).toBeInTheDocument();
  });
});
