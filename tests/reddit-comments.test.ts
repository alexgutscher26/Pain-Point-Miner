import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fetchComments } from "@/lib/reddit";

const mockCommentData = [
  {}, // First element is usually post data, we ignore it based on current logic
  {
    data: {
      children: [
        {
          kind: "t1",
          data: {
            id: "1",
            author: "user1",
            body: "Top level comment",
            replies: {
              data: {
                children: [
                  {
                    kind: "t1",
                    data: {
                      id: "2",
                      author: "user2",
                      body: "Reply 1",
                      replies: "" // Sometimes empty string in Reddit API
                    }
                  },
                  {
                    kind: "t1",
                    data: {
                      id: "3",
                      author: "user3",
                      body: "Reply 2",
                      replies: {
                        data: {
                          children: [
                            {
                              kind: "t1",
                              data: {
                                id: "4",
                                author: "user4",
                                body: "Nested reply",
                                replies: ""
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        {
          kind: "more", // Non-t1 kind, should be filtered
          data: {
            count: 5
          }
        }
      ]
    }
  }
];

describe("fetchComments", () => {
  beforeEach(() => {
    // Mock global fetch to return our mockData
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCommentData,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("extracts comments and deeply nested replies correctly", async () => {
    const comments = await fetchComments("testsub", "testpost");

    // Total comments should be 4 (1 top level, 2 replies, 1 nested reply)
    expect(comments).toHaveLength(4);

    const ids = comments.map((c: any) => c.id);
    expect(ids).toEqual(["1", "2", "3", "4"]);
  });

  it("handles empty or missing replies properly", async () => {
    // Modify mock data to have a comment with missing replies field
    const emptyRepliesMockData = [
      {},
      {
        data: {
          children: [
            {
              kind: "t1",
              data: {
                id: "1",
                author: "user1",
                body: "Top level comment with no replies",
              }
            }
          ]
        }
      }
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => emptyRepliesMockData,
    });

    const comments = await fetchComments("testsub", "testpost");
    expect(comments).toHaveLength(1);
    expect(comments[0].id).toBe("1");
  });

  it("filters out non-t1 node kinds", async () => {
    const comments = await fetchComments("testsub", "testpost");
    const kinds = comments.filter((c: any) => c.kind === "more");
    expect(kinds).toHaveLength(0);
  });

  it("handles fetch errors gracefully", async () => {
    // Mock the specific fallback function and error logging behavior
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Make fetch throw a generic error to test the default error handling route
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const comments = await fetchComments("testsub", "testpost");
    expect(comments).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it("handles fallback to PullPush on reddit block", async () => {
     vi.spyOn(console, 'error').mockImplementation(() => {});

     const blockedError = new Error("Reddit API error: 403 Forbidden");

     global.fetch = vi.fn()
       .mockImplementationOnce(() => Promise.reject(blockedError)) // auth token attempt or reddit api attempt 1
       .mockImplementationOnce(() => Promise.reject(blockedError)) // retry
       .mockImplementationOnce(() => Promise.reject(blockedError)) // retry
       .mockImplementationOnce(() => Promise.reject(blockedError)) // retry
       .mockImplementationOnce(() => Promise.resolve({
         ok: true,
         json: async () => ({
           data: [
             { id: "pp1", author: "pp_user", body: "PullPush comment" }
           ]
         })
       }))
       .mockImplementation(() => Promise.resolve({
         ok: true,
         json: async () => ({
           data: [
             { id: "pp1", author: "pp_user", body: "PullPush comment" }
           ]
         })
       }));

     const comments = await fetchComments("testsub", "testpost");
     expect(comments).toHaveLength(1);
     expect(comments[0].id).toBe("pp1");
  });
});
