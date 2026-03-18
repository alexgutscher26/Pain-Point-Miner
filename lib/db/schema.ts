import {
  boolean,
  doublePrecision,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  vector,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const scraperStatus = pgEnum("ScraperStatus", [
  "running",
  "paused",
  "error",
]);

export const verification = pgTable("verification", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ precision: 3, mode: "date" }).notNull(),
  createdAt: timestamp({ precision: 3, mode: "date" }),
  updatedAt: timestamp({ precision: 3, mode: "date" }),
});

export const user = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean().notNull(),
    username: text(),
    displayUsername: text(),
    stripeCustomerId: text(),
    image: text(),
    createdAt: timestamp({ precision: 3, mode: "date" }).notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
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
    expiresAt: timestamp({ precision: 3, mode: "date" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" }).notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: text().notNull(),
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
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text().notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ precision: 3, mode: "date" }),
    refreshTokenExpiresAt: timestamp({ precision: 3, mode: "date" }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ precision: 3, mode: "date" }).notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
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
    dashboardLayout: jsonb(),
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
    reportSaved: boolean().default(false).notNull(),
    reportCategory: text().default("Uncategorized").notNull(),
    reportSavedAt: timestamp({ precision: 3, mode: "date" }),
    workspaceId: text(),
    deletedAt: timestamp({ precision: 3, mode: "date" }),
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
  ],
);

export const scraperRun = pgTable(
  "scraper_run",
  {
    id: text().primaryKey().notNull(),
    scraperId: text().notNull(),
    status: text().default("success").notNull(),
    startedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
    finishedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
    postsFetched: integer().default(0).notNull(),
    postsMatched: integer().default(0).notNull(),
    commentsFetched: integer().default(0).notNull(),
    newPainPoints: integer().default(0).notNull(),
    fromComments: integer().default(0).notNull(),
    error: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.scraperId],
      foreignColumns: [scraper.id],
      name: "scraper_run_scraperId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

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
    embedding: doublePrecision().array(),
    canonicalTitle: text().notNull(),
    canonicalBody: text().notNull(),
    sourceCount: integer().default(1).notNull(),
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
      table.userId.asc().nullsLast().op("timestamp_ops"),
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
    urgency: integer().default(0),
    monetizationScore: integer().default(0),
    marketMaturity: integer().default(0),
    budget: text(),
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
  },
  (table) => [
    index("pain_point_userId_clusterId_createdAt_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.clusterId.asc().nullsLast().op("text_ops"),
      table.createdAt.asc().nullsLast().op("text_ops"),
    ),
    index("pain_point_userId_createdAt_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("timestamp_ops"),
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
  ],
);
