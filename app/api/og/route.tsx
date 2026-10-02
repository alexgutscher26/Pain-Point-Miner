import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title =
      searchParams.get("title") || "ThreddIQ — Reddit SaaS Pain Point Miner";
    const description =
      searchParams.get("description") ||
      "Discover validated SaaS opportunities by mining real customer frustrations from Reddit.";
    const badge = searchParams.get("badge") || "AI Intelligence";
    const category = searchParams.get("category") || "ThreddIQ";

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(255, 69, 0, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(245, 158, 11, 0.12) 0%, transparent 40%)",
          color: "#ffffff",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo and Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                backgroundColor: "#ff4500",
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: "900",
                boxShadow: "0 0 30px rgba(255, 69, 0, 0.4)",
              }}
            >
              T
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: "800",
                  letterSpacing: "-0.5px",
                  color: "#ffffff",
                }}
              >
                Thredd<span style={{ color: "#ff4500" }}>IQ</span>
              </span>
            </div>
          </div>

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 20px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 69, 0, 0.15)",
              border: "1px solid rgba(255, 69, 0, 0.35)",
              color: "#ff6a33",
              fontSize: "16px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {badge}
          </div>
        </div>

        {/* Main Title & Description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "1000px",
          }}
        >
          {category && category !== "ThreddIQ" && (
            <div
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#a1a1aa",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
              }}
            >
              {category}
            </div>
          )}
          <h1
            style={{
              fontSize: title.length > 60 ? "46px" : "56px",
              fontWeight: "900",
              lineHeight: "1.15",
              letterSpacing: "-1.5px",
              color: "#fafafa",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: "22px",
              lineHeight: "1.4",
              color: "#a1a1aa",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        </div>

        {/* Footer bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "24px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              color: "#71717a",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            <span>🔥 100k+ Subreddits Analyzed</span>
            <span>•</span>
            <span>⚡ AI Opportunity Scoring</span>
            <span>•</span>
            <span>🎯 Real Buying Intent</span>
          </div>

          <div
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#e4e4e7",
            }}
          >
            threddiq.com
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: unknown) {
    const errorMsg =
      e instanceof Error ? e.message : "Failed to generate OG image";
    return new Response(`Failed to generate OG Image: ${errorMsg}`, {
      status: 500,
    });
  }
}
