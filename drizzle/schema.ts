import { pgTable, uniqueIndex, foreignKey, text, integer, timestamp, index, doublePrecision, vector, boolean, jsonb, unique, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const ltdTier = pgEnum("LtdTier", ['none', 'founder', 'professional'])
export const painPointDifficulty = pgEnum("PainPointDifficulty", ['weekend_project', 'side_project', 'startup_mvp', 'vc_scale_moat'])
export const scraperStatus = pgEnum("ScraperStatus", ['running', 'paused', 'error'])


export const painPointFeedback = pgTable("pain_point_feedback", {
	id: text().primaryKey().notNull(),
	painPointId: text().notNull(),
	userId: text().notNull(),
	vote: integer().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("pain_point_feedback_painPointId_userId_key").using("btree", table.painPointId.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.painPointId],
			foreignColumns: [painPoint.id],
			name: "pain_point_feedback_painPointId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "pain_point_feedback_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const purchasedCredits = pgTable("purchased_credits", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	amount: integer().default(0).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("purchased_credits_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "purchased_credits_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const scraperRun = pgTable("scraper_run", {
	id: text().primaryKey().notNull(),
	scraperId: text().notNull(),
	status: text().default('success').notNull(),
	startedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	finishedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	postsFetched: integer().default(0).notNull(),
	postsMatched: integer().default(0).notNull(),
	commentsFetched: integer().default(0).notNull(),
	newPainPoints: integer().default(0).notNull(),
	fromComments: integer().default(0).notNull(),
	error: text(),
	throttleWarnings: text().array().default([""]),
	postsSkipped: integer().default(0).notNull(),
	cost: doublePrecision().default(0).notNull(),
	workspaceId: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("scraper_run_scraperId_startedAt_idx").using("btree", table.scraperId.asc().nullsLast().op("text_ops"), table.startedAt.asc().nullsLast().op("text_ops")),
	index("scraper_run_workspaceId_status_createdAt_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.scraperId],
			foreignColumns: [scraper.id],
			name: "scraper_run_scraperId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const redditAiIdempotency = pgTable("reddit_ai_idempotency", {
	redditPostId: text().primaryKey().notNull(),
	lastProcessedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	lastProcessedBy: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("reddit_ai_idempotency_lastProcessedAt_idx").using("btree", table.lastProcessedAt.asc().nullsLast().op("timestamp_ops")),
]);

export const redditRateLimitLog = pgTable("reddit_rate_limit_log", {
	id: text().primaryKey().notNull(),
	subreddit: text(),
	userAgent: text().notNull(),
	url: text().notNull(),
	statusCode: integer().notNull(),
	retryAfter: integer(),
	error: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const painPointEmbedding = pgTable("pain_point_embedding", {
	painPointId: text().primaryKey().notNull(),
	userId: text().notNull(),
	workspaceId: text(),
	provider: text().notNull(),
	model: text().notNull(),
	dimensions: integer().notNull(),
	embedding: vector({ dimensions: 1536 }).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("pain_point_embedding_hnsw_idx").using("hnsw", table.embedding.asc().nullsLast().op("vector_cosine_ops")).with({ m: 24, ef_construction: 200 }),
	index("pain_point_embedding_userId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
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

export const scraperRunSummary = pgTable("scraper_run_summary", {
	id: text().primaryKey().notNull(),
	scraperId: text().notNull(),
	workspaceId: text(),
	month: text().notNull(),
	runsCount: integer().default(0).notNull(),
	totalPostsFetched: integer().default(0).notNull(),
	totalPostsMatched: integer().default(0).notNull(),
	totalCommentsFetched: integer().default(0).notNull(),
	totalNewPainPoints: integer().default(0).notNull(),
	totalCost: doublePrecision().default(0).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("scraper_run_summary_scraperId_month_key").using("btree", table.scraperId.asc().nullsLast().op("text_ops"), table.month.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.scraperId],
			foreignColumns: [scraper.id],
			name: "scraper_run_summary_scraperId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { precision: 3, mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	uniqueIndex("session_token_key").using("btree", table.token.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const scraper = pgTable("scraper", {
	id: text().primaryKey().notNull(),
	keywords: text().array(),
	frequency: integer().default(15).notNull(),
	status: scraperStatus().default('running').notNull(),
	postsScanned: integer().default(0).notNull(),
	painPointsFound: integer().default(0).notNull(),
	lastRunAt: timestamp({ precision: 3, mode: 'string' }),
	lastSuccessfulRunAt: timestamp({ precision: 3, mode: 'string' }),
	userId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	errorCount: integer().default(0).notNull(),
	lastError: text(),
	sortModes: text().array().default(["new", "hot", "top_week"]),
	subreddits: text().array(),
	customPatterns: text().array().default([""]),
	miningDepth: text().default('basic').notNull(),
	timeWindow: text().default('90d').notNull(),
	reportSaved: boolean().default(false).notNull(),
	reportCategory: text().default('Uncategorized').notNull(),
	reportSavedAt: timestamp({ precision: 3, mode: 'string' }),
	workspaceId: text(),
	deletedAt: timestamp({ precision: 3, mode: 'string' }),
	cost: doublePrecision().default(1).notNull(),
}, (table) => [
	index("scraper_createdAt_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("scraper_userId_workspaceId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("timestamp_ops"), table.workspaceId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
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

export const slowQueryLog = pgTable("slow_query_log", {
	id: text().primaryKey().notNull(),
	query: text().notNull(),
	params: text(),
	durationMs: integer().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const subredditCache = pgTable("subreddit_cache", {
	name: text().primaryKey().notNull(),
	subscriberCount: integer(),
	description: text(),
	activeUsers: integer(),
	category: text(),
	cachedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const subscription = pgTable("subscription", {
	id: text().primaryKey().notNull(),
	plan: text().notNull(),
	referenceId: text().notNull(),
	stripeCustomerId: text(),
	stripeSubscriptionId: text(),
	status: text().default('incomplete').notNull(),
	periodStart: timestamp({ precision: 3, mode: 'string' }),
	periodEnd: timestamp({ precision: 3, mode: 'string' }),
	trialStart: timestamp({ precision: 3, mode: 'string' }),
	trialEnd: timestamp({ precision: 3, mode: 'string' }),
	cancelAtPeriodEnd: boolean().default(false),
	cancelAt: timestamp({ precision: 3, mode: 'string' }),
	canceledAt: timestamp({ precision: 3, mode: 'string' }),
	endedAt: timestamp({ precision: 3, mode: 'string' }),
	seats: integer(),
	billingInterval: text(),
	stripeScheduleId: text(),
	limits: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("subscription_referenceId_idx").using("btree", table.referenceId.asc().nullsLast().op("text_ops")),
	index("subscription_stripeCustomerId_idx").using("btree", table.stripeCustomerId.asc().nullsLast().op("text_ops")),
	index("subscription_stripeSubscriptionId_idx").using("btree", table.stripeSubscriptionId.asc().nullsLast().op("text_ops")),
]);

export const tool = pgTable("tool", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	url: text(),
	description: text(),
	category: text(),
	iconUrl: text(),
	lastCrawledAt: timestamp({ precision: 3, mode: 'string' }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("tool_slug_unique").on(table.slug),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	username: text(),
	displayUsername: text("display_username"),
	stripeCustomerId: text("stripe_customer_id"),
	image: text(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	anonymizeRedditUsernames: boolean("anonymize_reddit_usernames").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { precision: 3, mode: 'string' }),
	role: text().default('user').notNull(),
	ltdTier: ltdTier("ltd_tier").default('none').notNull(),
	ltdPricePaid: doublePrecision("ltd_price_paid").default(0),
	lastLoginMethod: text("last_login_method"),
	plan: text(),
	referralCode: text("referral_code"),
	referredById: text("referred_by_id"),
	referralActivatedAt: timestamp("referral_activated_at", { precision: 3, mode: 'string' }),
}, (table) => [
	uniqueIndex("user_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("user_username_key").using("btree", table.username.asc().nullsLast().op("text_ops")),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { precision: 3, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }),
});

export const workspace = pgTable("workspace", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	ownerId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	deletedAt: timestamp({ precision: 3, mode: 'string' }),
	plan: text(),
}, (table) => [
	uniqueIndex("workspace_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "workspace_ownerId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const scraperPost = pgTable("scraper_post", {
	id: text().primaryKey().notNull(),
	runId: text().notNull(),
	postId: text().notNull(),
	commentCount: integer().default(0).notNull(),
	qualityScore: doublePrecision().default(0).notNull(),
	skipReason: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("scraper_post_postId_idx").using("btree", table.postId.asc().nullsLast().op("text_ops")),
	index("scraper_post_runId_idx").using("btree", table.runId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.runId],
			foreignColumns: [scraperRun.id],
			name: "scraper_post_runId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const userPreferences = pgTable("user_preferences", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	theme: text().default('system').notNull(),
	defaultAiModel: text().default('google/gemini-2.0-flash-001').notNull(),
	emailNotifications: boolean().default(true).notNull(),
	timezone: text(),
	anniversaryDate: timestamp({ precision: 3, mode: 'string' }),
	onboardingComplete: boolean().default(false).notNull(),
	dashboardLayout: jsonb(),
	scoringWeights: jsonb(),
}, (table) => [
	uniqueIndex("user_preferences_userId_key").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_preferences_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const workspaceMember = pgTable("workspace_member", {
	id: text().primaryKey().notNull(),
	workspaceId: text().notNull(),
	userId: text().notNull(),
	role: text().default('member').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
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

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { precision: 3, mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { precision: 3, mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const aiEvalLog = pgTable("ai_eval_log", {
	id: text().primaryKey().notNull(),
	modelId: text().notNull(),
	f1Score: doublePrecision().notNull(),
	precision: doublePrecision().notNull(),
	recall: doublePrecision().notNull(),
	runDate: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	switched: boolean().default(false).notNull(),
	flaggedForReview: boolean().default(false).notNull(),
	reasoning: text().notNull(),
	comparisonModelId: text(),
	improvementPercentage: doublePrecision(),
	evalMetadata: jsonb(),
});

export const aiGoldenDataset = pgTable("ai_golden_dataset", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	selftext: text(),
	subreddit: text().notNull(),
	comments: jsonb().notNull(),
	expectedPainPoints: jsonb().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const aiUsage = pgTable("ai_usage", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	modelId: text().notNull(),
	inputTokens: integer().default(0).notNull(),
	outputTokens: integer().default(0).notNull(),
	costUsd: doublePrecision().default(0).notNull(),
	scraperId: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("ai_usage_modelId_createdAt_idx").using("btree", table.modelId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("ai_usage_userId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "ai_usage_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const keywordStat = pgTable("keyword_stat", {
	id: text().primaryKey().notNull(),
	keyword: text().notNull(),
	painPointsFound: integer().default(0).notNull(),
	lastMatchedAt: timestamp({ precision: 3, mode: 'string' }),
	scraperId: text().notNull(),
	userId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("keyword_stat_scraperId_keyword_key").using("btree", table.scraperId.asc().nullsLast().op("text_ops"), table.keyword.asc().nullsLast().op("text_ops")),
	index("keyword_stat_userId_painPointsFound_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.painPointsFound.asc().nullsLast().op("text_ops")),
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

export const painPoint = pgTable("pain_point", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	body: text().notNull(),
	postUrl: text(),
	author: text(),
	score: integer().default(0).notNull(),
	upvoteCount: integer().default(0).notNull(),
	urgency: integer().default(0),
	monetizationScore: integer().default(0),
	marketMaturity: integer().default(0),
	budget: jsonb(),
	switchingCosts: text(),
	triedSolutions: text().array().default([""]),
	category: text(),
	scraperId: text().notNull(),
	userId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	sentiment: text(),
	subreddit: text(),
	commentCount: integer().default(0).notNull(),
	mentionCount: integer().default(0).notNull(),
	tags: text().array().default([""]),
	workspaceId: text(),
	deletedAt: timestamp({ precision: 3, mode: 'string' }),
	flair: text(),
	isSelf: boolean(),
	subredditDisplayName: text(),
	thumbnailUrl: text(),
	clusterId: text(),
	clusterSimilarity: doublePrecision(),
	scoreExplanation: text(),
	difficulty: painPointDifficulty().default('weekend_project'),
}, (table) => [
	index("pain_point_scraperId_idx").using("btree", table.scraperId.asc().nullsLast().op("text_ops")),
	index("pain_point_userId_clusterId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.clusterId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("pain_point_userId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("pain_point_workspaceId_scraperId_createdAt_idx").using("btree", table.workspaceId.asc().nullsLast().op("timestamp_ops"), table.scraperId.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsLast().op("text_ops")),
	index("pain_point_tags_idx").using("gin", table.tags.asc().nullsLast().op("array_ops")),
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
	memberCount: integer().default(0).notNull(),
	estimatedTamUsdAnnual: integer(),
	competitorIntel: jsonb(),
	budgetSignalCount: integer().default(0).notNull(),
	lastMatchedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("pain_point_cluster_userId_embeddingProvider_embeddingModel_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.embeddingProvider.asc().nullsLast().op("text_ops"), table.embeddingModel.asc().nullsLast().op("text_ops")),
	index("pain_point_cluster_userId_lastMatchedAt_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.lastMatchedAt.asc().nullsLast().op("text_ops")),
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

export const painPointComment = pgTable("pain_point_comment", {
	id: text().primaryKey().notNull(),
	body: text().notNull(),
	author: text(),
	score: integer().default(0).notNull(),
	commentUrl: text(),
	painScore: integer().default(0).notNull(),
	painPointId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.painPointId],
			foreignColumns: [painPoint.id],
			name: "pain_point_comment_painPointId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const discoveryCache = pgTable("discovery_cache", {
	keyword: text().primaryKey().notNull(),
	suggestions: jsonb().notNull(),
	cachedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const dbMaintenanceLog = pgTable("db_maintenance_log", {
	id: text().primaryKey().notNull(),
	taskName: text().notNull(),
	indexName: text(),
	sizeBeforeBytes: doublePrecision(),
	sizeAfterBytes: doublePrecision(),
	durationMs: integer(),
	latencyBeforeMs: doublePrecision(),
	latencyAfterMs: doublePrecision(),
	alertTriggered: boolean().default(false).notNull(),
	error: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});
