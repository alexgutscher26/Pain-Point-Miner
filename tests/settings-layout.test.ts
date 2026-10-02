/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PUT } from "@/app/api/settings/layout/route";

const mockFindFirst = vi.fn();
const mockUpdateSet = vi.fn(() => ({
  where: vi.fn().mockResolvedValue([{ id: "mock" }]),
}));
const mockUpdate = vi.fn(() => ({ set: mockUpdateSet }));
const mockInsertValues = vi.fn().mockResolvedValue([{ id: "mock" }]);
const mockInsert = vi.fn(() => ({ values: mockInsertValues }));

const mockGetServerSession = vi.fn();

vi.mock("@/lib/auth", () => ({
  getServerSession: (...args: any[]) => (mockGetServerSession as any)(...args),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      userPreferences: {
        findFirst: (...args: any[]) => (mockFindFirst as any)(...args),
      },
    },
    update: (...args: any[]) => (mockUpdate as any)(...args),
    insert: (...args: any[]) => (mockInsert as any)(...args),
  },
}));

describe("PUT /api/settings/layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized when session is missing", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = new Request("http://localhost/api/settings/layout", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardOrder: ["metrics", "top-opportunities"] }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it("updates existing user preferences with new card order", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-layout-123" },
    });
    mockFindFirst.mockResolvedValue({
      id: "pref-1",
      userId: "user-layout-123",
      dashboardLayout: {
        settings: { company: "Acme Inc" },
      },
    });

    const req = new Request("http://localhost/api/settings/layout", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardOrder: ["top-opportunities", "metrics", "heatmap"],
      }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.dashboardLayout.cardOrder).toEqual([
      "top-opportunities",
      "metrics",
      "heatmap",
    ]);
    expect(mockUpdate).toHaveBeenCalled();
  });
});
