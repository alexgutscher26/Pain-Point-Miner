import { describe, expect, it, vi, beforeEach } from "vitest";
import { clusterPainPoint } from "@/lib/clustering";

const mockExecute = vi.fn();
const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();

const mockValues = vi.fn().mockResolvedValue([{ id: "mock-id" }]);
const mockWhere = vi.fn().mockResolvedValue([{ id: "mock-id" }]);
const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
const mockInsert = vi.fn(() => ({ values: mockValues }));
const mockUpdate = vi.fn(() => ({ set: mockSet }));

vi.mock("@/lib/db", () => ({
  db: {
    execute: (...args: any[]) => mockExecute(...args),
    insert: (...args: any[]) => mockInsert(...args),
    update: (...args: any[]) => mockUpdate(...args),
    query: {
      painPoint: {
        findFirst: (...args: any[]) => mockFindFirst(...args),
        findMany: (...args: any[]) => mockFindMany(...args),
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

    // Verify updates were called (one for painPoint, one for painPointCluster from refreshClusterRollups)
    // Wait, refreshClusterRollups updates the painPointCluster.
    // And assignToCluster / createNewCluster also update the painPoint.
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
