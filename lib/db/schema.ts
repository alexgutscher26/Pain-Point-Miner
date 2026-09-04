import {
  boolean,
  doublePrecision,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgMaterializedView,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  vector,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { BudgetSignal } from "@/lib/budget-signals";

export type CompetitorIntel = {
  name: string;
  url: string | null;
  description: string | null;
  mentionCount: number;
  category: string | null;
  iconUrl: string | null;
};

export const scraperStatus = pgEnum("ScraperStatus", [
  "running",
  "paused",
  "error",
]);

export const ltdTier = pgEnum("LtdTier", ["none", "founder", "professional"]);
export const painPointDifficulty = pgEnum("PainPointDifficulty", [
  "weekend_project",
  "side_project",
  "startup_mvp",
  "vc_scale_moat",
]);

export const painPointSourceType = pgEnum("PainPointSourceType", [
  "post",
  "comment",
  "cross_post",
]);

export const verification = pgTable("verification", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at", { precision: 3, mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { precision: 3, mode: "date" }),
  updatedAt: timestamp("updated_at", { precision: 3, mode: "date" }),
});

export const user = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean("email_verified").notNull(),
    username: text("username"),
    displayUsername: text("display_username"),
    stripeCustomerId: text("stripe_customer_id"),
    image: text("image"),
    createdAt: timestamp("created_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
    anonymizeRedditUsernames: boolean("anonymize_reddit_usernames")
      .default(false)
      .notNull(),
    deletedAt: timestamp("deleted_at", { precision: 3, mode: "date" }),
    role: text("role").default("user").notNull(),
    ltdTier: ltdTier("ltd_tier").default("none").notNull(),
    ltdPricePaid: doublePrecision("ltd_price_paid").default(0),
    lastLoginMethod: text("last_login_method"),
    plan: text("plan"),
    referralCode: text("referral_code"),
    referredById: text("referred_by_id"),
    referralActivatedAt: timestamp("referral_activated_at", {
      precision: 3,
      mode: "date",
    }),
  },
  (table) => [
    uniqueIndex("user_email_key").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("user_username_key").using(
      "btree",
      table.username.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const session = pgTable(
  "session",
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
    token: text("token").notNull(),
    createdAt: timestamp("created_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
  },
  (table) => [
    uniqueIndex("session_token_key").using(
      "btree",
      table.token.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey().notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      precision: 3,
      mode: "date",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      precision: 3,
      mode: "date",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const subscription = pgTable(
  "subscription",
  {
    id: text().primaryKey().notNull(),
    plan: text().notNull(),
    referenceId: text().notNull(),
    stripeCustomerId: text(),
    stripeSubscriptionId: text(),
    status: text().default("incomplete").notNull(),
    periodStart: timestamp({ precision: 3, mode: "date" }),
    periodEnd: timestamp({ precision: 3, mode: "date" }),
    trialStart: timestamp({ precision: 3, mode: "date" }),
    trialEnd: timestamp({ precision: 3, mode: "date" }),
    cancelAtPeriodEnd: boolean().default(false),
    cancelAt: timestamp({ precision: 3, mode: "date" }),
    canceledAt: timestamp({ precision: 3, mode: "date" }),
    endedAt: timestamp({ precision: 3, mode: "date" }),
    seats: integer(),
    billingInterval: text(),
    stripeScheduleId: text(),
    limits: jsonb(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("subscription_referenceId_idx").using(
      "btree",
      table.referenceId.asc().nullsLast().op("text_ops"),
    ),
    index("subscription_stripeCustomerId_idx").using(
      "btree",
      table.stripeCustomerId.asc().nullsLast().op("text_ops"),
    ),
    index("subscription_stripeSubscriptionId_idx").using(
      "btree",
      table.stripeSubscriptionId.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const workspace = pgTable(
  "workspace",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    ownerId: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
    deletedAt: timestamp({ precision: 3, mode: "date" }),
    plan: text(),
  },
  (table) => [
    uniqueIndex("workspace_slug_key").using(
      "btree",
      table.slug.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [user.id],
      name: "workspace_ownerId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const workspaceMember = pgTable(
  "workspace_member",
  {
    id: text().primaryKey().notNull(),
    workspaceId: text().notNull(),
    userId: text().notNull(),
    role: text().default("member").notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("workspace_member_workspaceId_userId_key").using(
      "btree",
      table.workspaceId.asc().nullsLast().op("text_ops"),
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.workspaceId],
      foreignColumns: [workspace.id],
      name: "workspace_member_workspaceId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "workspace_member_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const userPreferences = pgTable(
  "user_preferences",
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    theme: text().default("system").notNull(),
    defaultAiModel: text().default("google/gemini-2.0-flash-001").notNull(),
    emailNotifications: boolean().default(true).notNull(),
    timezone: text(),
    anniversaryDate: timestamp({ precision: 3, mode: "date" }),
    onboardingComplete: boolean().default(false).notNull(),
    dashboardLayout: jsonb(),
    scoringWeights: jsonb().$type<{
      w1: number; // painIntensity
      w2: number; // monetizationScore
      w3: number; // urgency
      w4: number; // marketMaturity
    }>(),
    customApiKey: text("custom_api_key"),
  },
  (table) => [
    uniqueIndex("user_preferences_userId_key").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "user_preferences_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const scraper = pgTable(
  "scraper",
  {
    id: text().primaryKey().notNull(),
    keywords: text().array(),
    frequency: integer().default(15).notNull(),
    status: scraperStatus().default("running").notNull(),
    postsScanned: integer().default(0).notNull(),
    painPointsFound: integer().default(0).notNull(),
    lastRunAt: timestamp({ precision: 3, mode: "date" }),
    lastSuccessfulRunAt: timestamp({ precision: 3, mode: "date" }),
    userId: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
    errorCount: integer().default(0).notNull(),
    lastError: text(),
    sortModes: text().array().default(["new", "hot", "top_week"]),
    subreddits: text().array(),
    customPatterns: text()
      .array()
      .default(sql`'{}'::text[]`),
    miningDepth: text().default("basic").notNull(),
    timeWindow: text().default("90d").notNull(),
    reportSaved: boolean().default(false).notNull(),
    reportCategory: text().default("Uncategorized").notNull(),
    reportSavedAt: timestamp({ precision: 3, mode: "date" }),
    workspaceId: text(),
    deletedAt: timestamp({ precision: 3, mode: "date" }),
    cost: doublePrecision().default(1.0).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "scraper_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.workspaceId],
      foreignColumns: [workspace.id],
      name: "scraper_workspaceId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    index("scraper_userId_workspaceId_createdAt_idx").on(
      table.userId,
      table.workspaceId,
      table.createdAt,
    ),
    index("scraper_createdAt_idx").on(table.createdAt),
  ],
);

export const scraperRun = pgTable(
  "scraper_run",
  {
    id: text().primaryKey().notNull(),
    scraperId: text().notNull(),
    status: text().default("success").notNull(),
    startedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
    finishedAt: timestamp({ precision: 3, mode: "date" }),
    postsFetched: integer().default(0).notNull(),
    postsMatched: integer().default(0).notNull(),
    commentsFetched: integer().default(0).notNull(),
    newPainPoints: integer().default(0).notNull(),
    fromComments: integer().default(0).notNull(),
    error: text(),
    throttleWarnings: text()
      .array()
      .default(sql`'{}'::text[]`),
    postsSkipped: integer().default(0).notNull(),
    cost: doublePrecision().default(0.0).notNull(),
    workspaceId: text(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.scraperId],
      foreignColumns: [scraper.id],
      name: "scraper_run_scraperId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    index("scraper_run_scraperId_startedAt_idx").on(
      table.scraperId,
      table.startedAt,
    ),
    index("scraper_run_workspaceId_status_createdAt_idx").on(
      table.workspaceId,
      table.status,
      table.createdAt.desc(),
    ),
  ],
);

export const scraperPost = pgTable(
  "scraper_post",
  {
    id: text().primaryKey().notNull(),
    runId: text().notNull(),
    postId: text().notNull(),
    commentCount: integer().default(0).notNull(),
    qualityScore: doublePrecision().default(0).notNull(),
    skipReason: text(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.runId],
      foreignColumns: [scraperRun.id],
      name: "scraper_post_runId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    index("scraper_post_runId_idx").on(table.runId),
    index("scraper_post_postId_idx").on(table.postId),
  ],
);

export const discoveryCache = pgTable("discovery_cache", {
  keyword: text().primaryKey().notNull(),
  suggestions: jsonb().notNull(),
  cachedAt: timestamp({ precision: 3, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const redditAiIdempotency = pgTable(
  "reddit_ai_idempotency",
  {
    redditPostId: text().primaryKey().notNull(),
    lastProcessedAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    lastProcessedBy: text(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    index("reddit_ai_idempotency_lastProcessedAt_idx").using(
      "btree",
      table.lastProcessedAt.asc().nullsLast().op("timestamp_ops"),
    ),
  ],
);

export const keywordStat = pgTable(
  "keyword_stat",
  {
    id: text().primaryKey().notNull(),
    keyword: text().notNull(),
    painPointsFound: integer().default(0).notNull(),
    lastMatchedAt: timestamp({ precision: 3, mode: "date" }),
    scraperId: text().notNull(),
    userId: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("keyword_stat_scraperId_keyword_key").using(
      "btree",
      table.scraperId.asc().nullsLast().op("text_ops"),
      table.keyword.asc().nullsLast().op("text_ops"),
    ),
    index("keyword_stat_userId_painPointsFound_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.painPointsFound.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.scraperId],
      foreignColumns: [scraper.id],
      name: "keyword_stat_scraperId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "keyword_stat_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const painPointCluster = pgTable(
  "pain_point_cluster",
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    workspaceId: text(),
    embeddingProvider: text().notNull(),
    embeddingModel: text().notNull(),
    embedding: vector({ dimensions: 1536 }),
    canonicalTitle: text().notNull(),
    canonicalBody: text().notNull(),
    sourceCount: integer().default(1).notNull(),
    memberCount: integer().default(0).notNull(),
    estimatedTamUsdAnnual: integer(),
    competitorIntel: jsonb().$type<CompetitorIntel[]>(),
    budgetSignalCount: integer().default(0).notNull(),
    lastMatchedAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    index(
      "pain_point_cluster_userId_embeddingProvider_embeddingModel_idx",
    ).using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.embeddingProvider.asc().nullsLast().op("text_ops"),
      table.embeddingModel.asc().nullsLast().op("text_ops"),
    ),
    index("pain_point_cluster_userId_lastMatchedAt_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.lastMatchedAt.asc().nullsLast().op("timestamp_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "pain_point_cluster_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.workspaceId],
      foreignColumns: [workspace.id],
      name: "pain_point_cluster_workspaceId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    index("pain_point_cluster_hnsw_idx")
      .using("hnsw", table.embedding.op("vector_cosine_ops"))
      .with({ m: 24, ef_construction: 200 }),
  ],
);

export const painPoint = pgTable(
  "pain_point",
  {
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
    budget: jsonb().$type<BudgetSignal[]>(),
    switchingCosts: text(),
    triedSolutions: text()
      .array()
      .default(sql`'{}'::text[]`),
    category: text(),
    scraperId: text().notNull(),
    userId: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
    sentiment: text(),
    subreddit: text(),
    commentCount: integer().default(0).notNull(),
    mentionCount: integer().default(0).notNull(),
    tags: text()
      .array()
      .default(sql`'{}'::text[]`),
    workspaceId: text(),
    deletedAt: timestamp({ precision: 3, mode: "date" }),
    flair: text(),
    isSelf: boolean(),
    subredditDisplayName: text(),
    thumbnailUrl: text(),
    clusterId: text(),
    clusterSimilarity: doublePrecision(),
    scoreExplanation: text(),
    sourceType: painPointSourceType().default("post"),
    redditPostId: text(),
    difficulty: painPointDifficulty().default("weekend_project"),
  },
  (table) => [
    index("pain_point_userId_clusterId_createdAt_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.clusterId.asc().nullsLast().op("text_ops"),
      table.createdAt.asc().nullsLast().op("timestamp_ops"),
    ),
    index("pain_point_userId_createdAt_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.createdAt.asc().nullsLast().op("timestamp_ops"),
    ),
    foreignKey({
      columns: [table.scraperId],
      foreignColumns: [scraper.id],
      name: "pain_point_scraperId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "pain_point_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.workspaceId],
      foreignColumns: [workspace.id],
      name: "pain_point_workspaceId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.clusterId],
      foreignColumns: [painPointCluster.id],
      name: "pain_point_clusterId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    index("pain_point_scraperId_idx").on(table.scraperId),
    index("pain_point_workspaceId_scraperId_createdAt_idx").on(
      table.workspaceId,
      table.scraperId,
      table.createdAt.desc(),
    ),
    index("pain_point_tags_idx").using("gin", table.tags),
  ],
);

export const painPointComment = pgTable(
  "pain_point_comment",
  {
    id: text().primaryKey().notNull(),
    body: text().notNull(),
    author: text(),
    score: integer().default(0).notNull(),
    commentUrl: text(),
    painScore: integer().default(0).notNull(),
    painPointId: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.painPointId],
      foreignColumns: [painPoint.id],
      name: "pain_point_comment_painPointId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const painPointEmbedding = pgTable(
  "pain_point_embedding",
  {
    painPointId: text().primaryKey().notNull(),
    userId: text().notNull(),
    workspaceId: text(),
    provider: text().notNull(),
    model: text().notNull(),
    dimensions: integer().notNull(),
    embedding: vector({ dimensions: 1536 }).notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    index("pain_point_embedding_userId_createdAt_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.createdAt.asc().nullsLast().op("timestamp_ops"),
    ),
    index("pain_point_embedding_userId_provider_model_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.provider.asc().nullsLast().op("text_ops"),
      table.model.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.painPointId],
      foreignColumns: [painPoint.id],
      name: "pain_point_embedding_painPointId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "pain_point_embedding_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.workspaceId],
      foreignColumns: [workspace.id],
      name: "pain_point_embedding_workspaceId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    index("pain_point_embedding_hnsw_idx")
      .using("hnsw", table.embedding.op("vector_cosine_ops"))
      .with({ m: 24, ef_construction: 200 }),
  ],
);

export const aiGoldenDataset = pgTable("ai_golden_dataset", {
  id: text().primaryKey().notNull(),
  title: text().notNull(),
  selftext: text(),
  subreddit: text().notNull(),
  comments: jsonb().$type<{ body: string }[]>().notNull(),
  expectedPainPoints: jsonb().notNull(), // Stores PainPointData[]
  createdAt: timestamp({ precision: 3, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const aiEvalLog = pgTable("ai_eval_log", {
  id: text().primaryKey().notNull(),
  modelId: text().notNull(),
  f1Score: doublePrecision().notNull(),
  precision: doublePrecision().notNull(),
  recall: doublePrecision().notNull(),
  runDate: timestamp({ precision: 3, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  switched: boolean().default(false).notNull(),
  flaggedForReview: boolean().default(false).notNull(),
  reasoning: text().notNull(),
  comparisonModelId: text(),
  improvementPercentage: doublePrecision(),
  evalMetadata: jsonb(), // Stores detailed model-by-model metrics
});

export const redditRateLimitLog = pgTable("reddit_rate_limit_log", {
  id: text().primaryKey().notNull(),
  subreddit: text(),
  userAgent: text().notNull(),
  url: text().notNull(),
  statusCode: integer().notNull(),
  retryAfter: integer(),
  error: text(),
  createdAt: timestamp({ precision: 3, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const painPointFeedback = pgTable(
  "pain_point_feedback",
  {
    id: text().primaryKey().notNull(),
    painPointId: text().notNull(),
    userId: text().notNull(),
    vote: integer().notNull(), // 1 for up, -1 for down
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.painPointId],
      foreignColumns: [painPoint.id],
      name: "pain_point_feedback_painPointId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "pain_point_feedback_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    uniqueIndex("pain_point_feedback_painPointId_userId_key").on(
      table.painPointId,
      table.userId,
    ),
  ],
);

export const purchasedCredits = pgTable(
  "purchased_credits",
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    amount: integer().default(0).notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "purchased_credits_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    index("purchased_credits_userId_idx").on(table.userId),
  ],
);

export const slowQueryLog = pgTable("slow_query_log", {
  id: text().primaryKey().notNull(),
  query: text().notNull(),
  params: text(),
  durationMs: integer().notNull(),
  createdAt: timestamp({ precision: 3, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const subredditCache = pgTable("subreddit_cache", {
  name: text().primaryKey().notNull(),
  subscriberCount: integer(),
  description: text(),
  activeUsers: integer(),
  category: text(),
  cachedAt: timestamp({ precision: 3, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
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
  createdAt: timestamp({ precision: 3, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
export const scraperRunSummary = pgTable(
  "scraper_run_summary",
  {
    id: text().primaryKey().notNull(),
    scraperId: text().notNull(),
    workspaceId: text(),
    month: text().notNull(), // ISO month format "YYYY-MM"
    runsCount: integer().default(0).notNull(),
    totalPostsFetched: integer().default(0).notNull(),
    totalPostsMatched: integer().default(0).notNull(),
    totalCommentsFetched: integer().default(0).notNull(),
    totalNewPainPoints: integer().default(0).notNull(),
    totalCost: doublePrecision().default(0.0).notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("scraper_run_summary_scraperId_month_key").on(
      table.scraperId,
      table.month,
    ),
    foreignKey({
      columns: [table.scraperId],
      foreignColumns: [scraper.id],
      name: "scraper_run_summary_scraperId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// ---------------------------------------------------------------------------
// AI Usage — per-extraction cost tracking for billing reconciliation
// ---------------------------------------------------------------------------
export const aiUsage = pgTable(
  "ai_usage",
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    /** OpenRouter model identifier, e.g. "openai/gpt-4o" */
    modelId: text().notNull(),
    inputTokens: integer().default(0).notNull(),
    outputTokens: integer().default(0).notNull(),
    /** Computed cost in USD based on per-model token rates */
    costUsd: doublePrecision().default(0).notNull(),
    /** Optional: the scraper that triggered this extraction */
    scraperId: text(),
    /** FK to scraper_run for complete cost-per-run attribution */
    runId: text(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("ai_usage_userId_createdAt_idx").on(table.userId, table.createdAt),
    index("ai_usage_modelId_createdAt_idx").on(table.modelId, table.createdAt),
    index("ai_usage_runId_idx").on(table.runId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "ai_usage_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.runId],
      foreignColumns: [scraperRun.id],
      name: "ai_usage_runId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

// ---------------------------------------------------------------------------
// Changelog — schema migration tracking for ops visibility
// ---------------------------------------------------------------------------
export const changelog = pgTable("changelog", {
  id: text().primaryKey().notNull(),
  version: text().notNull(),
  description: text().notNull(),
  appliedAt: timestamp({ precision: 3, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// ---------------------------------------------------------------------------
// User Notification Preferences — granular notification toggles
// ---------------------------------------------------------------------------
export const userNotificationPreferences = pgTable(
  "user_notification_preferences",
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    weeklyDigest: boolean().default(true).notNull(),
    scanCompleteAlerts: boolean().default(true).notNull(),
    thresholdNotifications: boolean().default(false).notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("user_notification_preferences_userId_key").on(table.userId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "user_notification_preferences_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// ---------------------------------------------------------------------------
// Scraper Run Event — per-phase timing/metrics for granular run observability
// ---------------------------------------------------------------------------
export const scraperRunEvent = pgTable(
  "scraper_run_event",
  {
    id: text().primaryKey().notNull(),
    runId: text().notNull(),
    phase: text().notNull(),
    startedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
    finishedAt: timestamp({ precision: 3, mode: "date" }),
    metrics: jsonb(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("scraper_run_event_runId_phase_idx").on(table.runId, table.phase),
    foreignKey({
      columns: [table.runId],
      foreignColumns: [scraperRun.id],
      name: "scraper_run_event_runId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const dashboardOpportunityMv = pgMaterializedView(
  "dashboard_opportunity_mv",
  {
    scraperId: text("scraper_id").primaryKey().notNull(),
    userId: text("user_id").notNull(),
    workspaceId: text("workspace_id"),
    keywords: text("keywords").array(),
    createdAt: timestamp("created_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
    reportSaved: boolean("report_saved").notNull(),
    reportCategory: text("report_category").notNull(),
    reportSavedAt: timestamp("report_saved_at", { precision: 3, mode: "date" }),
    latestRunStatus: text("latest_run_status"),
    latestRunStartedAt: timestamp("latest_run_started_at", {
      precision: 3,
      mode: "date",
    }),
    latestPostsFetched: integer("latest_posts_fetched"),
    painPointCount: integer("pain_point_count").notNull(),
    painPoints: jsonb("pain_points").notNull(),
  },
).existing();
