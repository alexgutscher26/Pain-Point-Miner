import { createAuthClient } from "better-auth/react";
import {
  lastLoginMethodClient,
  oneTimeTokenClient,
  usernameClient,
} from "better-auth/client/plugins";
import { sentinelClient } from "@better-auth/infra/client";
import { stripeClient } from "@better-auth/stripe/client";

// Sentinel is only enabled server-side when BETTER_AUTH_API_URL is set.
// Mirror that check on the client to avoid "Identify request failed" errors
// when the sentinel API is not configured.
const sentinelApiUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_API_URL;
const sentinelApiKey = process.env.NEXT_PUBLIC_BETTER_AUTH_API_KEY;
const sentinelEnabled =
  Boolean(sentinelApiUrl && /^https?:\/\//i.test(sentinelApiUrl)) &&
  Boolean(sentinelApiKey);

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    oneTimeTokenClient(),
    usernameClient(),
    lastLoginMethodClient(),
    ...(sentinelEnabled ? [sentinelClient()] : []),
    stripeClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
