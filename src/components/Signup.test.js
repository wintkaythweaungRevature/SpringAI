import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from './Signup';

const mockSignup = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    signup: mockSignup,
    resendVerification: jest.fn(),
  }),
}));

describe('Signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Create an account heading', () => {
    render(<Signup />);
    expect(screen.getByText('Create an account')).toBeInTheDocument();
  });

  test('renders first name, last name, email, and password inputs', () => {
    render(<Signup />);
    expect(screen.getByPlaceholderText('Jane')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/at least 6 characters/i)).toBeInTheDocument();
  });

  test('renders Create Account button', () => {
    render(<Signup />);
    expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument();
  });

  test('renders Sign in link', () => {
    render(<Signup />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('calls signup with email, password, firstName, lastName on submit', async () => {
    mockSignup.mockResolvedValueOnce({ token: 'x', emailVerified: true });
    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText('Jane'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByPlaceholderText('Doe'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/at least 6 characters/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

    await waitFor(() =>
      expect(mockSignup).toHaveBeenCalledWith('user@example.com', 'pass123', 'Jane', 'Doe')
    );
  });

  test('shows Account created after successful signup with token', async () => {
    mockSignup.mockResolvedValueOnce({ token: 'x', emailVerified: true });
    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/at least 6 characters/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

    await waitFor(() =>
      expect(screen.getByText(/account created/i)).toBeInTheDocument()
    );
  });

  test('shows Go to Sign In button after successful signup', async () => {
    mockSignup.mockResolvedValueOnce({ token: 'x', emailVerified: true });
    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/at least 6 characters/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /go to sign in/i })).toBeInTheDocument()
    );
  });

  test('shows verify email screen when token is null and emailVerified is false', async () => {
    mockSignup.mockResolvedValueOnce({ token: null, emailVerified: false, email: 'user@example.com' });
    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/at least 6 characters/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

    await waitFor(() =>
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    );
  });

  test('calls onSwitchToLogin from success screen', async () => {
    mockSignup.mockResolvedValueOnce({ token: 'x', emailVerified: true });
    const onSwitchToLogin = jest.fn();
    render(<Signup onSwitchToLogin={onSwitchToLogin} />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/at least 6 characters/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

    await waitFor(() => screen.getByRole('button', { name: /go to sign in/i }));
    fireEvent.click(screen.getByRole('button', { name: /go to sign in/i }));
    expect(onSwitchToLogin).toHaveBeenCalled();
  });

  test('shows error message on signup failure', async () => {
    mockSignup.mockRejectedValueOnce(new Error('Email already registered'));
    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'dup@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/at least 6 characters/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

    await waitFor(() =>
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    );
  });

  test('calls onSwitchToLogin when Sign in link is clicked', () => {
    const onSwitchToLogin = jest.fn();
    render(<Signup onSwitchToLogin={onSwitchToLogin} />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(onSwitchToLogin).toHaveBeenCalled();
  });

  test('shows loading state while signing up', async () => {
    mockSignup.mockImplementationOnce(() => new Promise(() => {}));
    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/at least 6 characters/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

    expect(await screen.findByRole('button', { name: /creating account/i })).toBeDisabled();
  });

  test('does not show success when signup throws', async () => {
    mockSignup.mockRejectedValueOnce(new Error('Server error'));
    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/at least 6 characters/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

    await waitFor(() => screen.getByText('Server error'));
    expect(screen.queryByText(/account created/i)).not.toBeInTheDocument();
  });
});
