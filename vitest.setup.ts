import { vi } from "vitest";

vi.mock("next/server", () => {
  return {
    NextResponse: {
      json: vi.fn((body: any, init?: { status?: number, headers?: any }) => {
        return {
          status: init?.status ?? 200,
          headers: new Headers(init?.headers),
          json: async () => body
        };
      })
    }
  };
});
