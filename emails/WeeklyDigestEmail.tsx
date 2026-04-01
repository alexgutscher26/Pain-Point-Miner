import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  pixelBasedPreset,
} from "@react-email/components";

interface WeeklyOpportunity {
  title: string;
  score: number;
  niche: string;
}

interface WeeklyDigestEmailProps {
  firstName: string;
  topOpportunities: WeeklyOpportunity[];
  trendingKeyword: string;
  scansRemaining: number | null;
  unsubscribeUrl: string;
}

export const WeeklyDigestEmail = ({
  firstName,
  topOpportunities,
  trendingKeyword,
  scansRemaining,
  unsubscribeUrl,
}: WeeklyDigestEmailProps) => {
  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: { extend: {} },
        }}
      >
        <Head />
        <Preview>Your weekly opportunity digest from ThreddIQ.</Preview>

        <Body className="m-0 bg-[#f3f4f6] py-[48px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>

          {/* Top orange accent bar */}
          <Container className="mx-auto w-full max-w-[600px]">
            <Section style={{ backgroundColor: "#f97316", height: "4px", lineHeight: "4px", fontSize: "1px" }}>&#8203;</Section>
          </Container>

          <Container className="mx-auto w-full max-w-[600px] overflow-hidden bg-white" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>

            {/* Nav */}
            <Section className="px-[40px] pt-[32px] pb-[24px]">
              <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse" }}>
                <tr>
                  <td>
                    <Text className="m-0 text-[26px] font-bold text-[#0f0f0f]" style={{ fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "-0.5px" }}>
                      Thredd<span style={{ color: "#f97316" }}>IQ</span>
                    </Text>
                  </td>
                  <td align="right">
                    <Text className="m-0 text-[11px] text-[#9ca3af]" style={{ fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase" }}>
                      Pain → Product
                    </Text>
                  </td>
                </tr>
              </table>
            </Section>

            <Hr style={{ borderColor: "#e5e7eb", margin: "0 40px" }} />

            {/* Hero */}
            <Section className="px-[40px] pt-[40px] pb-[36px]">
              <Text className="m-0 text-[11px] text-[#9ca3af]" style={{ fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
                Weekly Digest
              </Text>
              <Heading
                className="m-0 text-[#0f0f0f]"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "38px",
                  fontWeight: "700",
                  letterSpacing: "-0.5px",
                  lineHeight: "1.15",
                }}
              >
                Your opportunities<br />this week.
              </Heading>
              <Text
                className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#6b7280]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
              >
                Hi {firstName} — we've been busy mining your subreddits.
              </Text>
            </Section>

            <Hr style={{ borderColor: "#e5e7eb", margin: "0 40px" }} />

            {/* Opportunities */}
            <Section className="px-[40px] pt-[32px] pb-[8px]">

              {/* Section label */}
              <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", marginBottom: "24px" }}>
                <tr>
                  <td style={{ width: "32px", borderTop: "1px solid #e5e7eb" }} />
                  <td style={{ padding: "0 12px", whiteSpace: "nowrap" }}>
                    <Text className="m-0 text-[10px] text-[#9ca3af]" style={{ fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase" }}>
                      Top opportunities
                    </Text>
                  </td>
                  <td style={{ borderTop: "1px solid #e5e7eb" }} />
                </tr>
              </table>

              {topOpportunities.length > 0 ? (
                topOpportunities.map((opp, idx) => (
                  <table
                    key={idx}
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={{ borderCollapse: "collapse", marginBottom: "16px", borderLeft: "3px solid #f97316", backgroundColor: "#fafafa", borderRadius: "0 4px 4px 0" }}
                  >
                    <tr>
                      <td style={{ padding: "16px 20px" }}>
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", marginBottom: "8px" }}>
                          <tr>
                            <td>
                              <Text className="m-0 text-[10px] font-bold text-[#f97316]" style={{ fontFamily: "monospace", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                                r/{opp.niche}
                              </Text>
                            </td>
                            <td align="right">
                              <Text className="m-0 text-[12px] font-bold text-[#10b981]" style={{ fontFamily: "monospace" }}>
                                {opp.score.toFixed(1)} / 10
                              </Text>
                            </td>
                          </tr>
                        </table>
                        <Text className="m-0 text-[15px] font-bold text-[#0f0f0f] leading-[22px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                          {opp.title}
                        </Text>
                      </td>
                    </tr>
                  </table>
                ))
              ) : (
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", border: "1px dashed #e5e7eb", borderRadius: "4px", marginBottom: "24px" }}>
                  <tr>
                    <td style={{ padding: "24px", textAlign: "center" }}>
                      <Text className="m-0 text-[14px] text-[#6b7280]" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}>
                        No high-scoring opportunities this week. Run a fresh scan to surface more insights.
                      </Text>
                    </td>
                  </tr>
                </table>
              )}
            </Section>

            {/* Trending keyword */}
            {trendingKeyword && (
              <Section className="px-[40px] pb-[8px]">
                <Hr style={{ borderColor: "#e5e7eb", margin: "8px 0 24px 0" }} />
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse" }}>
                  <tr>
                    <td style={{ width: "32px", borderTop: "1px solid #e5e7eb" }} />
                    <td style={{ padding: "0 12px", whiteSpace: "nowrap" }}>
                      <Text className="m-0 text-[10px] text-[#9ca3af]" style={{ fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase" }}>
                        Trending this week
                      </Text>
                    </td>
                    <td style={{ borderTop: "1px solid #e5e7eb" }} />
                  </tr>
                </table>
                <Text className="m-0 mt-[16px] text-[15px] text-[#374151] leading-[26px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  A surge in mentions for <strong style={{ color: "#0f0f0f" }}>"{trendingKeyword}"</strong> has been detected across your saved communities. Consider investigating this further.
                </Text>
              </Section>
            )}

            {/* Account summary + CTA */}
            <Section className="px-[40px] pt-[32px] pb-[40px]">
              <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "6px" }}>
                <tr>
                  <td style={{ padding: "28px 24px", textAlign: "center" }}>
                    <Text className="m-0 text-[10px] text-[#f97316]" style={{ fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>
                      Account summary
                    </Text>
                    <Text className="m-0 text-[18px] font-bold text-[#0f0f0f]" style={{ fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "-0.3px", marginBottom: "20px" }}>
                      {scansRemaining === null ? "You have unlimited scans." : `${scansRemaining} scans remaining this month.`}
                    </Text>
                    <Button
                      href="https://threddiq.com/dashboard/search"
                      style={{
                        backgroundColor: "#0f0f0f",
                        borderRadius: "4px",
                        color: "#ffffff",
                        fontFamily: "monospace",
                        fontSize: "13px",
                        fontWeight: "bold",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        padding: "14px 32px",
                        display: "inline-block",
                      }}
                    >
                      Start new investigation →
                    </Button>
                  </td>
                </tr>
              </table>
            </Section>

            {/* Footer */}
            <Section className="px-[40px] py-[28px]" style={{ backgroundColor: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
              <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse" }}>
                <tr>
                  <td>
                    <Text className="m-0 text-[14px] font-bold text-[#0f0f0f]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                      Thredd<span style={{ color: "#f97316" }}>IQ</span>
                    </Text>
                  </td>
                  <td align="right">
                    <Text className="m-0 text-[12px] text-[#9ca3af]" style={{ fontFamily: "monospace" }}>
                      © {String(new Date().getFullYear())}
                    </Text>
                  </td>
                </tr>
              </table>
              <Text className="m-0 mt-[12px] text-[13px] text-[#6b7280] leading-[20px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Don't want these updates?{" "}
                <Link href={unsubscribeUrl} style={{ color: "#0f0f0f", textDecoration: "underline" }}>Unsubscribe</Link>
                {" "}or manage your{" "}
                <Link href="https://threddiq.com/dashboard/settings" style={{ color: "#0f0f0f", textDecoration: "underline" }}>email preferences</Link>.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

WeeklyDigestEmail.PreviewProps = {
  firstName: "Alex",
  topOpportunities: [
    { title: "Automated subreddit moderation for niche mental health communities", score: 9.2, niche: "SaaS" },
    { title: "Real-time pricing alerts for collectible mechanical keyboards", score: 8.4, niche: "MechanicalKeyboards" },
    { title: "AI-driven sentiment analysis for developer relations on Discord", score: 7.9, niche: "webdev" },
  ],
  trendingKeyword: "Headless CMS",
  scansRemaining: 12,
  unsubscribeUrl: "https://threddiq.com/unsubscribe/123",
} satisfies WeeklyDigestEmailProps;

export default WeeklyDigestEmail;