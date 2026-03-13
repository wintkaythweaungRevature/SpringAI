import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

const mockLogin = jest.fn();
const mockReactivateAccount = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    reactivateAccount: mockReactivateAccount,
  }),
}));

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Member Login heading', () => {
    render(<Login />);
    expect(screen.getByText('Member Login')).toBeInTheDocument();
  });

  test('renders email and password inputs', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  test('renders Login button', () => {
    render(<Login />);
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  test('renders Sign up link', () => {
    render(<Login />);
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('calls login with email and password on submit', async () => {
    mockLogin.mockResolvedValueOnce({});
    const onSuccess = jest.fn();
    render(<Login onSuccess={onSuccess} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'pass123')
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  test('shows error message when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid email or password'));
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() =>
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    );
  });

  test('shows reactivate option when account is deactivated', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Account is deactivated'));
    render(<Login />);

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
  });

  test('calls reactivateAccount when reactivate button is clicked', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Account is deactivated'));
    mockReactivateAccount.mockResolvedValueOnce({});
    const onSuccess = jest.fn();
    render(<Login onSuccess={onSuccess} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => screen.getByRole('button', { name: /reactivate account/i }));
    fireEvent.click(screen.getByRole('button', { name: /reactivate account/i }));

    await waitFor(() =>
      expect(mockReactivateAccount).toHaveBeenCalledWith('user@example.com', 'pass')
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  test('calls onSwitchToSignup when sign up link is clicked', () => {
    const onSwitchToSignup = jest.fn();
    render(<Login onSwitchToSignup={onSwitchToSignup} />);
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(onSwitchToSignup).toHaveBeenCalled();
  });

  test('shows loading state while logging in', async () => {
    mockLogin.mockImplementationOnce(() => new Promise(() => {}));
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    expect(await screen.findByRole('button', { name: /logging in/i })).toBeDisabled();
  });

  test('does not call onSuccess when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Bad credentials'));
    const onSuccess = jest.fn();
    render(<Login onSuccess={onSuccess} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => screen.getByText('Bad credentials'));
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
