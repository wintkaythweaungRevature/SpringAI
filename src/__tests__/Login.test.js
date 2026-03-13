import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../components/Login';

// Mock AuthContext
const mockLogin = jest.fn();
const mockReactivateAccount = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    reactivateAccount: mockReactivateAccount,
  }),
}));

function renderLogin(props = {}) {
  const defaults = {
    onSuccess: jest.fn(),
    onSwitchToSignup: jest.fn(),
    ...props,
  };
  return { ...render(<Login {...defaults} />), ...defaults };
}

describe('Login component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password inputs', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('renders the login button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('renders "Not a member? Sign up" link', () => {
    renderLogin();
    expect(screen.getByText(/not a member/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('calls onSwitchToSignup when Sign up is clicked', async () => {
    const { onSwitchToSignup } = renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(onSwitchToSignup).toHaveBeenCalledTimes(1);
  });

  it('calls login with entered email and password on submit', async () => {
    mockLogin.mockResolvedValue({});
    const { onSuccess } = renderLogin();

    await userEvent.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.submit(screen.getByRole('button', { name: /login/i }).closest('form'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error message on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid email or password'));
    renderLogin();

    await userEvent.type(screen.getByPlaceholderText('Email'), 'wrong@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'wrongpass');
    fireEvent.submit(screen.getByPlaceholderText('Email').closest('form'));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('shows Reactivate Account button when account is deactivated', async () => {
    mockLogin.mockRejectedValue(new Error('Account is deactivated'));
    renderLogin();

    await userEvent.type(screen.getByPlaceholderText('Email'), 'user@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'pass');
    fireEvent.submit(screen.getByPlaceholderText('Email').closest('form'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reactivate account/i })).toBeInTheDocument();
    });
  });

  it('calls reactivateAccount when Reactivate button is clicked', async () => {
    mockLogin.mockRejectedValue(new Error('Account is deactivated'));
    mockReactivateAccount.mockResolvedValue({});
    const { onSuccess } = renderLogin();

    await userEvent.type(screen.getByPlaceholderText('Email'), 'user@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'pass');
    fireEvent.submit(screen.getByPlaceholderText('Email').closest('form'));

    await waitFor(() => screen.getByRole('button', { name: /reactivate account/i }));
    await userEvent.click(screen.getByRole('button', { name: /reactivate account/i }));

    await waitFor(() => {
      expect(mockReactivateAccount).toHaveBeenCalledWith('user@example.com', 'pass');
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('disables login button while loading', async () => {
    let resolve;
    mockLogin.mockReturnValue(new Promise(r => { resolve = r; }));
    renderLogin();

    await userEvent.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'pass');
    fireEvent.submit(screen.getByPlaceholderText('Email').closest('form'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
    });
    resolve({});
  });
});
