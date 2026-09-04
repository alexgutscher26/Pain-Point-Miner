import { db } from "@/lib/db";
import { tool, type CompetitorIntel } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { resolveCompetitorMetadata } from "@/lib/ai";

/**
 * Normalizes a tool name for consistent deduplication.
 * Example: "HubSpot CRM", "hubspot", "HubSpot App" -> "HubSpot"
 */
export function normalizeToolName(name: string): string {
  const n = name.trim().toLowerCase();
  if (!n) return "";

  // Common suffixes to remove
  const cleaned = n
    .replace(
      /\s+(crm|software|app|platform|tool|service|c\.r\.m\.?|solutions|inc|corp|co|limited|ltd)$/i,
      "",
    )
    .trim();

  // Title Case
  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generates a URL-friendly slug from a name.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Attempts to resolve metadata (URL, description) for a tool.
 * Uses a cached "tool" record if available, otherwise attempts to fetch.
 */
export async function resolveToolMetadata(
  name: string,
): Promise<Partial<CompetitorIntel>> {
  const normalized = normalizeToolName(name);
  if (!normalized) return { name: "Unknown" };

  const slug = slugify(normalized);

  // 1. Check cache
  const existing = await db.query.tool.findFirst({
    where: eq(tool.slug, slug),
  });

  if (existing && existing.lastCrawledAt) {
    if (
      Date.now() - existing.lastCrawledAt.getTime() < 1000 * 60 * 60 * 24 * 7 &&
      existing.description
    ) {
      // Less than 7 days old AND contains description
      return {
        name: existing.name,
        url: existing.url,
        description: existing.description,
        category: existing.category,
        iconUrl: existing.iconUrl,
      };
    }
  }

  // 2. Fallback: Simple guess and fetch
  const aiMeta = await resolveCompetitorMetadata(normalized);

  const result: Partial<CompetitorIntel> = {
    name: normalized,
    url: aiMeta.url || existing?.url || null,
    description: aiMeta.description || existing?.description || null,
    category: aiMeta.category || existing?.category || null,
    iconUrl: existing?.iconUrl || null,
  };

  // 3. Update / Register in tool table
  const upsertValues = {
    name: normalized,
    slug,
    url: result.url,
    description: result.description,
    category: result.category,
    lastCrawledAt: new Date(),
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(tool).set(upsertValues).where(eq(tool.id, existing.id));
  } else {
    await db
      .insert(tool)
      .values({
        id: crypto.randomUUID(),
        ...upsertValues,
      })
      .onConflictDoNothing();
  }

  return result;
}

/**
 * Aggregates tried solutions from a list of pain points into CompetitorIntel.
 */
export async function aggregateCompetitorIntel(
  triedSolutions: string[][],
): Promise<CompetitorIntel[]> {
  const mentions = new Map<string, number>();

  for (const solutions of triedSolutions) {
    if (!Array.isArray(solutions)) continue;
    for (const sol of solutions) {
      const normalized = normalizeToolName(sol);
      if (!normalized) continue;
      mentions.set(normalized, (mentions.get(normalized) || 0) + 1);
    }
  }

  const sortedTools = Array.from(mentions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10

  const results: CompetitorIntel[] = [];

  for (const [name, count] of sortedTools) {
    const meta = await resolveToolMetadata(name);
    results.push({
      name: meta.name || name,
      url: meta.url || null,
      description: meta.description || null,
      mentionCount: count,
      category: meta.category || null,
      iconUrl: meta.iconUrl || null,
    });
  }

  return results;
}
