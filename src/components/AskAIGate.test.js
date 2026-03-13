import { render, screen, fireEvent } from '@testing-library/react';
import AskAIGate from './AskAIGate';

const mockLogout = jest.fn();

function makeMockAuth(overrides = {}) {
  return {
    user: null,
    loading: false,
    emailVerified: true,
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

describe('AskAIGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state when loading is true', () => {
    mockAuthValue = makeMockAuth({ loading: true });
    render(<AskAIGate><div>ai content</div></AskAIGate>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('ai content')).not.toBeInTheDocument();
  });

  test('shows login form when user is not logged in', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(<AskAIGate featureName="Ask AI"><div>ai content</div></AskAIGate>);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByText(/sign in to use Ask AI/i)).toBeInTheDocument();
  });

  test('shows custom feature name in prompt', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(<AskAIGate featureName="Recipe Generator"><div>content</div></AskAIGate>);
    expect(screen.getByText(/sign in to use Recipe Generator/i)).toBeInTheDocument();
  });

  test('shows "It\'s free!" message on login gate', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(<AskAIGate featureName="Ask AI"><div>content</div></AskAIGate>);
    expect(screen.getByText(/it's free/i)).toBeInTheDocument();
  });

  test('switches to signup form when link is clicked', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(<AskAIGate><div>content</div></AskAIGate>);
    fireEvent.click(screen.getByText('Switch to Signup'));
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
  });

  test('switches back to login from signup', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(<AskAIGate><div>content</div></AskAIGate>);
    fireEvent.click(screen.getByText('Switch to Signup'));
    fireEvent.click(screen.getByText('Switch to Login'));
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  test('shows verify email message when email not verified', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      emailVerified: false,
    });
    render(<AskAIGate featureName="Ask AI"><div>content</div></AskAIGate>);
    expect(screen.getByText(/please verify your email/i)).toBeInTheDocument();
    expect(screen.getByText(/user@example\.com/)).toBeInTheDocument();
  });

  test('calls logout when logout button clicked on verify email screen', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      emailVerified: false,
    });
    render(<AskAIGate><div>content</div></AskAIGate>);
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    expect(mockLogout).toHaveBeenCalled();
  });

  test('renders children when user is logged in and email verified', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      emailVerified: true,
    });
    render(<AskAIGate><div>ai content</div></AskAIGate>);
    expect(screen.getByText('ai content')).toBeInTheDocument();
  });

  test('bypasses gate and renders children when authAvailable is false', () => {
    mockAuthValue = makeMockAuth({ authAvailable: false });
    render(<AskAIGate><div>bypass content</div></AskAIGate>);
    expect(screen.getByText('bypass content')).toBeInTheDocument();
  });

  test('does not render children when user is not logged in', () => {
    mockAuthValue = makeMockAuth({ user: null });
    render(<AskAIGate><div>hidden content</div></AskAIGate>);
    expect(screen.queryByText('hidden content')).not.toBeInTheDocument();
  });

  test('does not render children when email not verified', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      emailVerified: false,
    });
    render(<AskAIGate><div>hidden content</div></AskAIGate>);
    expect(screen.queryByText('hidden content')).not.toBeInTheDocument();
  });

  test('does NOT require subscription (unlike MemberGate)', () => {
    // AskAIGate only needs login + email verified, no subscription
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com' },
      emailVerified: true,
      isSubscribed: false, // free user
    });
    render(<AskAIGate><div>free content</div></AskAIGate>);
    expect(screen.getByText('free content')).toBeInTheDocument();
  });
});
