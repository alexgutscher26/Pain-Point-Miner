/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from "@/lib/db";
import { scraper, scraperRun } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { apiError, apiJson } from "@/lib/api-error";
import { requireApiContext, workspaceScope } from "@/lib/api-auth";

export async function GET(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId, workspaceId } = authContext.context;

  try {
    // Get all scrapers for the user
    const reportsRes = await db.query.scraper.findMany({
      where: and(
        eq(scraper.userId, userId),
        workspaceScope(scraper.workspaceId, workspaceId)
      ),
      orderBy: [desc(scraper.createdAt)],
      with: {
        scraperRuns: {
          orderBy: [desc(scraperRun.startedAt)],
          limit: 1,
        },
        painPoints: {
            columns: {
                id: true,
                score: true,
                urgency: true,
                monetizationScore: true,
                marketMaturity: true,
                sentiment: true
            }
        }
      }
    });

    const formattedReports = (reportsRes as any[]).map(r => {
      const latestRun = r.scraperRuns?.[0];
      const pps = (r.painPoints || []) as { score: number, urgency: number, monetizationScore: number, marketMaturity: number, sentiment: string | null }[];
      
      // Calculate VERY SMART Opportunity Score (Weighted Multi-Factor)
      let opportunityScore = 0;
      if (pps.length > 0) {
          const factors = pps.map(p => {
              const pain = (p.score || 0) * 0.35;
              const urgency = (p.urgency || 0) * 0.25;
              const monetization = (p.monetizationScore || 0) * 0.30;
              
              let maturityBonus = 0;
              if ((p.marketMaturity || 0) <= 3) maturityBonus = 10;
              else if ((p.marketMaturity || 0) >= 8) maturityBonus = 8;
              else maturityBonus = 4;
              
              const sentimentMap: Record<string, number> = { 'desperate': 1.1, 'frustrated': 1.05, 'angry': 1.15, 'neutral': 1.0, 'curious': 0.95 };
              const modifier = sentimentMap[p.sentiment || ''] || 1.0;
              
              return ((pain + urgency + monetization) * 10 + maturityBonus) * modifier;
          });

          opportunityScore = Math.round(factors.reduce((a, b) => a + b, 0) / factors.length);
          opportunityScore = Math.min(Math.max(opportunityScore, 0), 100);
      }

      return {
        id: r.id,
        niche: r.keywords?.[0] || "Unknown Investigation",
        date: new Date(r.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        }),
        painPoints: pps.length,
        score: opportunityScore,
        status: latestRun?.status === 'success' ? 'Completed' : 'In Progress'
      };
    });

    return apiJson(formattedReports, 200, correlationId);
  } catch (error) {
    console.error("Reports API Error:", error);
    return apiError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error", undefined, correlationId);
  }
}
