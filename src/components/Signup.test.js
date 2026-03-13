import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from './Signup';

const mockSignup = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    signup: mockSignup,
  }),
}));

describe('Signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Member Registration heading', () => {
    render(<Signup />);
    expect(screen.getByText('Member Registration')).toBeInTheDocument();
  });

  test('renders name, email, and password inputs', () => {
    render(<Signup />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  test('renders Sign Up button', () => {
    render(<Signup />);
    expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument();
  });

  test('renders Log in link', () => {
    render(<Signup />);
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('calls signup with email, password, and name on submit', async () => {
    mockSignup.mockResolvedValueOnce({});
    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await waitFor(() =>
      expect(mockSignup).toHaveBeenCalledWith('user@example.com', 'pass123', 'Test User')
    );
  });

  test('shows success message after successful signup', async () => {
    mockSignup.mockResolvedValueOnce({});
    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await waitFor(() =>
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument()
    );
  });

  test('shows Go to Login button after successful signup', async () => {
    mockSignup.mockResolvedValueOnce({});
    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /go to login/i })).toBeInTheDocument()
    );
  });

  test('calls onSwitchToLogin from success screen', async () => {
    mockSignup.mockResolvedValueOnce({});
    const onSwitchToLogin = jest.fn();
    render(<Signup onSwitchToLogin={onSwitchToLogin} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await waitFor(() => screen.getByRole('button', { name: /go to login/i }));
    fireEvent.click(screen.getByRole('button', { name: /go to login/i }));
    expect(onSwitchToLogin).toHaveBeenCalled();
  });

  test('shows error message on signup failure', async () => {
    mockSignup.mockRejectedValueOnce(new Error('Email already registered'));
    render(<Signup />);

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

  test('calls onSwitchToLogin when Log in link is clicked', () => {
    const onSwitchToLogin = jest.fn();
    render(<Signup onSwitchToLogin={onSwitchToLogin} />);
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(onSwitchToLogin).toHaveBeenCalled();
  });

  test('shows loading state while signing up', async () => {
    mockSignup.mockImplementationOnce(() => new Promise(() => {}));
    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    expect(await screen.findByRole('button', { name: /creating account/i })).toBeDisabled();
  });

  test('does not show success when signup throws', async () => {
    mockSignup.mockRejectedValueOnce(new Error('Server error'));
    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await waitFor(() => screen.getByText('Server error'));
    expect(screen.queryByText(/registration successful/i)).not.toBeInTheDocument();
  });
});
