import { describe, expect, it, vi, beforeEach } from "vitest";
import { clusterPainPoint } from "@/lib/clustering";
import { db } from "@/lib/db";
import { embedPainPoint } from "@/lib/embeddings";

// Mock external dependencies
vi.mock("@/lib/embeddings", () => ({
  embedPainPoint: vi.fn(),
}));

vi.mock("@/lib/db", () => {
  const mockChainable = () => ({
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
  });

  return {
    db: {
      execute: vi.fn(),
      insert: vi.fn(mockChainable),
      update: vi.fn(mockChainable),
      query: {
        painPoint: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
      },
    },
  };
});

// We need to provide dummy tables for pgTable, otherwise drizzle-orm/pg-core might fail
// Actually since we mocked `db`, we don't necessarily need the tables mocked if they're not used inside the mocked module.
// But we should reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

describe("clusterPainPoint", () => {
  const mockPainPointId = "point-123";
  const mockUserId = "user-123";
  const mockWorkspaceId = "workspace-123";
  const mockEmbedding = [0.1, 0.2, 0.3];

  const mockPainPoint = {
    id: mockPainPointId,
    title: "Test pain point",
    body: "This is a test pain point body.",
    budget: [],
  };

  it("creates a new cluster when no similar centroids are found", async () => {
    // Setup mocks
    vi.mocked(embedPainPoint).mockResolvedValue(mockEmbedding);
    vi.mocked(db.execute).mockResolvedValue([]);
    vi.mocked(db.query.painPoint.findFirst).mockResolvedValue(mockPainPoint);
    vi.mocked(db.query.painPoint.findMany).mockResolvedValue([mockPainPoint]);

    // Execute
    const result = await clusterPainPoint(
      mockPainPointId,
      mockUserId,
      mockWorkspaceId,
    );

    // Verify embedding was called
    expect(embedPainPoint).toHaveBeenCalledWith(
      mockPainPointId,
      mockUserId,
      mockWorkspaceId,
    );

    // Verify search was performed
    expect(db.execute).toHaveBeenCalled();

    // Verify new cluster creation logic
    expect(db.insert).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalled();

    // Verify result format
    expect(result).toEqual({
      clusterId: expect.any(String),
      isNew: true,
    });
  });

  it("assigns to an existing cluster when similar centroids are found", async () => {
    // Setup mocks
    const existingClusterId = "cluster-999";
    vi.mocked(embedPainPoint).mockResolvedValue(mockEmbedding);

    // Return a candidate that passes the threshold
    vi.mocked(db.execute).mockResolvedValue([
      { clusterId: existingClusterId, similarity: 0.95 },
    ]);
    vi.mocked(db.query.painPoint.findFirst).mockResolvedValue(mockPainPoint);
    vi.mocked(db.query.painPoint.findMany).mockResolvedValue([mockPainPoint]);

    // Execute
    const result = await clusterPainPoint(
      mockPainPointId,
      mockUserId,
      mockWorkspaceId,
    );

    // Verify assigning to cluster logic
    expect(db.update).toHaveBeenCalledTimes(3); // painPoint update, cluster update, refresh rollup cluster updates
    expect(db.insert).not.toHaveBeenCalled();

    // Verify result format
    expect(result).toEqual({
      clusterId: existingClusterId,
      isNew: false,
    });
  });

  it("throws an error if the pain point is not found", async () => {
    // Setup mocks
    vi.mocked(embedPainPoint).mockResolvedValue(mockEmbedding);
    vi.mocked(db.execute).mockResolvedValue([]);

    // Return null for findFirst
    vi.mocked(db.query.painPoint.findFirst).mockResolvedValue(null);

    // Execute & Verify
    await expect(
      clusterPainPoint(mockPainPointId, mockUserId, mockWorkspaceId)
    ).rejects.toThrow(`Pain point ${mockPainPointId} not found`);
  });
});
