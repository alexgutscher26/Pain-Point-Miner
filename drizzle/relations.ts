import { relations } from "drizzle-orm/relations";
import {
  painPoint,
  painPointFeedback,
  user,
  purchasedCredits,
  scraper,
  scraperRun,
  painPointEmbedding,
  workspace,
  scraperRunSummary,
  session,
  scraperPost,
  userPreferences,
  workspaceMember,
  account,
  aiUsage,
  keywordStat,
  painPointCluster,
  painPointComment,
} from "./schema";

export const painPointFeedbackRelations = relations(
  painPointFeedback,
  ({ one }) => ({
    painPoint: one(painPoint, {
      fields: [painPointFeedback.painPointId],
      references: [painPoint.id],
    }),
    user: one(user, {
      fields: [painPointFeedback.userId],
      references: [user.id],
    }),
  }),
);

export const painPointRelations = relations(painPoint, ({ one, many }) => ({
  painPointFeedbacks: many(painPointFeedback),
  painPointEmbeddings: many(painPointEmbedding),
  scraper: one(scraper, {
    fields: [painPoint.scraperId],
    references: [scraper.id],
  }),
  user: one(user, {
    fields: [painPoint.userId],
    references: [user.id],
  }),
  workspace: one(workspace, {
    fields: [painPoint.workspaceId],
    references: [workspace.id],
  }),
  painPointCluster: one(painPointCluster, {
    fields: [painPoint.clusterId],
    references: [painPointCluster.id],
  }),
  painPointComments: many(painPointComment),
}));

export const userRelations = relations(user, ({ many }) => ({
  painPointFeedbacks: many(painPointFeedback),
  purchasedCredits: many(purchasedCredits),
  painPointEmbeddings: many(painPointEmbedding),
  sessions: many(session),
  scrapers: many(scraper),
  workspaces: many(workspace),
  userPreferences: many(userPreferences),
  workspaceMembers: many(workspaceMember),
  accounts: many(account),
  aiUsages: many(aiUsage),
  keywordStats: many(keywordStat),
  painPoints: many(painPoint),
  painPointClusters: many(painPointCluster),
}));

export const purchasedCreditsRelations = relations(
  purchasedCredits,
  ({ one }) => ({
    user: one(user, {
      fields: [purchasedCredits.userId],
      references: [user.id],
    }),
  }),
);

export const scraperRunRelations = relations(scraperRun, ({ one, many }) => ({
  scraper: one(scraper, {
    fields: [scraperRun.scraperId],
    references: [scraper.id],
  }),
  scraperPosts: many(scraperPost),
}));

export const scraperRelations = relations(scraper, ({ one, many }) => ({
  scraperRuns: many(scraperRun),
  scraperRunSummaries: many(scraperRunSummary),
  user: one(user, {
    fields: [scraper.userId],
    references: [user.id],
  }),
  workspace: one(workspace, {
    fields: [scraper.workspaceId],
    references: [workspace.id],
  }),
  keywordStats: many(keywordStat),
  painPoints: many(painPoint),
}));

export const painPointEmbeddingRelations = relations(
  painPointEmbedding,
  ({ one }) => ({
    painPoint: one(painPoint, {
      fields: [painPointEmbedding.painPointId],
      references: [painPoint.id],
    }),
    user: one(user, {
      fields: [painPointEmbedding.userId],
      references: [user.id],
    }),
    workspace: one(workspace, {
      fields: [painPointEmbedding.workspaceId],
      references: [workspace.id],
    }),
  }),
);

export const workspaceRelations = relations(workspace, ({ one, many }) => ({
  painPointEmbeddings: many(painPointEmbedding),
  scrapers: many(scraper),
  user: one(user, {
    fields: [workspace.ownerId],
    references: [user.id],
  }),
  workspaceMembers: many(workspaceMember),
  painPoints: many(painPoint),
  painPointClusters: many(painPointCluster),
}));

export const scraperRunSummaryRelations = relations(
  scraperRunSummary,
  ({ one }) => ({
    scraper: one(scraper, {
      fields: [scraperRunSummary.scraperId],
      references: [scraper.id],
    }),
  }),
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const scraperPostRelations = relations(scraperPost, ({ one }) => ({
  scraperRun: one(scraperRun, {
    fields: [scraperPost.runId],
    references: [scraperRun.id],
  }),
}));

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(user, {
      fields: [userPreferences.userId],
      references: [user.id],
    }),
  }),
);

export const workspaceMemberRelations = relations(
  workspaceMember,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [workspaceMember.workspaceId],
      references: [workspace.id],
    }),
    user: one(user, {
      fields: [workspaceMember.userId],
      references: [user.id],
    }),
  }),
);

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const aiUsageRelations = relations(aiUsage, ({ one }) => ({
  user: one(user, {
    fields: [aiUsage.userId],
    references: [user.id],
  }),
}));

export const keywordStatRelations = relations(keywordStat, ({ one }) => ({
  scraper: one(scraper, {
    fields: [keywordStat.scraperId],
    references: [scraper.id],
  }),
  user: one(user, {
    fields: [keywordStat.userId],
    references: [user.id],
  }),
}));

export const painPointClusterRelations = relations(
  painPointCluster,
  ({ one, many }) => ({
    painPoints: many(painPoint),
    user: one(user, {
      fields: [painPointCluster.userId],
      references: [user.id],
    }),
    workspace: one(workspace, {
      fields: [painPointCluster.workspaceId],
      references: [workspace.id],
    }),
  }),
);

export const painPointCommentRelations = relations(
  painPointComment,
  ({ one }) => ({
    painPoint: one(painPoint, {
      fields: [painPointComment.painPointId],
      references: [painPoint.id],
    }),
  }),
);
