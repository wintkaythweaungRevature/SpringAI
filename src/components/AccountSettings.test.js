import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccountSettings from './AccountSettings';

const mockCheckoutSubscription = jest.fn();
const mockCancelSubscription = jest.fn();
const mockReactivateSubscription = jest.fn();
const mockOpenBillingPortal = jest.fn();
const mockDeactivateAccount = jest.fn();
const mockLogout = jest.fn();

function makeMockAuth(overrides = {}) {
  return {
    user: { email: 'user@example.com' },
    token: 'test-token',
    apiBase: 'http://localhost',
    authHeaders: () => ({ Authorization: 'Bearer test-token' }),
    refetchUser: jest.fn().mockResolvedValue(undefined),
    isSubscribed: false,
    checkoutSubscription: mockCheckoutSubscription,
    cancelSubscription: mockCancelSubscription,
    reactivateSubscription: mockReactivateSubscription,
    openBillingPortal: mockOpenBillingPortal,
    deactivateAccount: mockDeactivateAccount,
    logout: mockLogout,
    ...overrides,
  };
}

let mockAuthValue = makeMockAuth();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

describe('AccountSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        plan: 'PRO',
        billingInterval: 'YEARLY',
        cancelAtPeriodEnd: false,
      }),
    });
  });

  afterEach(() => {
    if (jest.isMockFunction(global.fetch)) global.fetch.mockClear();
  });

  // ─── Rendering ───────────────────────────────────────────────────────────────

  test('renders Account Settings heading', () => {
    mockAuthValue = makeMockAuth();
    render(<AccountSettings />);
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
  });

  test('displays user email', () => {
    mockAuthValue = makeMockAuth();
    render(<AccountSettings />);
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  test('shows Subscription and Billing sections', () => {
    mockAuthValue = makeMockAuth();
    render(<AccountSettings />);
    expect(screen.getByText('Subscription')).toBeInTheDocument();
    expect(screen.getByText('Billing & Invoices')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /deactivate account/i })).toBeInTheDocument();
  });

  // ─── Free user ───────────────────────────────────────────────────────────────

  test('shows Free badge for free user', () => {
    mockAuthValue = makeMockAuth({ isSubscribed: false });
    render(<AccountSettings />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  test('shows upgrade button for free user', () => {
    mockAuthValue = makeMockAuth({ isSubscribed: false });
    render(<AccountSettings />);
    expect(
      screen.getByRole('button', { name: /upgrade.*\$19/i })
    ).toBeInTheDocument();
  });

  test('calls checkoutSubscription when upgrade button is clicked', async () => {
    mockCheckoutSubscription.mockResolvedValueOnce({});
    mockAuthValue = makeMockAuth({ isSubscribed: false });
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /upgrade.*\$19/i }));
    await waitFor(() => expect(mockCheckoutSubscription).toHaveBeenCalled());
  });

  test('shows error banner when checkout fails', async () => {
    mockCheckoutSubscription.mockRejectedValueOnce(new Error('Checkout failed'));
    mockAuthValue = makeMockAuth({ isSubscribed: false });
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /upgrade.*\$19/i }));
    await waitFor(() =>
      expect(screen.getByText(/checkout failed/i)).toBeInTheDocument()
    );
  });

  // ─── Member user (active) ─────────────────────────────────────────────────

  test('shows Member badge for subscribed user', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com', cancelAtPeriodEnd: false },
      isSubscribed: true,
    });
    render(<AccountSettings />);
    expect(screen.getByText('Member')).toBeInTheDocument();
  });

  test('shows annual upsell when subscription is monthly on a paid tier', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        plan: 'PRO',
        billingInterval: 'MONTHLY',
        cancelAtPeriodEnd: false,
      }),
    });
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com', membershipType: 'PRO', cancelAtPeriodEnd: false },
      isSubscribed: true,
    });
    render(<AccountSettings />);
    await waitFor(() => {
      expect(screen.getByText(/you are on a monthly billing plan/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /get pro annual plan/i })).toBeInTheDocument();
  });

  test('shows Cancel Subscription button for active member', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com', cancelAtPeriodEnd: false },
      isSubscribed: true,
    });
    render(<AccountSettings />);
    expect(
      screen.getByRole('button', { name: /cancel subscription/i })
    ).toBeInTheDocument();
  });

  test('shows confirmation dialog when Cancel Subscription is clicked', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com', cancelAtPeriodEnd: false },
      isSubscribed: true,
    });
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /cancel subscription/i }));
    expect(screen.getByRole('button', { name: /confirm cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /keep subscription/i })).toBeInTheDocument();
  });

  test('hides confirm dialog when Keep Subscription is clicked', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com', cancelAtPeriodEnd: false },
      isSubscribed: true,
    });
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /cancel subscription/i }));
    fireEvent.click(screen.getByRole('button', { name: /keep subscription/i }));
    expect(screen.queryByRole('button', { name: /confirm cancel/i })).not.toBeInTheDocument();
  });

  test('calls cancelSubscription when Confirm Cancel is clicked', async () => {
    mockCancelSubscription.mockResolvedValueOnce({});
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com', cancelAtPeriodEnd: false },
      isSubscribed: true,
    });
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /cancel subscription/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm cancel/i }));
    await waitFor(() => expect(mockCancelSubscription).toHaveBeenCalled());
  });

  test('shows success banner after cancellation', async () => {
    mockCancelSubscription.mockResolvedValueOnce({});
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com', cancelAtPeriodEnd: false },
      isSubscribed: true,
    });
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /cancel subscription/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm cancel/i }));
    await waitFor(() =>
      expect(screen.getByText(/subscription will cancel/i)).toBeInTheDocument()
    );
  });

  // ─── Member with cancelAtPeriodEnd ───────────────────────────────────────────

  test('shows Cancels badge when subscription is set to cancel', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com', cancelAtPeriodEnd: true },
      isSubscribed: true,
    });
    render(<AccountSettings />);
    expect(screen.getByText(/cancels/i)).toBeInTheDocument();
  });

  test('shows Reactivate Subscription button when cancelAtPeriodEnd is true', () => {
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com', cancelAtPeriodEnd: true },
      isSubscribed: true,
    });
    render(<AccountSettings />);
    expect(
      screen.getByRole('button', { name: /reactivate subscription/i })
    ).toBeInTheDocument();
  });

  test('calls reactivateSubscription when reactivate is clicked', async () => {
    mockReactivateSubscription.mockResolvedValueOnce({});
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com', cancelAtPeriodEnd: true },
      isSubscribed: true,
    });
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /reactivate subscription/i }));
    await waitFor(() => expect(mockReactivateSubscription).toHaveBeenCalled());
  });

  test('shows success banner after reactivation', async () => {
    mockReactivateSubscription.mockResolvedValueOnce({});
    mockAuthValue = makeMockAuth({
      user: { email: 'user@example.com', cancelAtPeriodEnd: true },
      isSubscribed: true,
    });
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /reactivate subscription/i }));
    await waitFor(() =>
      expect(screen.getByText(/subscription reactivated/i)).toBeInTheDocument()
    );
  });

  // ─── Billing portal ───────────────────────────────────────────────────────────

  test('shows Manage Billing & Invoices button', () => {
    mockAuthValue = makeMockAuth();
    render(<AccountSettings />);
    expect(
      screen.getByRole('button', { name: /manage billing/i })
    ).toBeInTheDocument();
  });

  test('calls openBillingPortal when billing button is clicked', async () => {
    mockOpenBillingPortal.mockResolvedValueOnce({});
    mockAuthValue = makeMockAuth();
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /manage billing/i }));
    await waitFor(() => expect(mockOpenBillingPortal).toHaveBeenCalled());
  });

  test('shows error banner when billing portal fails', async () => {
    mockOpenBillingPortal.mockRejectedValueOnce(new Error('Portal unavailable'));
    mockAuthValue = makeMockAuth();
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /manage billing/i }));
    await waitFor(() =>
      expect(screen.getByText(/portal unavailable/i)).toBeInTheDocument()
    );
  });

  // ─── Deactivate account ───────────────────────────────────────────────────────

  test('shows Deactivate Account button', () => {
    mockAuthValue = makeMockAuth();
    render(<AccountSettings />);
    expect(
      screen.getByRole('button', { name: /^deactivate account$/i })
    ).toBeInTheDocument();
  });

  test('shows password input and confirm button after clicking Deactivate Account', () => {
    mockAuthValue = makeMockAuth();
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /^deactivate account$/i }));
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /confirm deactivate/i })
    ).toBeInTheDocument();
  });

  test('confirm deactivate button is disabled without password', () => {
    mockAuthValue = makeMockAuth();
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /^deactivate account$/i }));
    expect(
      screen.getByRole('button', { name: /confirm deactivate/i })
    ).toBeDisabled();
  });

  test('confirm deactivate button is enabled when password is entered', () => {
    mockAuthValue = makeMockAuth();
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /^deactivate account$/i }));
    fireEvent.change(screen.getByPlaceholderText('Your password'), {
      target: { value: 'mypassword' },
    });
    expect(
      screen.getByRole('button', { name: /confirm deactivate/i })
    ).not.toBeDisabled();
  });

  test('calls deactivateAccount with password when confirmed', async () => {
    mockDeactivateAccount.mockResolvedValueOnce({});
    mockAuthValue = makeMockAuth();
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /^deactivate account$/i }));
    fireEvent.change(screen.getByPlaceholderText('Your password'), {
      target: { value: 'mypassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirm deactivate/i }));
    await waitFor(() =>
      expect(mockDeactivateAccount).toHaveBeenCalledWith('mypassword')
    );
  });

  test('shows error banner when deactivation fails', async () => {
    mockDeactivateAccount.mockRejectedValueOnce(new Error('Wrong password'));
    mockAuthValue = makeMockAuth();
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /^deactivate account$/i }));
    fireEvent.change(screen.getByPlaceholderText('Your password'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirm deactivate/i }));
    await waitFor(() =>
      expect(screen.getByText(/wrong password/i)).toBeInTheDocument()
    );
  });

  test('Cancel button hides deactivation form', () => {
    mockAuthValue = makeMockAuth();
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /^deactivate account$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(screen.queryByPlaceholderText('Your password')).not.toBeInTheDocument();
  });

  test('Cancel button clears entered password', () => {
    mockAuthValue = makeMockAuth();
    render(<AccountSettings />);
    fireEvent.click(screen.getByRole('button', { name: /^deactivate account$/i }));
    fireEvent.change(screen.getByPlaceholderText('Your password'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    // Re-open
    fireEvent.click(screen.getByRole('button', { name: /^deactivate account$/i }));
    expect(screen.getByPlaceholderText('Your password').value).toBe('');
  });
});
