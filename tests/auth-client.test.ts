import { describe, it, expect, vi, beforeEach } from 'vitest';

const createAuthClientMock = vi.fn(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock('better-auth/react', () => ({
  createAuthClient: (...args: any[]) => createAuthClientMock(...args),
}));

vi.mock('better-auth/client/plugins', () => ({
  oneTimeTokenClient: vi.fn(() => 'oneTimeTokenClient'),
  usernameClient: vi.fn(() => 'usernameClient'),
  lastLoginMethodClient: vi.fn(() => 'lastLoginMethodClient'),
}));

vi.mock('@better-auth/infra/client', () => ({
  sentinelClient: vi.fn(() => 'sentinelClient'),
}));

vi.mock('@better-auth/stripe/client', () => ({
  stripeClient: vi.fn(() => 'stripeClient'),
}));

describe('auth-client configuration initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize createAuthClient with correct configuration', async () => {
    // Dynamically import to ensure mocks are set up before the module is evaluated
    await import('@/lib/auth-client');

    expect(createAuthClientMock).toHaveBeenCalledWith({
      baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      plugins: [
        'oneTimeTokenClient',
        'usernameClient',
        'lastLoginMethodClient',
        'sentinelClient',
        'stripeClient',
      ],
    });
  });

  it('should export the expected objects', async () => {
    const { authClient, signIn, signUp, signOut, useSession } = await import('@/lib/auth-client');
    expect(authClient).toBeDefined();
    expect(signIn).toBeDefined();
    expect(signUp).toBeDefined();
    expect(signOut).toBeDefined();
    expect(useSession).toBeDefined();
  });
});
