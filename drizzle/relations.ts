import { relations } from "drizzle-orm/relations";
import { workspace, project, user, organization, tag, widget, testimonial, videoTranscodingJob, auditLog, analyticsEvent, workspaceMember, workspacePermissionSet, workspaceInvitation, account, session, trustedDevice, scraper, painPoint, painPointCluster, painPointComment, painPointEmbedding, painPointFeedback, purchasedCredits, keywordStat, scraperRun, scraperPost, scraperRunSummary, userPreferences, aiUsage, testimonialToTag } from "./schema";

export const projectRelations = relations(project, ({one, many}) => ({
	workspace: one(workspace, {
		fields: [project.workspaceId],
		references: [workspace.id]
	}),
	testimonials: many(testimonial),
	analyticsEvents: many(analyticsEvent),
}));

export const workspaceRelations = relations(workspace, ({one, many}) => ({
	projects: many(project),
	tags: many(tag),
	widgets: many(widget),
	testimonials: many(testimonial),
	videoTranscodingJobs: many(videoTranscodingJob),
	auditLogs: many(auditLog),
	analyticsEvents: many(analyticsEvent),
	workspaceMembers: many(workspaceMember),
	workspacePermissionSets: many(workspacePermissionSet),
	workspaceInvitations: many(workspaceInvitation),
	user_ownerId: one(user, {
		fields: [workspace.ownerId],
		references: [user.id],
		relationName: "workspace_ownerId_user_id"
	}),
	organization: one(organization, {
		fields: [workspace.organizationId],
		references: [organization.id]
	}),
	user_dpaAcceptedById: one(user, {
		fields: [workspace.dpaAcceptedById],
		references: [user.id],
		relationName: "workspace_dpaAcceptedById_user_id"
	}),
	painPoints: many(painPoint),
	painPointClusters: many(painPointCluster),
	painPointEmbeddings: many(painPointEmbedding),
	scrapers: many(scraper),
}));

export const organizationRelations = relations(organization, ({one, many}) => ({
	user: one(user, {
		fields: [organization.ownerId],
		references: [user.id]
	}),
	workspaces: many(workspace),
}));

export const userRelations = relations(user, ({many}) => ({
	organizations: many(organization),
	auditLogs: many(auditLog),
	workspaceMembers: many(workspaceMember),
	workspaceInvitations_invitedById: many(workspaceInvitation, {
		relationName: "workspaceInvitation_invitedById_user_id"
	}),
	workspaceInvitations_updatedById: many(workspaceInvitation, {
		relationName: "workspaceInvitation_updatedById_user_id"
	}),
	accounts: many(account),
	workspaces_ownerId: many(workspace, {
		relationName: "workspace_ownerId_user_id"
	}),
	workspaces_dpaAcceptedById: many(workspace, {
		relationName: "workspace_dpaAcceptedById_user_id"
	}),
	sessions: many(session),
	trustedDevices: many(trustedDevice),
	painPoints: many(painPoint),
	painPointClusters: many(painPointCluster),
	painPointEmbeddings: many(painPointEmbedding),
	painPointFeedbacks: many(painPointFeedback),
	purchasedCredits: many(purchasedCredits),
	scrapers: many(scraper),
	keywordStats: many(keywordStat),
	userPreferences: many(userPreferences),
	aiUsages: many(aiUsage),
}));

export const tagRelations = relations(tag, ({one, many}) => ({
	workspace: one(workspace, {
		fields: [tag.workspaceId],
		references: [workspace.id]
	}),
	testimonialToTags: many(testimonialToTag),
}));

export const widgetRelations = relations(widget, ({one, many}) => ({
	workspace: one(workspace, {
		fields: [widget.workspaceId],
		references: [workspace.id]
	}),
	analyticsEvents: many(analyticsEvent),
}));

export const testimonialRelations = relations(testimonial, ({one, many}) => ({
	workspace: one(workspace, {
		fields: [testimonial.workspaceId],
		references: [workspace.id]
	}),
	project: one(project, {
		fields: [testimonial.projectId],
		references: [project.id]
	}),
	videoTranscodingJobs: many(videoTranscodingJob),
	testimonialToTags: many(testimonialToTag),
}));

export const videoTranscodingJobRelations = relations(videoTranscodingJob, ({one}) => ({
	workspace: one(workspace, {
		fields: [videoTranscodingJob.workspaceId],
		references: [workspace.id]
	}),
	testimonial: one(testimonial, {
		fields: [videoTranscodingJob.testimonialId],
		references: [testimonial.id]
	}),
}));

export const auditLogRelations = relations(auditLog, ({one}) => ({
	workspace: one(workspace, {
		fields: [auditLog.workspaceId],
		references: [workspace.id]
	}),
	user: one(user, {
		fields: [auditLog.actorId],
		references: [user.id]
	}),
}));

export const analyticsEventRelations = relations(analyticsEvent, ({one}) => ({
	workspace: one(workspace, {
		fields: [analyticsEvent.workspaceId],
		references: [workspace.id]
	}),
	project: one(project, {
		fields: [analyticsEvent.projectId],
		references: [project.id]
	}),
	widget: one(widget, {
		fields: [analyticsEvent.widgetId],
		references: [widget.id]
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

export const workspacePermissionSetRelations = relations(workspacePermissionSet, ({one}) => ({
	workspace: one(workspace, {
		fields: [workspacePermissionSet.workspaceId],
		references: [workspace.id]
	}),
}));

export const workspaceInvitationRelations = relations(workspaceInvitation, ({one}) => ({
	workspace: one(workspace, {
		fields: [workspaceInvitation.workspaceId],
		references: [workspace.id]
	}),
	user_invitedById: one(user, {
		fields: [workspaceInvitation.invitedById],
		references: [user.id],
		relationName: "workspaceInvitation_invitedById_user_id"
	}),
	user_updatedById: one(user, {
		fields: [workspaceInvitation.updatedById],
		references: [user.id],
		relationName: "workspaceInvitation_updatedById_user_id"
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const trustedDeviceRelations = relations(trustedDevice, ({one}) => ({
	user: one(user, {
		fields: [trustedDevice.userId],
		references: [user.id]
	}),
}));

export const painPointRelations = relations(painPoint, ({one, many}) => ({
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
	painPointCluster: one(painPointCluster, {
		fields: [painPoint.clusterId],
		references: [painPointCluster.id]
	}),
	painPointComments: many(painPointComment),
	painPointEmbeddings: many(painPointEmbedding),
	painPointFeedbacks: many(painPointFeedback),
}));

export const scraperRelations = relations(scraper, ({one, many}) => ({
	painPoints: many(painPoint),
	user: one(user, {
		fields: [scraper.userId],
		references: [user.id]
	}),
	workspace: one(workspace, {
		fields: [scraper.workspaceId],
		references: [workspace.id]
	}),
	keywordStats: many(keywordStat),
	scraperRuns: many(scraperRun),
	scraperRunSummaries: many(scraperRunSummary),
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

export const painPointCommentRelations = relations(painPointComment, ({one}) => ({
	painPoint: one(painPoint, {
		fields: [painPointComment.painPointId],
		references: [painPoint.id]
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

export const painPointFeedbackRelations = relations(painPointFeedback, ({one}) => ({
	painPoint: one(painPoint, {
		fields: [painPointFeedback.painPointId],
		references: [painPoint.id]
	}),
	user: one(user, {
		fields: [painPointFeedback.userId],
		references: [user.id]
	}),
}));

export const purchasedCreditsRelations = relations(purchasedCredits, ({one}) => ({
	user: one(user, {
		fields: [purchasedCredits.userId],
		references: [user.id]
	}),
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

export const scraperRunRelations = relations(scraperRun, ({one, many}) => ({
	scraper: one(scraper, {
		fields: [scraperRun.scraperId],
		references: [scraper.id]
	}),
	scraperPosts: many(scraperPost),
}));

export const scraperPostRelations = relations(scraperPost, ({one}) => ({
	scraperRun: one(scraperRun, {
		fields: [scraperPost.runId],
		references: [scraperRun.id]
	}),
}));

export const scraperRunSummaryRelations = relations(scraperRunSummary, ({one}) => ({
	scraper: one(scraper, {
		fields: [scraperRunSummary.scraperId],
		references: [scraper.id]
	}),
}));

export const userPreferencesRelations = relations(userPreferences, ({one}) => ({
	user: one(user, {
		fields: [userPreferences.userId],
		references: [user.id]
	}),
}));

export const aiUsageRelations = relations(aiUsage, ({one}) => ({
	user: one(user, {
		fields: [aiUsage.userId],
		references: [user.id]
	}),
}));

export const testimonialToTagRelations = relations(testimonialToTag, ({one}) => ({
	testimonial: one(testimonial, {
		fields: [testimonialToTag.testimonialId],
		references: [testimonial.id]
	}),
	tag: one(tag, {
		fields: [testimonialToTag.tagId],
		references: [tag.id]
	}),
}));