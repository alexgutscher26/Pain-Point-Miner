import { relations } from "drizzle-orm/relations";
import { painPoint, painPointComment, user, opportunity, workspace, scraper, scraperRun, keywordStat, notification, session, account, report, workspaceMember, userPreferences, apiKey, userTag, opportunityNote, painPointGroup, automation, aiUsage, painPointCluster, painPointEmbedding, painPointToTag, opportunityScrapers } from "./schema";

export const painPointCommentRelations = relations(painPointComment, ({one}) => ({
	painPoint: one(painPoint, {
		fields: [painPointComment.painPointId],
		references: [painPoint.id]
	}),
}));

export const painPointRelations = relations(painPoint, ({one, many}) => ({
	painPointComments: many(painPointComment),
	scraper: one(scraper, {
		fields: [painPoint.scraperId],
		references: [scraper.id]
	}),
	user: one(user, {
		fields: [painPoint.userId],
		references: [user.id]
	}),
	workspace: one(workspace, {
		fields: [painPoint.workspaceId],
		references: [workspace.id]
	}),
	painPointGroup: one(painPointGroup, {
		fields: [painPoint.groupId],
		references: [painPointGroup.id]
	}),
	painPointCluster: one(painPointCluster, {
		fields: [painPoint.clusterId],
		references: [painPointCluster.id]
	}),
	painPointEmbeddings: many(painPointEmbedding),
	painPointToTags: many(painPointToTag),
}));

export const opportunityRelations = relations(opportunity, ({one, many}) => ({
	user: one(user, {
		fields: [opportunity.userId],
		references: [user.id]
	}),
	workspace: one(workspace, {
		fields: [opportunity.workspaceId],
		references: [workspace.id]
	}),
	opportunityNotes: many(opportunityNote),
	opportunityScrapers: many(opportunityScrapers),
}));

export const userRelations = relations(user, ({many}) => ({
	opportunities: many(opportunity),
	keywordStats: many(keywordStat),
	notifications: many(notification),
	sessions: many(session),
	accounts: many(account),
	scrapers: many(scraper),
	reports: many(report),
	workspaceMembers: many(workspaceMember),
	userPreferences: many(userPreferences),
	apiKeys: many(apiKey),
	opportunityNotes: many(opportunityNote),
	workspaces: many(workspace),
	automations: many(automation),
	aiUsages: many(aiUsage),
	painPoints: many(painPoint),
	painPointClusters: many(painPointCluster),
	painPointEmbeddings: many(painPointEmbedding),
}));

export const workspaceRelations = relations(workspace, ({one, many}) => ({
	opportunities: many(opportunity),
	notifications: many(notification),
	scrapers: many(scraper),
	reports: many(report),
	workspaceMembers: many(workspaceMember),
	userTags: many(userTag),
	painPointGroups: many(painPointGroup),
	user: one(user, {
		fields: [workspace.ownerId],
		references: [user.id]
	}),
	automations: many(automation),
	painPoints: many(painPoint),
	painPointClusters: many(painPointCluster),
	painPointEmbeddings: many(painPointEmbedding),
}));

export const scraperRunRelations = relations(scraperRun, ({one}) => ({
	scraper: one(scraper, {
		fields: [scraperRun.scraperId],
		references: [scraper.id]
	}),
}));

export const scraperRelations = relations(scraper, ({one, many}) => ({
	scraperRuns: many(scraperRun),
	keywordStats: many(keywordStat),
	user: one(user, {
		fields: [scraper.userId],
		references: [user.id]
	}),
	workspace: one(workspace, {
		fields: [scraper.workspaceId],
		references: [workspace.id]
	}),
	painPoints: many(painPoint),
	opportunityScrapers: many(opportunityScrapers),
}));

export const keywordStatRelations = relations(keywordStat, ({one}) => ({
	scraper: one(scraper, {
		fields: [keywordStat.scraperId],
		references: [scraper.id]
	}),
	user: one(user, {
		fields: [keywordStat.userId],
		references: [user.id]
	}),
}));

export const notificationRelations = relations(notification, ({one}) => ({
	user: one(user, {
		fields: [notification.userId],
		references: [user.id]
	}),
	workspace: one(workspace, {
		fields: [notification.workspaceId],
		references: [workspace.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const reportRelations = relations(report, ({one}) => ({
	user: one(user, {
		fields: [report.userId],
		references: [user.id]
	}),
	workspace: one(workspace, {
		fields: [report.workspaceId],
		references: [workspace.id]
	}),
}));

export const workspaceMemberRelations = relations(workspaceMember, ({one}) => ({
	workspace: one(workspace, {
		fields: [workspaceMember.workspaceId],
		references: [workspace.id]
	}),
	user: one(user, {
		fields: [workspaceMember.userId],
		references: [user.id]
	}),
}));

export const userPreferencesRelations = relations(userPreferences, ({one}) => ({
	user: one(user, {
		fields: [userPreferences.userId],
		references: [user.id]
	}),
}));

export const apiKeyRelations = relations(apiKey, ({one}) => ({
	user: one(user, {
		fields: [apiKey.userId],
		references: [user.id]
	}),
}));

export const userTagRelations = relations(userTag, ({one, many}) => ({
	workspace: one(workspace, {
		fields: [userTag.workspaceId],
		references: [workspace.id]
	}),
	painPointToTags: many(painPointToTag),
}));

export const opportunityNoteRelations = relations(opportunityNote, ({one}) => ({
	user: one(user, {
		fields: [opportunityNote.userId],
		references: [user.id]
	}),
	opportunity: one(opportunity, {
		fields: [opportunityNote.opportunityId],
		references: [opportunity.id]
	}),
}));

export const painPointGroupRelations = relations(painPointGroup, ({one, many}) => ({
	workspace: one(workspace, {
		fields: [painPointGroup.workspaceId],
		references: [workspace.id]
	}),
	painPoints: many(painPoint),
}));

export const automationRelations = relations(automation, ({one}) => ({
	user: one(user, {
		fields: [automation.userId],
		references: [user.id]
	}),
	workspace: one(workspace, {
		fields: [automation.workspaceId],
		references: [workspace.id]
	}),
}));

export const aiUsageRelations = relations(aiUsage, ({one}) => ({
	user: one(user, {
		fields: [aiUsage.userId],
		references: [user.id]
	}),
}));

export const painPointClusterRelations = relations(painPointCluster, ({one, many}) => ({
	painPoints: many(painPoint),
	user: one(user, {
		fields: [painPointCluster.userId],
		references: [user.id]
	}),
	workspace: one(workspace, {
		fields: [painPointCluster.workspaceId],
		references: [workspace.id]
	}),
}));

export const painPointEmbeddingRelations = relations(painPointEmbedding, ({one}) => ({
	painPoint: one(painPoint, {
		fields: [painPointEmbedding.painPointId],
		references: [painPoint.id]
	}),
	user: one(user, {
		fields: [painPointEmbedding.userId],
		references: [user.id]
	}),
	workspace: one(workspace, {
		fields: [painPointEmbedding.workspaceId],
		references: [workspace.id]
	}),
}));

export const painPointToTagRelations = relations(painPointToTag, ({one}) => ({
	painPoint: one(painPoint, {
		fields: [painPointToTag.a],
		references: [painPoint.id]
	}),
	userTag: one(userTag, {
		fields: [painPointToTag.b],
		references: [userTag.id]
	}),
}));

export const opportunityScrapersRelations = relations(opportunityScrapers, ({one}) => ({
	opportunity: one(opportunity, {
		fields: [opportunityScrapers.a],
		references: [opportunity.id]
	}),
	scraper: one(scraper, {
		fields: [opportunityScrapers.b],
		references: [scraper.id]
	}),
}));