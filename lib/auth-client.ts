import { createAuthClient } from "better-auth/react";
import { lastLoginMethodClient, oneTimeTokenClient, usernameClient } from "better-auth/client/plugins";
import { sentinelClient } from "@better-auth/infra/client";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  plugins: [oneTimeTokenClient(), usernameClient(), lastLoginMethodClient(), sentinelClient(), stripeClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
