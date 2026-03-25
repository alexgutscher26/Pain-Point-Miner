import { describe, expect, it } from "vitest";
import { workspaceScope } from "@/lib/api-auth";
import { pgTable, text } from "drizzle-orm/pg-core";
import { eq, isNull, SQL } from "drizzle-orm";

describe("workspaceScope", () => {
  const dummyTable = pgTable("dummy", {
    workspaceId: text("workspace_id"),
  });

  const column = dummyTable.workspaceId;

  it("returns eq SQL clause when workspaceId is provided", () => {
    const workspaceId = "test-workspace-id";
    const result = workspaceScope(column, workspaceId);

    expect(result).toBeInstanceOf(SQL);

    // Drizzle's eq() creates an SQL object.
    // We can compare the query parts
    const expected = eq(column, workspaceId);
    expect(result).toStrictEqual(expected);
  });

  it("returns isNull SQL clause when workspaceId is null", () => {
    const result = workspaceScope(column, null);

    expect(result).toBeInstanceOf(SQL);

    // Drizzle's isNull() creates an SQL object.
    const expected = isNull(column);
    expect(result).toStrictEqual(expected);
  });
});
