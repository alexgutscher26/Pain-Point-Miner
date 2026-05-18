sed -i 's/isSubredditThrottled: vi.fn().mockReturnValue(false),/isSubredditThrottled: vi.fn().mockReturnValue(false),\n  getGlobal429Rate: vi.fn().mockResolvedValue(0),/g' tests/mining-runner.test.ts
