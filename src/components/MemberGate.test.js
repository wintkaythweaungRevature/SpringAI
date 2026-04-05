import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MemberGate from './MemberGate';

const mockLogout = jest.fn();
const mockCheckoutSubscription = jest.fn();

function makeMockAuth(overrides = {}) {
  return {
    user: null,
    loading: false,
    isSubscribed: false,
    emailVerified: true,
    checkoutSubscription: mockCheckoutSubscription,
    logout: mockLogout,
    authAvailable: true,
    token: null,
    apiBase: 'http://localhost',
    ...overrides,
  };
}

let mockAuthValue = makeMockAuth();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

jest.mock('./Login', () =>
  function MockLogin({ onSwitchToSignup }) {
    return (
      <div data-testid="login-form">
        <button onClick={onSwitchToSignup}>Switch to Signup</button>
      </div>
    );
  }
);

jest.mock('./Signup', () =>
  function MockSignup({ onSwitchToLogin }) {
    return (
      <div data-testid="signup-form">
        <button onClick={onSwitchToLogin}>Switch to Login</button>
      </div>
    );
  }
);

function mockFetchSubscriptionThenCheckout() {
  global.fetch = jest.fn((url) => {
    const u = String(url);
    if (u.includes('/subscription/current')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ starterTrialEligible: false, plan: null }),
      });
    }
    if (u.includes('/checkout')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ url: 'https://checkout.example.test/session' }),
      });
    }
    return Promise.reject(new Error(`unexpected fetch: ${u}`));
  });
}

describe('MemberGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchSubscriptionThenCheckout();
    mockCheckoutSubscription.mockResolvedValue({});
    delete window.location;
    window.location = { href: '', assign: jest.fn() };
  });

  test('shows loading state when loading is true', () => {
    mockAuthValue = makeMockAuth({ loading: true });
    render(
      <MemberGate>
        <div>content</div>
      </MemberGate>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  test('shows Members Only and login form when user is not logged in', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(
      <MemberGate>
        <div>content</div>
      </MemberGate>
    );
    expect(screen.getByText('Members Only')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  test('shows feature name in login gate message', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(
      <MemberGate featureName="Image Generator">
        <div>content</div>
      </MemberGate>
    );
    expect(screen.getByText(/Image Generator/)).toBeInTheDocument();
  });

  test('switches to signup form when link is clicked', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(
      <MemberGate>
        <div>content</div>
      </MemberGate>
    );
    fireEvent.click(screen.getByText('Switch to Signup'));
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
  });

  test('switches back to login form from signup', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(
      <MemberGate>
        <div>content</div>
      </MemberGate>
    );
    fireEvent.click(screen.getByText('Switch to Signup'));
    fireEvent.click(screen.getByText('Switch to Login'));
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  test('shows verify email message when email not verified', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      emailVerified: false,
    });
    render(
      <MemberGate featureName="Image Generator">
        <div>content</div>
      </MemberGate>
    );
    expect(screen.getByText(/please verify your email/i)).toBeInTheDocument();
    expect(screen.getByText(/user@example\.com/)).toBeInTheDocument();
  });

  test('shows logout button on email verification screen', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      emailVerified: false,
    });
    render(
      <MemberGate>
        <div>content</div>
      </MemberGate>
    );
    const logoutBtn = screen.getByRole('button', { name: /log out/i });
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });

  test('shows unlock pro features when logged in but not subscribed', async () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      isSubscribed: false,
      emailVerified: true,
      token: 'tok',
      apiBase: 'http://x',
    });
    render(
      <MemberGate>
        <div>content</div>
      </MemberGate>
    );
    await waitFor(() => {
      expect(screen.getByText(/unlock pro features/i)).toBeInTheDocument();
    });
  });

  test('shows upgrade button when not subscribed', async () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      isSubscribed: false,
      emailVerified: true,
      token: 'tok',
      apiBase: 'http://x',
    });
    render(
      <MemberGate>
        <div>content</div>
      </MemberGate>
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /upgrade now/i })).toBeInTheDocument();
    });
  });

  test('starts checkout when upgrade button is clicked', async () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      isSubscribed: false,
      emailVerified: true,
      token: 'tok',
      apiBase: 'http://x',
    });
    render(
      <MemberGate>
        <div>content</div>
      </MemberGate>
    );
    await waitFor(() => screen.getByRole('button', { name: /upgrade now/i }));
    fireEvent.click(screen.getByRole('button', { name: /upgrade now/i }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://x/api/subscription/checkout',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  test('calls checkoutSubscription when trial button is clicked', async () => {
    global.fetch = jest.fn((url) => {
      const u = String(url);
      if (u.includes('/subscription/current')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ starterTrialEligible: true, plan: null }),
        });
      }
      return Promise.reject(new Error(`unexpected fetch: ${u}`));
    });
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      isSubscribed: false,
      emailVerified: true,
      token: 'tok',
      apiBase: 'http://x',
    });
    render(
      <MemberGate>
        <div>content</div>
      </MemberGate>
    );
    await waitFor(() => screen.getByRole('button', { name: /7-day free trial/i }));
    fireEvent.click(screen.getByRole('button', { name: /7-day free trial/i }));
    await waitFor(() => expect(mockCheckoutSubscription).toHaveBeenCalled());
  });

  test('shows logout button on subscription required screen', async () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      isSubscribed: false,
      emailVerified: true,
      token: 'tok',
      apiBase: 'http://x',
    });
    render(
      <MemberGate>
        <div>content</div>
      </MemberGate>
    );
    await waitFor(() => screen.getByText(/unlock pro features/i));
    const logoutBtn = screen.getByRole('button', { name: /^log out$/i });
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });

  test('renders children when user is logged in and subscribed', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      isSubscribed: true,
      emailVerified: true,
    });
    render(
      <MemberGate>
        <div>protected content</div>
      </MemberGate>
    );
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });

  test('bypasses gate and renders children when authAvailable is false', () => {
    mockAuthValue = makeMockAuth({ authAvailable: false });
    render(
      <MemberGate>
        <div>bypass content</div>
      </MemberGate>
    );
    expect(screen.getByText('bypass content')).toBeInTheDocument();
  });

  test('does not render protected content to unauthenticated users', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(
      <MemberGate>
        <div>secret content</div>
      </MemberGate>
    );
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
  });

  test('does not render protected content when email not verified', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      emailVerified: false,
    });
    render(
      <MemberGate>
        <div>secret content</div>
      </MemberGate>
    );
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
  });

  test('does not render protected content when not subscribed', async () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      isSubscribed: false,
      emailVerified: true,
      token: 'tok',
      apiBase: 'http://x',
    });
    render(
      <MemberGate>
        <div>secret content</div>
      </MemberGate>
    );
    await waitFor(() => screen.getByText(/unlock pro features/i));
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
  });
});
