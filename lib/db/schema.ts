import { pgTable, foreignKey, text, integer, timestamp, index, boolean, uniqueIndex, jsonb, doublePrecision, vector, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const automationStatus = pgEnum("AutomationStatus", ['active', 'paused'])
export const scraperStatus = pgEnum("ScraperStatus", ['running', 'paused', 'error'])


export const painPointComment = pgTable("pain_point_comment", {
	id: text().primaryKey().notNull(),
	body: text().notNull(),
	author: text(),
	score: integer().default(0).notNull(),
	commentUrl: text(),
	painScore: integer().default(0).notNull(),
	painPointId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.painPointId],
			foreignColumns: [painPoint.id],
			name: "pain_point_comment_painPointId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const opportunity = pgTable("opportunity", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	score: integer().default(0).notNull(),
	category: text().notNull(),
	painPointCount: integer().default(0).notNull(),
	marketSize: text().notNull(),
	competition: text().notNull(),
	difficulty: text().notNull(),
	topPainPoints: text().array(),
	potentialMrr: text().notNull(),
	saved: boolean().default(false).notNull(),
	userId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	actionPlan: text().array(),
	monetization: text().default('').notNull(),
	mvpFeatures: text().array(),
	targetAudience: text().default('').notNull(),
	whyItExists: text().default('').notNull(),
	workspaceId: text(),
	deletedAt: timestamp({ precision: 3, mode: 'date' }),
	buildPlan: text().default('').notNull(),
	competitorIntel: text().default('').notNull(),
	scoreExplanation: text().default('').notNull(),
}, (table) => [
	index("opportunity_userId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "opportunity_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "opportunity_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const scraperRun = pgTable("scraper_run", {
	id: text().primaryKey().notNull(),
	scraperId: text().notNull(),
	status: text().default('success').notNull(),
	startedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	finishedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	postsFetched: integer().default(0).notNull(),
	postsMatched: integer().default(0).notNull(),
	commentsFetched: integer().default(0).notNull(),
	newPainPoints: integer().default(0).notNull(),
	fromComments: integer().default(0).notNull(),
	error: text(),
}, (table) => [
	foreignKey({
			columns: [table.scraperId],
			foreignColumns: [scraper.id],
			name: "scraper_run_scraperId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const keywordStat = pgTable("keyword_stat", {
	id: text().primaryKey().notNull(),
	keyword: text().notNull(),
	painPointsFound: integer().default(0).notNull(),
	lastMatchedAt: timestamp({ precision: 3, mode: 'date' }),
	scraperId: text().notNull(),
	userId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
}, (table) => [
	uniqueIndex("keyword_stat_scraperId_keyword_key").using("btree", table.scraperId.asc().nullsLast().op("text_ops"), table.keyword.asc().nullsLast().op("text_ops")),
	index("keyword_stat_userId_painPointsFound_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.painPointsFound.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.scraperId],
			foreignColumns: [scraper.id],
			name: "keyword_stat_scraperId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "keyword_stat_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const notification = pgTable("notification", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	type: text().notNull(),
	target: text().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	status: text().default('queued').notNull(),
	error: text(),
	automationId: text(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	workspaceId: text(),
	deletedAt: timestamp({ precision: 3, mode: 'date' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "notification_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "notification_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }),
	updatedAt: timestamp({ precision: 3, mode: 'date' }),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().notNull(),
	username: text(),
	displayUsername: text(),
	stripeCustomerId: text(),
	image: text(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
}, (table) => [
	uniqueIndex("user_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("user_username_key").using("btree", table.username.asc().nullsLast().op("text_ops")),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
}, (table) => [
	uniqueIndex("session_token_key").using("btree", table.token.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ precision: 3, mode: 'date' }),
	refreshTokenExpiresAt: timestamp({ precision: 3, mode: 'date' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const subscription = pgTable("subscription", {
	id: text().primaryKey().notNull(),
	plan: text().notNull(),
	referenceId: text().notNull(),
	stripeCustomerId: text(),
	stripeSubscriptionId: text(),
	status: text().default('incomplete').notNull(),
	periodStart: timestamp({ precision: 3, mode: 'date' }),
	periodEnd: timestamp({ precision: 3, mode: 'date' }),
	trialStart: timestamp({ precision: 3, mode: 'date' }),
	trialEnd: timestamp({ precision: 3, mode: 'date' }),
	cancelAtPeriodEnd: boolean().default(false),
	cancelAt: timestamp({ precision: 3, mode: 'date' }),
	canceledAt: timestamp({ precision: 3, mode: 'date' }),
	endedAt: timestamp({ precision: 3, mode: 'date' }),
	seats: integer(),
	billingInterval: text(),
	stripeScheduleId: text(),
	limits: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
}, (table) => [
	index("subscription_referenceId_idx").using("btree", table.referenceId.asc().nullsLast().op("text_ops")),
	index("subscription_stripeCustomerId_idx").using("btree", table.stripeCustomerId.asc().nullsLast().op("text_ops")),
	index("subscription_stripeSubscriptionId_idx").using("btree", table.stripeSubscriptionId.asc().nullsLast().op("text_ops")),
]);

export const scraper = pgTable("scraper", {
	id: text().primaryKey().notNull(),
	keywords: text().array(),
	frequency: integer().default(15).notNull(),
	status: scraperStatus().default('running').notNull(),
	postsScanned: integer().default(0).notNull(),
	painPointsFound: integer().default(0).notNull(),
	lastRunAt: timestamp({ precision: 3, mode: 'date' }),
	userId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	errorCount: integer().default(0).notNull(),
	lastError: text(),
	sortModes: text().array().default(["new", "hot", "top_week"]),
	subreddits: text().array(),
	customPatterns: text().array().default(sql`'{}'::text[]`),
	miningDepth: text().default('basic').notNull(),
	reportSaved: boolean().default(false).notNull(),
	reportCategory: text().default('Uncategorized').notNull(),
	reportSavedAt: timestamp({ precision: 3, mode: 'date' }),
	workspaceId: text(),
	deletedAt: timestamp({ precision: 3, mode: 'date' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "scraper_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "scraper_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const report = pgTable("report", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	type: text().default('Custom').notNull(),
	content: text().notNull(),
	keyInsight: text().notNull(),
	painPointsAnalyzed: integer().default(0).notNull(),
	opportunitiesFound: integer().default(0).notNull(),
	userId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	workspaceId: text(),
	scheduledType: text(),
	deletedAt: timestamp({ precision: 3, mode: 'date' }),
}, (table) => [
	index("report_userId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "report_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "report_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const workspaceMember = pgTable("workspace_member", {
	id: text().primaryKey().notNull(),
	workspaceId: text().notNull(),
	userId: text().notNull(),
	role: text().default('member').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
}, (table) => [
	uniqueIndex("workspace_member_workspaceId_userId_key").using("btree", table.workspaceId.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "workspace_member_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "workspace_member_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const userPreferences = pgTable("user_preferences", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	theme: text().default('system').notNull(),
	defaultAiModel: text().default('google/gemini-2.0-flash-001').notNull(),
	emailNotifications: boolean().default(true).notNull(),
	timezone: text(),
	dashboardLayout: jsonb(),
}, (table) => [
	uniqueIndex("user_preferences_userId_key").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_preferences_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const apiKey = pgTable("api_key", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	key: text().notNull(),
	userId: text().notNull(),
	lastUsedAt: timestamp({ precision: 3, mode: 'date' }),
	expiresAt: timestamp({ precision: 3, mode: 'date' }),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("api_key_key_key").using("btree", table.key.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "api_key_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const userTag = pgTable("user_tag", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	color: text(),
	workspaceId: text().notNull(),
	deletedAt: timestamp({ precision: 3, mode: 'date' }),
}, (table) => [
	uniqueIndex("user_tag_workspaceId_name_key").using("btree", table.workspaceId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "user_tag_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const opportunityNote = pgTable("opportunity_note", {
	id: text().primaryKey().notNull(),
	body: text().notNull(),
	userId: text().notNull(),
	opportunityId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	deletedAt: timestamp({ precision: 3, mode: 'date' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "opportunity_note_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.opportunityId],
			foreignColumns: [opportunity.id],
			name: "opportunity_note_opportunityId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const painPointGroup = pgTable("pain_point_group", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	workspaceId: text(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	deletedAt: timestamp({ precision: 3, mode: 'date' }),
}, (table) => [
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "pain_point_group_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const workspace = pgTable("workspace", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	ownerId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	deletedAt: timestamp({ precision: 3, mode: 'date' }),
}, (table) => [
	uniqueIndex("workspace_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "workspace_ownerId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const automation = pgTable("automation", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	triggerType: text().notNull(),
	triggerValue: text().notNull(),
	actionType: text().notNull(),
	status: automationStatus().default('active').notNull(),
	timesTriggered: integer().default(0).notNull(),
	lastTriggeredAt: timestamp({ precision: 3, mode: 'date' }),
	userId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	workspaceId: text(),
	deletedAt: timestamp({ precision: 3, mode: 'date' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "automation_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "automation_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const aiUsage = pgTable("ai_usage", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	model: text().notNull(),
	feature: text().notNull(),
	promptTokens: integer().default(0).notNull(),
	completionTokens: integer().default(0).notNull(),
	totalTokens: integer().default(0).notNull(),
	cost: doublePrecision().default(0).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("ai_usage_userId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("ai_usage_userId_feature_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.feature.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "ai_usage_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const painPoint = pgTable("pain_point", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	body: text().notNull(),
	postUrl: text(),
	author: text(),
	score: integer().default(0).notNull(), // This is our painIntensity
	urgency: integer().default(0),
	monetizationScore: integer().default(0),
	marketMaturity: integer().default(0),
	budget: text(),
	switchingCosts: text(),
	triedSolutions: text().array().default(sql`'{}'::text[]`),
	category: text(),
	scraperId: text().notNull(),
	userId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
	sentiment: text(),
	subreddit: text(),
	commentCount: integer().default(0).notNull(),
	mentionCount: integer().default(0).notNull(),
	tags: text().array().default(sql`'{}'::text[]`),
	workspaceId: text(),
	groupId: text(),
	deletedAt: timestamp({ precision: 3, mode: 'date' }),
	flair: text(),
	isSelf: boolean(),
	subredditDisplayName: text(),
	thumbnailUrl: text(),
	clusterId: text(),
	clusterSimilarity: doublePrecision(),
}, (table) => [
	index("pain_point_userId_clusterId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.clusterId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("pain_point_userId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.scraperId],
			foreignColumns: [scraper.id],
			name: "pain_point_scraperId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "pain_point_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "pain_point_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [painPointGroup.id],
			name: "pain_point_groupId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.clusterId],
			foreignColumns: [painPointCluster.id],
			name: "pain_point_clusterId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const painPointCluster = pgTable("pain_point_cluster", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	workspaceId: text(),
	embeddingProvider: text().notNull(),
	embeddingModel: text().notNull(),
	embedding: doublePrecision().array(),
	canonicalTitle: text().notNull(),
	canonicalBody: text().notNull(),
	sourceCount: integer().default(1).notNull(),
	lastMatchedAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
}, (table) => [
	index("pain_point_cluster_userId_embeddingProvider_embeddingModel_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.embeddingProvider.asc().nullsLast().op("text_ops"), table.embeddingModel.asc().nullsLast().op("text_ops")),
	index("pain_point_cluster_userId_lastMatchedAt_idx").using("btree", table.userId.asc().nullsLast().op("timestamp_ops"), table.lastMatchedAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "pain_point_cluster_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "pain_point_cluster_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const painPointEmbedding = pgTable("pain_point_embedding", {
	painPointId: text().primaryKey().notNull(),
	userId: text().notNull(),
	workspaceId: text(),
	provider: text().notNull(),
	model: text().notNull(),
	dimensions: integer().notNull(),
	embedding: vector({ dimensions: 1536 }).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
}, (table) => [
	index("pain_point_embedding_userId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("pain_point_embedding_userId_provider_model_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.provider.asc().nullsLast().op("text_ops"), table.model.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.painPointId],
			foreignColumns: [painPoint.id],
			name: "pain_point_embedding_painPointId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "pain_point_embedding_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "pain_point_embedding_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const painPointToTag = pgTable("_PainPointToTag", {
	a: text("A").notNull(),
	b: text("B").notNull(),
}, (table) => [
	index().using("btree", table.b.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.a],
			foreignColumns: [painPoint.id],
			name: "_PainPointToTag_A_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.b],
			foreignColumns: [userTag.id],
			name: "_PainPointToTag_B_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	primaryKey({ columns: [table.a, table.b], name: "_PainPointToTag_AB_pkey"}),
]);

export const opportunityScrapers = pgTable("_OpportunityScrapers", {
	a: text("A").notNull(),
	b: text("B").notNull(),
}, (table) => [
	index().using("btree", table.b.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.a],
			foreignColumns: [opportunity.id],
			name: "_OpportunityScrapers_A_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.b],
			foreignColumns: [scraper.id],
			name: "_OpportunityScrapers_B_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	primaryKey({ columns: [table.a, table.b], name: "_OpportunityScrapers_AB_pkey"}),
]);
