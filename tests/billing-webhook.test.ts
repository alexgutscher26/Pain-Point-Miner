import { describe, it, expect, vi, beforeEach } from "vitest";
import { processStripeWebhookEvent } from "@/lib/billing-webhook";
import { db } from "@/lib/db";
import type Stripe from "stripe";

vi.mock("@/lib/db", () => {
  const mockUserFind = vi.fn();
  const mockPrefsFind = vi.fn();
  const mockUpdate = vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  }));
  const mockInsert = vi.fn(() => ({
    values: vi.fn(() => ({
      onConflictDoUpdate: vi.fn(() => Promise.resolve()),
    })),
  }));

  return {
    db: {
      query: {
        user: { findFirst: mockUserFind },
        userPreferences: { findFirst: mockPrefsFind },
      },
      update: mockUpdate,
      insert: mockInsert,
    },
  };
});

vi.mock("@/lib/loops/service", () => ({
  sendLoopsEvent: vi.fn(() => Promise.resolve()),
}));

describe("Billing Webhook Processor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles customer.subscription.updated to active with pro plan", async () => {
    const mockUser = {
      id: "user_123",
      email: "test@example.com",
      plan: "starter",
      ltdTier: "none",
      stripeCustomerId: "cus_123",
    };

    vi.mocked(db.query.user.findFirst).mockResolvedValueOnce(mockUser as any);

    const event: Stripe.Event = {
      id: "evt_1",
      object: "event",
      api_version: "2025-01-27.acacia",
      created: 123456789,
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_123",
          object: "subscription",
          customer: "cus_123",
          status: "active",
          metadata: { userId: "user_123", plan: "pro" },
          items: {
            object: "list",
            data: [],
            has_more: false,
            url: "/v1/subscription_items",
          },
        } as any,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
    };

    const result = await processStripeWebhookEvent(event);
    expect(result.handled).toBe(true);
    expect(db.update).toHaveBeenCalled();
  });

  it("handles customer.subscription.updated to canceled by downgrading non-LTD user to starter", async () => {
    const mockUser = {
      id: "user_456",
      email: "test2@example.com",
      plan: "pro",
      ltdTier: "none",
      stripeCustomerId: "cus_456",
    };

    vi.mocked(db.query.user.findFirst).mockResolvedValueOnce(mockUser as any);

    const event: Stripe.Event = {
      id: "evt_2",
      object: "event",
      api_version: "2025-01-27.acacia",
      created: 123456789,
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_456",
          object: "subscription",
          customer: "cus_456",
          status: "canceled",
          metadata: { userId: "user_456" },
          items: {
            object: "list",
            data: [],
            has_more: false,
            url: "/v1/subscription_items",
          },
        } as any,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
    };

    const result = await processStripeWebhookEvent(event);
    expect(result.handled).toBe(true);
    expect(db.update).toHaveBeenCalled();
  });

  it("does not downgrade user to starter on subscription cancellation if user owns an LTD tier", async () => {
    const mockUser = {
      id: "user_ltd",
      email: "ltd@example.com",
      plan: "professional",
      ltdTier: "professional",
      stripeCustomerId: "cus_ltd",
    };

    vi.mocked(db.query.user.findFirst).mockResolvedValueOnce(mockUser as any);

    const event: Stripe.Event = {
      id: "evt_3",
      object: "event",
      api_version: "2025-01-27.acacia",
      created: 123456789,
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_ltd",
          object: "subscription",
          customer: "cus_ltd",
          status: "canceled",
          metadata: { userId: "user_ltd" },
          items: {
            object: "list",
            data: [],
            has_more: false,
            url: "/v1/subscription_items",
          },
        } as any,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
    };

    const result = await processStripeWebhookEvent(event);
    expect(result.handled).toBe(true);
    // LTD user should not have their plan updated/downgraded
    expect(db.update).not.toHaveBeenCalled();
  });

  it("handles checkout.session.completed for ltd_purchase", async () => {
    const event: Stripe.Event = {
      id: "evt_4",
      object: "event",
      api_version: "2025-01-27.acacia",
      created: 123456789,
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_123",
          object: "checkout.session",
          customer: "cus_new",
          customer_details: { email: "buyer@example.com" },
          metadata: {
            type: "ltd_purchase",
            userId: "user_buyer",
            ltdTier: "founder",
            amountPaid: "149",
          },
        } as any,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
    };

    const result = await processStripeWebhookEvent(event);
    expect(result.handled).toBe(true);
    expect(db.update).toHaveBeenCalled();
  });
});
