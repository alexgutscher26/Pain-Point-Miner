import { pgTable, index, foreignKey, unique, text, boolean, timestamp, doublePrecision, integer, uniqueIndex, jsonb, vector, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const ltdTier = pgEnum("LtdTier", ['none', 'founder', 'professional'])
export const painPointDifficulty = pgEnum("PainPointDifficulty", ['weekend_project', 'side_project', 'startup_mvp', 'vc_scale_moat'])
export const scraperStatus = pgEnum("ScraperStatus", ['running', 'paused', 'error'])
export const analyticsEventType = pgEnum("analytics_event_type", ['view', 'click', 'video_play', 'video_progress'])
export const auditAction = pgEnum("audit_action", ['create', 'update', 'delete'])
export const plan = pgEnum("plan", ['free', 'plan_1', 'plan_2', 'ltd'])
export const subscriptionStatus = pgEnum("subscription_status", ['active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'paused', 'unpaid'])
export const testimonialStatus = pgEnum("testimonial_status", ['pending', 'approved', 'archived'])
export const testimonialType = pgEnum("testimonial_type", ['text', 'video'])
export const videoProcessingStatus = pgEnum("video_processing_status", ['pending', 'processing', 'done', 'failed'])
export const virusScanStatus = pgEnum("virus_scan_status", ['pending', 'clean', 'infected', 'error', 'skipped'])
export const workspaceRole = pgEnum("workspace_role", ['owner', 'admin', 'member'])


export const project = pgTable("project", {
	id: text().primaryKey().notNull(),
	workspaceId: text("workspace_id").notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	collectionSlug: text("collection_slug"),
	description: text(),
	thankYouMessage: text("thank_you_message"),
	collectionSettingsJson: text("collection_settings_json"),
	active: boolean().default(true).notNull(),
	customDomain: text("custom_domain"),
	customDomainVerified: boolean("custom_domain_verified").default(false).notNull(),
	customDomainVerificationToken: text("custom_domain_verification_token"),
	customDomainVerificationError: text("custom_domain_verification_error"),
	customCss: text("custom_css"),
	emailFromName: text("email_from_name"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("project_collection_slug_idx").using("btree", table.collectionSlug.asc().nullsLast().op("text_ops")),
	index("project_custom_domain_idx").using("btree", table.customDomain.asc().nullsLast().op("text_ops")),
	index("project_workspace_active_idx").using("btree", table.workspaceId.asc().nullsLast().op("bool_ops"), table.active.asc().nullsLast().op("text_ops")),
	index("project_workspace_id_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops")),
	index("project_workspace_slug_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops"), table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "project_workspace_id_workspace_id_fk"
		}).onDelete("cascade"),
	unique("project_collection_slug_unique").on(table.collectionSlug),
	unique("project_custom_domain_unique").on(table.customDomain),
]);

export const organization = pgTable("organization", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	ownerId: text().notNull(),
	plan: plan().default('free').notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	subscriptionStatus: subscriptionStatus("subscription_status"),
	trialEndsAt: timestamp("trial_ends_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("organization_owner_id_idx").using("btree", table.ownerId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "organization_ownerId_user_id_fk"
		}).onDelete("cascade"),
	unique("organization_stripe_customer_id_unique").on(table.stripeCustomerId),
]);

export const tag = pgTable("tag", {
	id: text().primaryKey().notNull(),
	workspaceId: text("workspace_id").notNull(),
	name: text().notNull(),
	color: text().default('#e8527a').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("tag_workspace_id_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "tag_workspace_id_workspace_id_fk"
		}).onDelete("cascade"),
]);

export const widget = pgTable("widget", {
	id: text().primaryKey().notNull(),
	workspaceId: text("workspace_id").notNull(),
	name: text().notNull(),
	settingsJson: text("settings_json").notNull(),
	customCss: text("custom_css"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("widget_workspace_id_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "widget_workspace_id_workspace_id_fk"
		}).onDelete("cascade"),
]);

export const testimonial = pgTable("testimonial", {
	id: text().primaryKey().notNull(),
	workspaceId: text("workspace_id").notNull(),
	projectId: text("project_id").notNull(),
	content: text(),
	rating: doublePrecision().default(5),
	authorName: text("author_name"),
	authorEmail: text("author_email"),
	authorImage: text("author_image"),
	authorCompany: text("author_company"),
	authorLinkedin: text("author_linkedin"),
	authorTagline: text("author_tagline"),
	verifiedVia: text("verified_via"),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	verifiedId: text("verified_id"),
	status: testimonialStatus().default('pending').notNull(),
	type: testimonialType().default('text').notNull(),
	videoUrl: text("video_url"),
	videoTranscodesJson: text("video_transcodes_json"),
	videoProcessingStatus: videoProcessingStatus("video_processing_status").default('pending'),
	virusScanStatus: virusScanStatus("virus_scan_status").default('pending'),
	virusScanHash: text("virus_scan_hash"),
	featured: boolean().default(false).notNull(),
	featuredOrder: integer("featured_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("testimonial_project_id_idx").using("btree", table.projectId.asc().nullsLast().op("text_ops")),
	index("testimonial_project_status_createdAt_idx").using("btree", table.projectId.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("testimonial_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("testimonial_workspace_id_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "testimonial_workspace_id_workspace_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [project.id],
			name: "testimonial_project_id_project_id_fk"
		}).onDelete("cascade"),
]);

export const videoTranscodingJob = pgTable("video_transcoding_job", {
	id: text().primaryKey().notNull(),
	workspaceId: text("workspace_id").notNull(),
	testimonialId: text("testimonial_id").notNull(),
	sourceKey: text("source_key").notNull(),
	status: videoProcessingStatus().default('pending').notNull(),
	outputKeysJson: text("output_keys_json"),
	error: text(),
	attempts: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	processedAt: timestamp("processed_at", { mode: 'string' }),
}, (table) => [
	index("transcoding_job_status_created_at_idx").using("btree", table.status.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("enum_ops")),
	index("transcoding_job_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("transcoding_job_testimonial_id_idx").using("btree", table.testimonialId.asc().nullsLast().op("text_ops")),
	index("transcoding_job_workspace_id_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "video_transcoding_job_workspace_id_workspace_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.testimonialId],
			foreignColumns: [testimonial.id],
			name: "video_transcoding_job_testimonial_id_testimonial_id_fk"
		}).onDelete("cascade"),
]);

export const auditLog = pgTable("audit_log", {
	id: text().primaryKey().notNull(),
	workspaceId: text("workspace_id"),
	actorId: text("actor_id").notNull(),
	entityType: text("entity_type").notNull(),
	entityId: text("entity_id").notNull(),
	action: auditAction().notNull(),
	diff: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("audit_log_actor_id_idx").using("btree", table.actorId.asc().nullsLast().op("text_ops")),
	index("audit_log_entity_idx").using("btree", table.entityType.asc().nullsLast().op("text_ops"), table.entityId.asc().nullsLast().op("text_ops")),
	index("audit_log_workspace_id_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "audit_log_workspace_id_workspace_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [user.id],
			name: "audit_log_actor_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const analyticsEvent = pgTable("analytics_event", {
	id: text().primaryKey().notNull(),
	workspaceId: text("workspace_id").notNull(),
	projectId: text("project_id"),
	widgetId: text("widget_id"),
	visitorId: text("visitor_id"),
	eventType: analyticsEventType("event_type").notNull(),
	metadataJson: text("metadata_json"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("analytics_event_project_id_idx").using("btree", table.projectId.asc().nullsLast().op("text_ops")),
	index("analytics_event_type_idx").using("btree", table.eventType.asc().nullsLast().op("enum_ops")),
	index("analytics_event_visitor_id_idx").using("btree", table.visitorId.asc().nullsLast().op("text_ops")),
	index("analytics_event_widget_id_idx").using("btree", table.widgetId.asc().nullsLast().op("text_ops")),
	index("analytics_event_widget_type_createdAt_idx").using("btree", table.widgetId.asc().nullsLast().op("timestamp_ops"), table.eventType.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("enum_ops")),
	index("analytics_event_workspace_id_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops")),
	index("analytics_event_workspace_type_createdAt_idx").using("btree", table.workspaceId.asc().nullsLast().op("enum_ops"), table.eventType.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "analytics_event_workspace_id_workspace_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [project.id],
			name: "analytics_event_project_id_project_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.widgetId],
			foreignColumns: [widget.id],
			name: "analytics_event_widget_id_widget_id_fk"
		}).onDelete("set null"),
]);

export const workspaceMember = pgTable("workspace_member", {
	id: text().primaryKey().notNull(),
	workspaceId: text("workspace_id").notNull(),
	userId: text("user_id").notNull(),
	role: workspaceRole().default('member').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("workspace_member_role_idx").using("btree", table.role.asc().nullsLast().op("enum_ops")),
	index("workspace_member_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("workspace_member_workspace_id_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops")),
	index("workspace_member_workspace_user_role_idx").using("btree", table.workspaceId.asc().nullsLast().op("enum_ops"), table.userId.asc().nullsLast().op("text_ops"), table.role.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "workspace_member_workspace_id_workspace_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "workspace_member_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const workspacePermissionSet = pgTable("workspace_permission_set", {
	id: text().primaryKey().notNull(),
	workspaceId: text("workspace_id").notNull(),
	role: workspaceRole().notNull(),
	permissionsJson: text("permissions_json").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("workspace_permission_set_workspace_role_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops"), table.role.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "workspace_permission_set_workspace_id_workspace_id_fk"
		}).onDelete("cascade"),
]);

export const workspaceInvitation = pgTable("workspace_invitation", {
	id: text().primaryKey().notNull(),
	workspaceId: text("workspace_id").notNull(),
	email: text().notNull(),
	role: workspaceRole().default('member').notNull(),
	token: text().notNull(),
	invitedById: text("invited_by_id").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	updatedById: text("updated_by_id"),
}, (table) => [
	index("workspace_invitation_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("workspace_invitation_token_idx").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("workspace_invitation_workspace_id_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "workspace_invitation_workspace_id_workspace_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.invitedById],
			foreignColumns: [user.id],
			name: "workspace_invitation_invited_by_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.updatedById],
			foreignColumns: [user.id],
			name: "workspace_invitation_updated_by_id_user_id_fk"
		}),
	unique("workspace_invitation_token_unique").on(table.token),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const workspace = pgTable("workspace", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	ownerId: text().notNull(),
	organizationId: text("organization_id"),
	logoUrl: text("logo_url"),
	plan: plan().default('free').notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	subscriptionStatus: subscriptionStatus("subscription_status"),
	brandingJson: text("branding_json"),
	notificationSettingsJson: text("notification_settings_json"),
	onboardingStatus: text("onboarding_status"),
	dpaAcceptedAt: timestamp("dpa_accepted_at", { mode: 'string' }),
	dpaAcceptedById: text("dpa_accepted_by_id"),
	retentionEnabled: boolean("retention_enabled").default(false).notNull(),
	retentionDays: integer("retention_days").default(365),
	trialEndsAt: timestamp("trial_ends_at", { mode: 'string' }),
	badgeRemovedUntil: timestamp("badge_removed_until", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("workspace_dpa_accepted_idx").using("btree", table.dpaAcceptedAt.asc().nullsLast().op("timestamp_ops")),
	index("workspace_organization_id_idx").using("btree", table.organizationId.asc().nullsLast().op("text_ops")),
	index("workspace_owner_id_idx").using("btree", table.ownerId.asc().nullsLast().op("text_ops")),
	index("workspace_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	uniqueIndex("workspace_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "workspace_ownerId_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "workspace_organization_id_organization_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.dpaAcceptedById],
			foreignColumns: [user.id],
			name: "workspace_dpa_accepted_by_id_user_id_fk"
		}),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "workspace_ownerId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	unique("workspace_slug_unique").on(table.slug),
	unique("workspace_stripe_customer_id_unique").on(table.stripeCustomerId),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	lastLoginMethod: text("last_login_method"),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	plan: text().default('free').notNull(),
	referralCode: text("referral_code"),
	referredById: text("referred_by_id"),
	referralActivatedAt: timestamp("referral_activated_at", { mode: 'string' }),
}, (table) => [
	uniqueIndex("user_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("user_email_unique").on(table.email),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	uniqueIndex("session_token_key").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const trustedDevice = pgTable("trusted_device", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	city: text(),
	country: text(),
	lastUsedAt: timestamp("last_used_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("trustedDevice_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("trustedDevice_userId_ip_ua_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.ipAddress.asc().nullsLast().op("text_ops"), table.userAgent.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "trusted_device_user_id_user_id_fk"
		}).onDelete("cascade"),
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

export const discoveryCache = pgTable("discovery_cache", {
	keyword: text().primaryKey().notNull(),
	suggestions: jsonb().notNull(),
	cachedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const painPoint = pgTable("pain_point", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	body: text().notNull(),
	postUrl: text(),
	author: text(),
	score: integer().default(0).notNull(),
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
	index("pain_point_userId_clusterId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.clusterId.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("pain_point_userId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("pain_point_workspaceId_scraperId_createdAt_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops"), table.scraperId.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsLast().op("text_ops")),
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
	index("pain_point_embedding_hnsw_idx").using("hnsw", table.embedding.asc().nullsLast().op("vector_cosine_ops")),
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

export const scraper = pgTable("scraper", {
	id: text().primaryKey().notNull(),
	keywords: text().array(),
	frequency: integer().default(15).notNull(),
	status: scraperStatus().default('running').notNull(),
	postsScanned: integer().default(0).notNull(),
	painPointsFound: integer().default(0).notNull(),
	lastRunAt: timestamp({ precision: 3, mode: 'string' }),
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
	index("keyword_stat_userId_painPointsFound_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.painPointsFound.asc().nullsLast().op("int4_ops")),
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

export const testimonialToTag = pgTable("testimonial_to_tag", {
	testimonialId: text("testimonial_id").notNull(),
	tagId: text("tag_id").notNull(),
}, (table) => [
	index("testimonial_to_tag_tag_id_idx").using("btree", table.tagId.asc().nullsLast().op("text_ops")),
	index("testimonial_to_tag_testimonial_id_idx").using("btree", table.testimonialId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.testimonialId],
			foreignColumns: [testimonial.id],
			name: "testimonial_to_tag_testimonial_id_testimonial_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [tag.id],
			name: "testimonial_to_tag_tag_id_tag_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.testimonialId, table.tagId], name: "testimonial_to_tag_testimonial_id_tag_id_pk"}),
]);
