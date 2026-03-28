import { db } from "./lib/db/index";
import { scraperRun, scraperPost, redditRateLimitLog } from "./lib/db/schema";
import { desc } from "drizzle-orm";

async function debugMining() {
  try {
    console.log("--- RECENT SCRAPER RUNS ---");
    const runs = await db.query.scraperRun.findMany({
      limit: 5,
      orderBy: [desc(scraperRun.startedAt)],
    });
    
    if (runs.length === 0) {
      console.log("No scraper runs found.");
    } else {
      console.table(runs.map(r => ({
        id: r.id.substring(0, 8),
        status: r.status,
        fetched: r.postsFetched,
        matched: r.postsMatched,
        comments: r.commentsFetched,
        painPoints: r.newPainPoints,
        error: r.error ? r.error.substring(0, 30) + "..." : "none"
      })));
    }

    console.log("\n--- RECENT ANALYZED POSTS ---");
    const posts = await db.query.scraperPost.findMany({
      limit: 10,
      orderBy: [desc(scraperPost.createdAt)],
    });
    
    if (posts.length === 0) {
      console.log("No analyzed posts found.");
    } else {
      console.table(posts.map(p => ({
        postId: p.postId,
        comments: p.commentCount,
        runId: p.runId.substring(0, 8)
      })));
    }

    console.log("\n--- RECENT RATE LIMIT LOGS ---");
    const logs = await db.query.redditRateLimitLog.findMany({
      limit: 5,
      orderBy: [desc(redditRateLimitLog.createdAt)],
    });
    
    if (logs.length === 0) {
      console.log("No rate limit logs found.");
    } else {
      console.table(logs.map(l => ({
        sub: l.subreddit,
        status: l.statusCode,
        ua: l.userAgent.substring(0, 20) + "..."
      })));
    }
  } catch (error) {
    console.error("Debug failed:", error);
  } finally {
    process.exit(0);
  }
}

debugMining();
