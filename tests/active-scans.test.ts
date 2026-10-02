/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/scans/active/route";

const mockLimit = vi.fn();
const mockOrderBy = vi.fn(() => ({ limit: mockLimit }));
const mockWhere = vi.fn(() => ({ orderBy: mockOrderBy }));
const mockInnerJoin = vi.fn(() => ({ where: mockWhere }));
const mockFrom = vi.fn(() => ({ innerJoin: mockInnerJoin }));
const mockSelect = vi.fn(() => ({ from: mockFrom }));

const mockGetServerSession = vi.fn();

vi.mock("@/lib/auth", () => ({
  getServerSession: (...args: any[]) => (mockGetServerSession as any)(...args),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: any[]) => (mockSelect as any)(...args),
  },
}));

describe("GET /api/scans/active", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized if no active session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = new Request("http://localhost/api/scans/active");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.message).toBe("Unauthorized");
  });

  it("returns active scans count and runs for authenticated user", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-test-123" },
    });

    const mockActiveRuns = [
      {
        id: "run-1",
        scraperId: "scraper-1",
        scraperName: "SaaS Scraper",
        keyword: "churn",
        subreddits: ["SaaS", "startups"],
        status: "extracting",
        startedAt: new Date("2026-09-17T12:00:00Z"),
        postsFetched: 25,
        postsMatched: 20,
        commentsFetched: 80,
        newPainPoints: 6,
      },
    ];

    mockLimit.mockResolvedValue(mockActiveRuns);

    const req = new Request("http://localhost/api/scans/active");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.activeScansCount).toBe(1);
    expect(body.activeRuns).toHaveLength(1);
    expect(body.activeRuns[0].id).toBe("run-1");
    expect(body.activeRuns[0].status).toBe("extracting");
  });

  it("returns 0 active scans if none are running", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-test-123" },
    });

    mockLimit.mockResolvedValue([]);

    const req = new Request("http://localhost/api/scans/active");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.activeScansCount).toBe(0);
    expect(body.activeRuns).toHaveLength(0);
  });
});
