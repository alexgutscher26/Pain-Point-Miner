import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import {
  bearer,
  haveIBeenPwned,
  lastLoginMethod,
  oneTimeToken,
  username,
} from "better-auth/plugins";
import { sentinel } from "@better-auth/infra";
import { stripe as stripePlugin } from "@better-auth/stripe";
import Stripe from "stripe";
import { db } from "./db";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripePriceStarterMonthly = process.env.STRIPE_PRICE_STARTER_MONTHLY;
const stripePriceGrowthMonthly = process.env.STRIPE_PRICE_GROWTH_MONTHLY;
const stripePriceProMonthly = process.env.STRIPE_PRICE_PRO_MONTHLY;
const stripePriceStarterYearly = process.env.STRIPE_PRICE_STARTER_YEARLY;
const stripePriceGrowthYearly = process.env.STRIPE_PRICE_GROWTH_YEARLY;
const stripePriceProYearly = process.env.STRIPE_PRICE_PRO_YEARLY;
const stripePluginEnabled =
  process.env.STRIPE_PLUGIN_ENABLED?.trim() === "true" &&
  Boolean(stripeSecretKey) &&
  Boolean(stripeWebhookSecret);
const stripeSubscriptionEnabled =
  process.env.STRIPE_SUBSCRIPTION_ENABLED?.trim() === "true" &&
  Boolean(stripePriceGrowthMonthly) &&
  Boolean(stripePriceProMonthly);
const usernamePluginEnabled = process.env.USERNAME_PLUGIN_ENABLED === "true";
const sentinelApiUrl = process.env.BETTER_AUTH_API_URL;
const sentinelKvUrl = process.env.BETTER_AUTH_KV_URL;
const sentinelApiKey = process.env.BETTER_AUTH_API_KEY;
const sentinelEnabled =
  Boolean(sentinelApiUrl && /^https?:\/\//i.test(sentinelApiUrl)) &&
  Boolean(sentinelKvUrl) &&
  Boolean(sentinelApiKey);

const githubClientId =
  process.env.GITHUB_CLIENT_ID || process.env.AUTH_GITHUB_ID;
const githubClientSecret =
  process.env.GITHUB_CLIENT_SECRET || process.env.AUTH_GITHUB_SECRET;
const githubOAuthEnabled = Boolean(githubClientId && githubClientSecret);

import * as schema from "./db/schema";
import * as relations from "./db/relations";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "fallback_secret_for_local_development_or_testing",
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: { ...schema, ...relations },
  }),
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
    cookieCache: {
      enabled: false,
    },
  },
  user: {
    additionalFields: {
      anonymizeRedditUsernames: { type: "boolean" },
      deletedAt: { type: "date" },
      role: { type: "string" },
      ltdTier: { type: "string" },
      ltdPricePaid: { type: "number" },
      stripeCustomerId: { type: "string" },
    },
  },
  ...(githubOAuthEnabled
    ? {
        socialProviders: {
          github: {
            clientId: githubClientId!,
            clientSecret: githubClientSecret!,
          },
        },
      }
    : {}),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      const { sendResetPasswordEmailProgrammatically } = await import(
        "./loops/service"
      );
      await sendResetPasswordEmailProgrammatically(data.user.email, data.url);
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },
      "/sign-in/username": {
        window: 60,
        max: 5,
      },
      "/sign-up/email": {
        window: 60,
        max: 3,
      },
      "/one-time-token/generate": {
        window: 60,
        max: 10,
      },
      "/one-time-token/verify": {
        window: 60,
        max: 20,
      },
    },
  },
  plugins: [
    bearer(),
    oneTimeToken(),
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        "This password has appeared in a known breach. Choose a different password.",
    }),
    lastLoginMethod(),
    ...(usernamePluginEnabled
      ? [
          username({
            minUsernameLength: 3,
            maxUsernameLength: 20,
            usernameNormalization: (value) => value.trim().toLowerCase(),
            usernameValidator: (value) => /^[a-z0-9_]+$/.test(value),
            displayUsernameValidator: (value) => {
              const trimmed = value.trim();
              return trimmed.length >= 2 && trimmed.length <= 40;
            },
          }),
        ]
      : []),
    ...(sentinelEnabled
      ? [
          sentinel({
            apiUrl: sentinelApiUrl,
            kvUrl: sentinelKvUrl,
            apiKey: sentinelApiKey,
          }),
        ]
      : []),
    ...(stripePluginEnabled
      ? [
          stripePlugin({
            stripeClient: new Stripe(stripeSecretKey!),
            stripeWebhookSecret: stripeWebhookSecret!,
            createCustomerOnSignUp: true,
            ...(stripeSubscriptionEnabled
              ? {
                  subscription: {
                    enabled: true as const,
                    plans: [
                      ...(stripePriceStarterMonthly
                        ? [
                            {
                              name: "starter",
                              priceId: stripePriceStarterMonthly,
                              ...(stripePriceStarterYearly
                                ? {
                                    annualDiscountPriceId:
                                      stripePriceStarterYearly,
                                  }
                                : {}),
                            },
                          ]
                        : []),
                      {
                        name: "growth",
                        priceId: stripePriceGrowthMonthly!,
                        ...(stripePriceGrowthYearly
                          ? { annualDiscountPriceId: stripePriceGrowthYearly }
                          : {}),
                      },
                      {
                        name: "pro",
                        priceId: stripePriceProMonthly!,
                        ...(stripePriceProYearly
                          ? { annualDiscountPriceId: stripePriceProYearly }
                          : {}),
                      },
                    ],
                  },
                }
              : {}),
          }),
        ]
      : []),
  ],

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Sync user to Loops after successful email signup
      if (ctx.path === "/sign-up/email" && ctx.context.returned) {
        const body = ctx.body as { email?: string; name?: string };
        if (body.email) {
          const { syncUserToLoops, sendWelcomeEmailProgrammatically } = await import("./loops/service");
          await syncUserToLoops(body.email, body.name);

          const firstName = body.name ? body.name.split(" ")[0] : "there";
          const scanUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/search` : "https://threddiq.com/dashboard/search";
          await sendWelcomeEmailProgrammatically(body.email, firstName, scanUrl);
        }
      }
    }),

    before: createAuthMiddleware(async (ctx) => {
      // Satisfy async contract for BetterAuth types
      await Promise.resolve();

      if (ctx.path !== "/sign-up/email" && ctx.path !== "/sign-in/email") {
        return;
      }

      const email =
        typeof ctx.body?.email === "string"
          ? ctx.body.email.trim().toLowerCase()
          : "";

      if (!email) {
        throw new APIError("BAD_REQUEST", {
          message: "Email is required.",
        });
      }

      if (ctx.path === "/sign-up/email") {
        const name =
          typeof ctx.body?.name === "string" ? ctx.body.name.trim() : "";

        if (!name) {
          throw new APIError("BAD_REQUEST", {
            message: "Name is required.",
          });
        }

        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              email,
              name,
            },
          },
        };
      }

      return {
        context: {
          ...ctx,
          body: {
            ...ctx.body,
            email,
          },
        },
      };
    }),
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

export function sanitizeAuthHeaders(inputHeaders?: Headers | HeadersInit | null): Headers {
  const headers = new Headers(inputHeaders ?? undefined);
  const cookie = headers.get("cookie");
  if (!cookie) return headers;

  const cookies = cookie.split(";").map((c) => c.trim()).filter(Boolean);
  const sanitized = cookies.filter((c) => {
    const eqIdx = c.indexOf("=");
    if (eqIdx === -1) return true;
    const name = c.slice(0, eqIdx).trim();

    // Strip out session_data cookie which causes base64 decode issues when stale/mismatched
    if (name.includes("session_data")) {
      return false;
    }
    return true;
  });

  headers.set("cookie", sanitized.join("; "));
  return headers;
}

export async function getServerSession(customHeaders?: Headers | HeadersInit | null) {
  try {
    let requestHeaders = customHeaders ? new Headers(customHeaders) : null;
    if (!requestHeaders) {
      const { headers } = await import("next/headers");
      requestHeaders = await headers();
    }
    const cleanHeaders = sanitizeAuthHeaders(requestHeaders);
    return await auth.api.getSession({
      headers: cleanHeaders,
    });
  } catch {
    return null;
  }
}
