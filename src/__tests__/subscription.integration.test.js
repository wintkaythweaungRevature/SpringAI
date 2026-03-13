/**
 * Subscription Feature Integration Tests
 *
 * Tests subscription-related user journeys using the real AuthProvider +
 * real AccountSettings/MemberGate components. fetch() is mocked at the
 * network layer to simulate backend responses.
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import AccountSettings from '../components/AccountSettings';
import MemberGate from '../components/MemberGate';

function makeOkResponse(data) {
  return { ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) };
}
function makeFailResponse(status, data) {
  return { ok: false, status, json: async () => data, text: async () => JSON.stringify(data) };
}

function Wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

// Reusable: render AccountSettings with a logged-in member user
async function renderAccountSettingsAs(user, fetchSetup) {
  localStorage.setItem('authToken', 'test-token');
  // AuthProvider on mount fetches /api/auth/me
  global.fetch.mockResolvedValueOnce(makeOkResponse(user));
  fetchSetup?.();

  let result;
  await act(async () => {
    result = render(
      <Wrapper>
        <AccountSettings />
      </Wrapper>
    );
  });
  return result;
}

describe('Subscription Integration: Account Settings', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ─── Free user journey ────────────────────────────────────────────────────

  test('Feature: free user sees upgrade button and can initiate checkout', async () => {
    const freeUser = {
      email: 'free@example.com',
      membershipType: 'FREE',
      emailVerified: true,
    };
    await renderAccountSettingsAs(freeUser);

    expect(screen.getByText('free@example.com')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upgrade to member/i })).toBeInTheDocument();

    // Checkout redirects (window.location.href)
    delete window.location;
    window.location = { href: '' };

    global.fetch.mockResolvedValueOnce(
      makeOkResponse({ url: 'https://checkout.stripe.com/test' })
    );

    fireEvent.click(screen.getByRole('button', { name: /upgrade to member/i }));

    await waitFor(() =>
      expect(window.location.href).toBe('https://checkout.stripe.com/test')
    );
  });

  test('Feature: free user sees error banner when checkout fails', async () => {
    const freeUser = { email: 'free@example.com', membershipType: 'FREE', emailVerified: true };
    await renderAccountSettingsAs(freeUser);

    global.fetch.mockResolvedValueOnce(makeFailResponse(500, { error: 'Payment setup error' }));

    fireEvent.click(screen.getByRole('button', { name: /upgrade to member/i }));

    await waitFor(() =>
      expect(screen.getByText('Payment setup error')).toBeInTheDocument()
    );
  });

  // ─── Active member journey ────────────────────────────────────────────────

  test('Feature: active member can cancel subscription with confirmation flow', async () => {
    const memberUser = {
      email: 'member@example.com',
      membershipType: 'MEMBER',
      emailVerified: true,
      cancelAtPeriodEnd: false,
      subscriptionPeriodEnd: '2026-04-01',
    };
    await renderAccountSettingsAs(memberUser);

    expect(screen.getByText('Member')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cancel subscription/i })
    ).toBeInTheDocument();

    // First click → shows confirm dialog
    fireEvent.click(screen.getByRole('button', { name: /cancel subscription/i }));
    expect(screen.getByRole('button', { name: /confirm cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /keep subscription/i })).toBeInTheDocument();
    expect(screen.getByText(/2026-04-01/)).toBeInTheDocument();

    // Cancel confirmation → cancel POST + /me refetch
    global.fetch
      .mockResolvedValueOnce(
        makeOkResponse({ message: 'Subscription will cancel at the end of the current period.' })
      )
      .mockResolvedValueOnce(
        makeOkResponse({ ...memberUser, cancelAtPeriodEnd: true })
      );

    fireEvent.click(screen.getByRole('button', { name: /confirm cancel/i }));

    await waitFor(() =>
      expect(screen.getByText(/subscription will cancel/i)).toBeInTheDocument()
    );
  });

  test('Feature: active member can abort cancellation by clicking Keep Subscription', async () => {
    const memberUser = {
      email: 'member@example.com',
      membershipType: 'MEMBER',
      emailVerified: true,
      cancelAtPeriodEnd: false,
    };
    await renderAccountSettingsAs(memberUser);

    fireEvent.click(screen.getByRole('button', { name: /cancel subscription/i }));
    expect(screen.getByRole('button', { name: /confirm cancel/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /keep subscription/i }));
    expect(screen.queryByRole('button', { name: /confirm cancel/i })).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cancel subscription/i })
    ).toBeInTheDocument();
  });

  // ─── Pending cancellation member journey ─────────────────────────────────

  test('Feature: member with pending cancellation sees reactivate button', async () => {
    const cancellingMember = {
      email: 'member@example.com',
      membershipType: 'MEMBER',
      emailVerified: true,
      cancelAtPeriodEnd: true,
      subscriptionPeriodEnd: '2026-04-01',
    };
    await renderAccountSettingsAs(cancellingMember);

    expect(screen.getByText(/cancels on 2026-04-01/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reactivate subscription/i })
    ).toBeInTheDocument();
  });

  test('Feature: member can reactivate a pending cancellation', async () => {
    const cancellingMember = {
      email: 'member@example.com',
      membershipType: 'MEMBER',
      emailVerified: true,
      cancelAtPeriodEnd: true,
    };
    await renderAccountSettingsAs(cancellingMember);

    // Reactivate POST + /me refetch
    global.fetch
      .mockResolvedValueOnce(makeOkResponse({ message: 'Subscription reactivated.' }))
      .mockResolvedValueOnce(
        makeOkResponse({ ...cancellingMember, cancelAtPeriodEnd: false })
      );

    fireEvent.click(screen.getByRole('button', { name: /reactivate subscription/i }));

    await waitFor(() =>
      expect(screen.getByText(/subscription reactivated/i)).toBeInTheDocument()
    );
  });

  // ─── Billing portal journey ───────────────────────────────────────────────

  test('Feature: user can open billing portal', async () => {
    const freeUser = { email: 'user@example.com', membershipType: 'FREE', emailVerified: true };
    await renderAccountSettingsAs(freeUser);

    delete window.location;
    window.location = { href: '' };

    global.fetch.mockResolvedValueOnce(
      makeOkResponse({ url: 'https://billing.stripe.com/portal/test' })
    );

    fireEvent.click(screen.getByRole('button', { name: /manage billing/i }));

    await waitFor(() =>
      expect(window.location.href).toBe('https://billing.stripe.com/portal/test')
    );
  });

  test('Feature: billing portal shows error when portal fails', async () => {
    const freeUser = { email: 'user@example.com', membershipType: 'FREE', emailVerified: true };
    await renderAccountSettingsAs(freeUser);

    global.fetch.mockResolvedValueOnce(
      makeFailResponse(400, { error: 'Subscribe first to manage invoices.' })
    );

    fireEvent.click(screen.getByRole('button', { name: /manage billing/i }));

    await waitFor(() =>
      expect(
        screen.getByText('Subscribe first to manage invoices.')
      ).toBeInTheDocument()
    );
  });

  // ─── Account deactivation journey ────────────────────────────────────────

  test('Feature: user can deactivate account with password confirmation', async () => {
    const user = { email: 'user@example.com', membershipType: 'FREE', emailVerified: true };
    await renderAccountSettingsAs(user);

    // Open deactivation form
    fireEvent.click(screen.getByRole('button', { name: /^deactivate account$/i }));
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument();

    // Confirm button disabled without password
    expect(screen.getByRole('button', { name: /confirm deactivate/i })).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('Your password'), {
      target: { value: 'mypassword' },
    });

    // Confirm button enabled with password
    expect(screen.getByRole('button', { name: /confirm deactivate/i })).not.toBeDisabled();

    global.fetch.mockResolvedValueOnce(makeOkResponse({ message: 'Account deactivated' }));

    fireEvent.click(screen.getByRole('button', { name: /confirm deactivate/i }));

    // After deactivation, logout clears token
    await waitFor(() => expect(localStorage.getItem('authToken')).toBeNull());
  });

  test('Feature: wrong password shows error on deactivation', async () => {
    const user = { email: 'user@example.com', membershipType: 'FREE', emailVerified: true };
    await renderAccountSettingsAs(user);

    fireEvent.click(screen.getByRole('button', { name: /^deactivate account$/i }));
    fireEvent.change(screen.getByPlaceholderText('Your password'), {
      target: { value: 'wrong' },
    });

    global.fetch.mockResolvedValueOnce(
      makeFailResponse(400, { error: 'Incorrect password' })
    );

    fireEvent.click(screen.getByRole('button', { name: /confirm deactivate/i }));

    await waitFor(() =>
      expect(screen.getByText('Incorrect password')).toBeInTheDocument()
    );
    // Token still present — account NOT deactivated
    expect(localStorage.getItem('authToken')).toBe('test-token');
  });
});

describe('Subscription Integration: MemberGate upgrade flow', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('Feature: free user in MemberGate can click upgrade to start checkout', async () => {
    localStorage.setItem('authToken', 'free-token');
    global.fetch.mockResolvedValue(
      makeOkResponse({ email: 'free@example.com', membershipType: 'FREE', emailVerified: true })
    );

    delete window.location;
    window.location = { href: '' };

    await act(async () => {
      render(
        <Wrapper>
          <MemberGate featureName="Image Generator">
            <div>image tool</div>
          </MemberGate>
        </Wrapper>
      );
    });

    await waitFor(() =>
      expect(screen.getByText(/member subscription required/i)).toBeInTheDocument()
    );

    global.fetch.mockResolvedValueOnce(
      makeOkResponse({ url: 'https://checkout.stripe.com/upgrade' })
    );

    fireEvent.click(screen.getByRole('button', { name: /upgrade/i }));

    await waitFor(() =>
      expect(window.location.href).toBe('https://checkout.stripe.com/upgrade')
    );
  });

  test('Feature: after upgrade, member can access protected content', async () => {
    localStorage.setItem('authToken', 'member-token');
    global.fetch.mockResolvedValue(
      makeOkResponse({ email: 'member@example.com', membershipType: 'MEMBER', emailVerified: true })
    );

    await act(async () => {
      render(
        <Wrapper>
          <MemberGate featureName="Image Generator">
            <div>image tool</div>
          </MemberGate>
        </Wrapper>
      );
    });

    await waitFor(() =>
      expect(screen.getByText('image tool')).toBeInTheDocument()
    );
  });
});
