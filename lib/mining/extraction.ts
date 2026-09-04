/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import { painPoint, painPointComment } from "@/lib/db/schema";
import { extractPainPoints } from "@/lib/ai";
import { clusterPainPoint } from "@/lib/clustering";
import { claimRedditPostForAiProcessing } from "@/lib/reddit-idempotency";
import type { RedditPost } from "@/lib/reddit";
import type { MiningDepth } from "@/lib/mining-presets";
import { cleanCommentBody } from "./discovery";

export type ProcessSinglePostInput = {
  post: RedditPost;
  comments: any[];
  scraperId: string;
  userId: string;
  workspaceId: string | null;
  anonymize: boolean;
  customPatterns: string[];
  /** Mining depth determines which AI model tier is used for extraction. */
  miningDepth: MiningDepth;
  customApiKey?: string | null;
};

/**
 * Processes a single Reddit post: extracts pain points, saves to DB, and fires off clustering.
 * Returns the number of pain points found.
 */
export async function processSinglePost({
  post,
  comments,
  scraperId,
  userId,
  workspaceId,
  anonymize,
  customPatterns,
  miningDepth,
  customApiKey,
}: ProcessSinglePostInput): Promise<number> {
  const shouldProcessWithAi = await claimRedditPostForAiProcessing(
    post.id,
    userId,
  );
  if (!shouldProcessWithAi) {
    return 0;
  }

  const points = await extractPainPoints(
    {
      title: post.title,
      selftext: post.selftext,
      url: post.url,
      author: post.author,
      subreddit: post.subreddit,
      comments: comments.map((comment) => ({ body: comment.body })),
    },
    customPatterns,
    undefined, // modelOverride — let depth routing decide
    miningDepth,
    { userId, scraperId },
    customApiKey,
  );

  if (!points || points.length === 0) return 0;

  const painPointsToInsert = [];
  const commentsToInsert = [];
  const clusterJobs = [];

  for (const point of points) {
    const painPointId = crypto.randomUUID();
    const tags: string[] = [];
    if (point.targetUser) {
      tags.push(`persona:${point.targetUser}`);
    }
    if (point.willingnessToPay && point.willingnessToPay !== "unknown") {
      tags.push(`wtp:${point.willingnessToPay}`);
    }
    if (point.competingProducts && point.competingProducts.length > 0) {
      for (const comp of point.competingProducts) {
        tags.push(`competitor:${comp}`);
      }
    }

    const mergedTriedSolutions = Array.from(
      new Set([
        ...(point.triedSolutions || []),
        ...(point.competingProducts || []),
      ]),
    );

    const explanationParts: string[] = [];
    if (point.confidenceScore !== undefined) {
      explanationParts.push(
        `Confidence: ${(point.confidenceScore * 100).toFixed(0)}%`,
      );
    }
    if (point.targetUser) {
      explanationParts.push(`Persona: ${point.targetUser}`);
    }
    if (point.willingnessToPay && point.willingnessToPay !== "unknown") {
      explanationParts.push(`WTP: ${point.willingnessToPay}`);
    }
    if (point.featureRequested) {
      explanationParts.push(`Feature: ${point.featureRequested}`);
    }

    painPointsToInsert.push({
      id: painPointId,
      title: point.title,
      body: point.body,
      score: point.painIntensity,
      urgency: point.urgency,
      monetizationScore: point.monetizationScore,
      marketMaturity: point.marketMaturity,
      budget: point.budget,
      switchingCosts: point.switchingCosts,
      triedSolutions: mergedTriedSolutions,
      userId,
      scraperId,
      subreddit: post.subreddit,
      postUrl: post.url,
      author: anonymize ? "[Anonymized]" : post.author,
      sentiment: point.sentiment,
      difficulty: point.difficulty,
      commentCount: comments.length,
      mentionCount: 1,
      tags,
      scoreExplanation:
        explanationParts.length > 0 ? explanationParts.join(" | ") : undefined,
      workspaceId,
      updatedAt: new Date(),
    });

    const commentRows = comments
      .filter((comment) => {
        const body = cleanCommentBody(comment.body ?? "");
        if (!body) return false;
        const normalized = body.toLowerCase();
        return normalized !== "[deleted]" && normalized !== "[removed]";
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 12)
      .map((comment) => ({
        id: crypto.randomUUID(),
        body: cleanCommentBody(comment.body),
        author: anonymize ? "[Anonymized]" : comment.author || "unknown",
        score: comment.score ?? 0,
        commentUrl: comment.permalink || null,
        painScore: point.painIntensity ?? 0,
        painPointId,
      }));

    if (commentRows.length > 0) {
      commentsToInsert.push(...commentRows);
    }

    clusterJobs.push(painPointId);
  }

  if (painPointsToInsert.length > 0) {
    await db.insert(painPoint).values(painPointsToInsert);
  }

  if (commentsToInsert.length > 0) {
    await db.insert(painPointComment).values(commentsToInsert);
  }

  for (const painPointId of clusterJobs) {
    void clusterPainPoint(painPointId, userId, workspaceId, customApiKey).catch(
      (err) =>
        console.error(`Embedding/clustering failed for ${painPointId}:`, err),
    );
  }

  return points.length;
}
