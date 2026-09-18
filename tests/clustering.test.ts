/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { clusterPainPoint, mergeDriftingClusters } from "@/lib/clustering";

const mockExecute = vi.fn();
const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();

const mockValues = vi.fn().mockResolvedValue([{ id: "mock-id" }]);
const mockWhere = vi.fn().mockResolvedValue([{ id: "mock-id" }]);
const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
const mockDeleteWhere = vi.fn().mockResolvedValue([{ id: "mock-id" }]);
const mockInsert = vi.fn(() => ({ values: mockValues }));
const mockUpdate = vi.fn(() => ({ set: mockSet }));
const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));

vi.mock("@/lib/db", () => ({
  db: {
    execute: (...args: any[]) => (mockExecute as any)(...args),
    insert: (...args: any[]) => (mockInsert as any)(...args),
    update: (...args: any[]) => (mockUpdate as any)(...args),
    delete: (...args: any[]) => (mockDelete as any)(...args),
    query: {
      painPoint: {
        findFirst: (...args: any[]) => (mockFindFirst as any)(...args),
        findMany: (...args: any[]) => (mockFindMany as any)(...args),
      },
    },
  },
}));

vi.mock("@/lib/embeddings", () => ({
  embedPainPoint: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

describe("clusterPainPoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockFindFirst.mockResolvedValue({
      id: "pain-1",
      title: "Test pain point",
      body: "Test body content",
      budget: null,
    });
    mockFindMany.mockResolvedValue([]);
  });

  it("creates a new cluster when no candidates match", async () => {
    // Return empty candidates
    mockExecute.mockResolvedValue([]);

    const result = await clusterPainPoint("pain-1", "user-1", "workspace-1");

    expect(result.isNew).toBe(true);
    expect(result.clusterId).toBeDefined();

    // Verify insert was called for the new cluster
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockValues).toHaveBeenCalledTimes(1);

    expect(mockUpdate).toHaveBeenCalled();
  });

  it("assigns to an existing cluster when a candidate passes the threshold", async () => {
    // Return a candidate
    mockExecute.mockResolvedValue([
      {
        clusterId: "existing-cluster-1",
        similarity: 0.9,
      },
    ]);

    const result = await clusterPainPoint("pain-1", "user-1", "workspace-1");

    expect(result.isNew).toBe(false);
    expect(result.clusterId).toBe("existing-cluster-1");

    // Verify insert was NOT called
    expect(mockInsert).not.toHaveBeenCalled();

    // Verify updates were called
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("throws an error if pain point is not found", async () => {
    // Return a candidate (doesn't matter)
    mockExecute.mockResolvedValue([]);

    // Mock pain point not found
    mockFindFirst.mockResolvedValue(null);

    await expect(
      clusterPainPoint("pain-invalid", "user-1", "workspace-1"),
    ).rejects.toThrow("Pain point pain-invalid not found");
  });
});

describe("mergeDriftingClusters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindMany.mockResolvedValue([]);
  });

  it("merges two clusters when cosine similarity exceeds 0.95", async () => {
    mockExecute.mockResolvedValue([
      {
        c1Id: "cluster-alpha",
        c1Count: 5,
        c1Embedding: [0.1, 0.2, 0.3],
        c2Id: "cluster-beta",
        c2Count: 2,
        c2Embedding: [0.1, 0.21, 0.29],
        similarity: 0.98,
      },
    ]);

    const result = await mergeDriftingClusters({
      similarityThreshold: 0.95,
      userId: "user-1",
    });

    expect(result.mergedCount).toBe(1);
    expect(result.merges[0]).toEqual({
      sourceClusterId: "cluster-beta",
      targetClusterId: "cluster-alpha",
      similarity: 0.98,
      painPointsMoved: 2,
    });

    // Verify update was called to move pain points and update centroid
    expect(mockUpdate).toHaveBeenCalled();
    // Verify delete was called to remove the source cluster
    expect(mockDelete).toHaveBeenCalled();
    expect(mockDeleteWhere).toHaveBeenCalled();
  });

  it("returns 0 merged when no clusters drift too close", async () => {
    mockExecute.mockResolvedValue([]);

    const result = await mergeDriftingClusters({
      similarityThreshold: 0.95,
    });

    expect(result.mergedCount).toBe(0);
    expect(result.merges).toHaveLength(0);
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });
});

