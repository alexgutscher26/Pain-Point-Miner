import { relations } from "drizzle-orm/relations";
import {
  account,
  keywordStat,
  painPoint,
  painPointCluster,
  painPointComment,
  painPointEmbedding,
  scraper,
  scraperRun,
  session,
  subscription,
  user,
  userPreferences,
  workspace,
  workspaceMember,
} from "./schema";

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  subscriptions: many(subscription),
  workspaces: many(workspace),
  workspaceMembers: many(workspaceMember),
  userPreferences: many(userPreferences),
  scrapers: many(scraper),
  keywordStats: many(keywordStat),
  painPoints: many(painPoint),
  painPointClusters: many(painPointCluster),
  painPointEmbeddings: many(painPointEmbedding),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.referenceId],
    references: [user.id],
  }),
}));

export const workspaceRelations = relations(workspace, ({ one, many }) => ({
  owner: one(user, {
    fields: [workspace.ownerId],
    references: [user.id],
  }),
  workspaceMembers: many(workspaceMember),
  scrapers: many(scraper),
  painPoints: many(painPoint),
  painPointClusters: many(painPointCluster),
  painPointEmbeddings: many(painPointEmbedding),
}));

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

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(user, {
      fields: [userPreferences.userId],
      references: [user.id],
    }),
  }),
);

export const scraperRelations = relations(scraper, ({ one, many }) => ({
  user: one(user, {
    fields: [scraper.userId],
    references: [user.id],
  }),
  workspace: one(workspace, {
    fields: [scraper.workspaceId],
    references: [workspace.id],
  }),
  scraperRuns: many(scraperRun),
  keywordStats: many(keywordStat),
  painPoints: many(painPoint),
}));

export const scraperRunRelations = relations(scraperRun, ({ one }) => ({
  scraper: one(scraper, {
    fields: [scraperRun.scraperId],
    references: [scraper.id],
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

export const painPointRelations = relations(painPoint, ({ one, many }) => ({
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
  painPointEmbeddings: many(painPointEmbedding),
}));

export const painPointCommentRelations = relations(
  painPointComment,
  ({ one }) => ({
    painPoint: one(painPoint, {
      fields: [painPointComment.painPointId],
      references: [painPoint.id],
    }),
  }),
);

export const painPointClusterRelations = relations(
  painPointCluster,
  ({ one, many }) => ({
    user: one(user, {
      fields: [painPointCluster.userId],
      references: [user.id],
    }),
    workspace: one(workspace, {
      fields: [painPointCluster.workspaceId],
      references: [workspace.id],
    }),
    painPoints: many(painPoint),
  }),
);

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
