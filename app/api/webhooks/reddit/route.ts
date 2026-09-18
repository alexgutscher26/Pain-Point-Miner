/* eslint-disable prefer-const */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scraper, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { fetchComments, fetchSingleRedditPost, type RedditPost } from "@/lib/reddit";
import { processSinglePost } from "@/lib/mining-runner";
import { type MiningDepth } from "@/lib/plan-gating";

/**
 * Reddit RSS Ingestion Webhook.
 *
 * Allows near-real-time ingestion by hitting this endpoint from an RSS-to-Webhook service
 * (Zapier, IFTTT, Pipedream, etc).
 *
 * Expected payload (JSON):
 * {
 *   "postId": "1bevuvf",     // Optional: will try to parse from link if missing
 *   "title": "...",          // Optional
 *   "subreddit": "saas",      // Required
 *   "link": "https://..."    // Optional
 * }
 */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scraperId = searchParams.get("scraperId");
  const secret = searchParams.get("secret");

  // 1. Basic security check
  const systemSecret = process.env.REDDIT_WEBHOOK_SECRET;
  if (systemSecret && secret !== systemSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!scraperId) {
    return NextResponse.json({ error: "Missing scraperId" }, { status: 400 });
  }

  try {
    const payload = await req.json();
    const { subreddit } = payload;
    let { postId, link } = payload;

    if (!subreddit) {
      return NextResponse.json({ error: "Missing subreddit" }, { status: 400 });
    }

    // 2. Extract postId from link if not provided
    if (!postId && link) {
      const match = link.match(/\/comments\/([^/?]+)/);
      if (match) postId = match[1];
    }

    if (!postId) {
      return NextResponse.json(
        { error: "Could not identify postId" },
        { status: 400 },
      );
    }

    // 3. Resolve Scraper and User Context
    const scraperRecord = await db.query.scraper.findFirst({
      where: eq(scraper.id, scraperId),
    });

    if (!scraperRecord) {
      return NextResponse.json({ error: "Scraper not found" }, { status: 404 });
    }

    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, scraperRecord.userId),
    });

    const anonymize = userRecord?.anonymizeRedditUsernames ?? false;

    // 4. Fetch the real post and its comments from Reddit
    const [fetchedPost, comments] = await Promise.all([
      fetchSingleRedditPost(postId, subreddit),
      fetchComments(postId, subreddit, {
        maxDepth: 50,
        maxComments: 100,
      }),
    ]);

    const post: RedditPost = fetchedPost ?? {
      id: postId,
      title: payload.title || "Post from Webhook",
      selftext: payload.body || payload.selftext || "",
      url: link || `https://www.reddit.com/r/${subreddit}/comments/${postId}`,
      author: payload.author || "unknown",
      subreddit,
      score: payload.score ?? 0,
      num_comments: comments.length,
      created_utc: payload.created_utc || Math.floor(Date.now() / 1000),
      is_self: true,
    };

    // If webhook provided explicit overrides or fetched post was partial
    if (!post.title && payload.title) {
      post.title = payload.title;
    }
    if (!post.selftext && (payload.body || payload.selftext)) {
      post.selftext = payload.body || payload.selftext;
    }

    // 5. Process the post through the standard mining pipeline
    const count = await processSinglePost({
      post,
      comments,
      scraperId,
      userId: scraperRecord.userId,
      workspaceId: scraperRecord.workspaceId,
      anonymize,
      customPatterns: scraperRecord.customPatterns ?? [],
      miningDepth: scraperRecord.miningDepth as MiningDepth,
    });

    return NextResponse.json({
      success: true,
      painPointsFound: count,
      postId,
    });
  } catch (error) {
    console.error("Webhook ingestion failed:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
