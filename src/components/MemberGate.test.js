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

describe('MemberGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state when loading is true', () => {
    mockAuthValue = makeMockAuth({ loading: true });
    render(<MemberGate><div>content</div></MemberGate>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  test('shows Members Only and login form when user is not logged in', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(<MemberGate><div>content</div></MemberGate>);
    expect(screen.getByText('Members Only')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  test('shows feature name in login gate message', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(<MemberGate featureName="Image Generator"><div>content</div></MemberGate>);
    expect(screen.getByText(/Image Generator/)).toBeInTheDocument();
  });

  test('switches to signup form when link is clicked', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(<MemberGate><div>content</div></MemberGate>);
    fireEvent.click(screen.getByText('Switch to Signup'));
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
  });

  test('switches back to login form from signup', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(<MemberGate><div>content</div></MemberGate>);
    fireEvent.click(screen.getByText('Switch to Signup'));
    fireEvent.click(screen.getByText('Switch to Login'));
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  test('shows verify email message when email not verified', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      emailVerified: false,
    });
    render(<MemberGate featureName="Image Generator"><div>content</div></MemberGate>);
    expect(screen.getByText(/please verify your email/i)).toBeInTheDocument();
    expect(screen.getByText(/user@example\.com/)).toBeInTheDocument();
  });

  test('shows logout button on email verification screen', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      emailVerified: false,
    });
    render(<MemberGate><div>content</div></MemberGate>);
    const logoutBtn = screen.getByRole('button', { name: /log out/i });
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });

  test('shows member subscription required when logged in but not subscribed', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      isSubscribed: false,
      emailVerified: true,
    });
    render(<MemberGate><div>content</div></MemberGate>);
    expect(screen.getByText(/member subscription required/i)).toBeInTheDocument();
  });

  test('shows upgrade button when not subscribed', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      isSubscribed: false,
      emailVerified: true,
    });
    render(<MemberGate><div>content</div></MemberGate>);
    expect(screen.getByRole('button', { name: /upgrade/i })).toBeInTheDocument();
  });

  test('calls checkoutSubscription when upgrade button is clicked', async () => {
    mockCheckoutSubscription.mockResolvedValueOnce({});
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      isSubscribed: false,
      emailVerified: true,
    });
    render(<MemberGate><div>content</div></MemberGate>);
    fireEvent.click(screen.getByRole('button', { name: /upgrade/i }));
    await waitFor(() => expect(mockCheckoutSubscription).toHaveBeenCalled());
  });

  test('shows logout button on subscription required screen', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      isSubscribed: false,
      emailVerified: true,
    });
    render(<MemberGate><div>content</div></MemberGate>);
    const logoutBtn = screen.getByRole('button', { name: /log out/i });
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });

  test('renders children when user is logged in and subscribed', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      isSubscribed: true,
      emailVerified: true,
    });
    render(<MemberGate><div>protected content</div></MemberGate>);
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });

  test('bypasses gate and renders children when authAvailable is false', () => {
    mockAuthValue = makeMockAuth({ authAvailable: false });
    render(<MemberGate><div>bypass content</div></MemberGate>);
    expect(screen.getByText('bypass content')).toBeInTheDocument();
  });

  test('does not render protected content to unauthenticated users', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(<MemberGate><div>secret content</div></MemberGate>);
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
  });

  test('does not render protected content when email not verified', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      emailVerified: false,
    });
    render(<MemberGate><div>secret content</div></MemberGate>);
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
  });

  test('does not render protected content when not subscribed', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      isSubscribed: false,
      emailVerified: true,
    });
    render(<MemberGate><div>secret content</div></MemberGate>);
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
  });
});
