import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Signup from '../components/Signup';

const mockSignup = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    signup: mockSignup,
  }),
}));

function renderSignup(props = {}) {
  const defaults = {
    onSuccess: jest.fn(),
    onSwitchToLogin: jest.fn(),
    ...props,
  };
  return { ...render(<Signup {...defaults} />), ...defaults };
}

describe('Signup component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders name, email, and password inputs', () => {
    renderSignup();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('renders the Sign Up button', () => {
    renderSignup();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('renders "Already a member? Log in" link', () => {
    renderSignup();
    expect(screen.getByText(/already a member/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('calls onSwitchToLogin when Log in is clicked', async () => {
    const { onSwitchToLogin } = renderSignup();
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(onSwitchToLogin).toHaveBeenCalledTimes(1);
  });

  it('calls signup with name, email, and password on submit', async () => {
    mockSignup.mockResolvedValue({ token: 'fake-token' });
    const { onSuccess } = renderSignup();

    await userEvent.type(screen.getByPlaceholderText('Name'), 'Wint');
    await userEvent.type(screen.getByPlaceholderText('Email'), 'wint@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'secure123');
    fireEvent.submit(screen.getByRole('button', { name: /sign up/i }).closest('form'));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('wint@example.com', 'secure123', 'Wint');
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('shows success message after successful signup', async () => {
    mockSignup.mockResolvedValue({ token: 'fake-token' });
    renderSignup();

    await userEvent.type(screen.getByPlaceholderText('Email'), 'wint@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'secure123');
    fireEvent.submit(screen.getByRole('button', { name: /sign up/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
  });

  it('shows error on signup failure', async () => {
    mockSignup.mockRejectedValue(new Error('Email already registered'));
    renderSignup();

    await userEvent.type(screen.getByPlaceholderText('Email'), 'existing@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'pass123');
    fireEvent.submit(screen.getByRole('button', { name: /sign up/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });

  it('disables button while loading', async () => {
    let resolve;
    mockSignup.mockReturnValue(new Promise(r => { resolve = r; }));
    renderSignup();

    await userEvent.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'pass123');
    fireEvent.submit(screen.getByRole('button', { name: /sign up/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });
    resolve({});
  });
});
