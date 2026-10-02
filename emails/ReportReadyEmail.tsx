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
import * as React from "react";

interface PainPointData {
  title: string;
  excerpt: string;
  score: number;
}

interface ReportReadyEmailProps {
  keyword: string;
  painPointsFound: number;
  reportUrl: string;
  topPainPoints: PainPointData[];
}

export const ReportReadyEmail = ({
  keyword,
  painPointsFound,
  reportUrl,
  topPainPoints,
}: ReportReadyEmailProps) => {
  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: { extend: {} },
        }}
      >
        <Head />
        <Preview>{`Investigation complete — ${painPointsFound} pain points found for "${keyword}".`}</Preview>

        <Body
          className="m-0 bg-[#f3f4f6] py-[48px]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {/* Top orange accent bar */}
          <Container className="mx-auto w-full max-w-[600px]">
            <Section
              style={{
                backgroundColor: "#f97316",
                height: "4px",
                lineHeight: "4px",
                fontSize: "1px",
              }}
            >
              &#8203;
            </Section>
          </Container>

          <Container
            className="mx-auto w-full max-w-[600px] overflow-hidden bg-white"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
          >
            {/* Nav */}
            <Section className="px-[40px] pt-[32px] pb-[24px]">
              <table
                width="100%"
                cellPadding="0"
                cellSpacing="0"
                style={{ borderCollapse: "collapse" }}
              >
                <tr>
                  <td>
                    <Text
                      className="m-0 text-[26px] font-bold text-[#0f0f0f]"
                      style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      Thredd<span style={{ color: "#f97316" }}>IQ</span>
                    </Text>
                  </td>
                  <td align="right">
                    <Text
                      className="m-0 text-[11px] text-[#9ca3af]"
                      style={{
                        fontFamily: "monospace",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                      }}
                    >
                      Pain → Product
                    </Text>
                  </td>
                </tr>
              </table>
            </Section>

            <Hr style={{ borderColor: "#e5e7eb", margin: "0 40px" }} />

            {/* Hero */}
            <Section className="px-[40px] pt-[40px] pb-[36px]">
              <Text
                className="m-0 text-[11px] text-[#9ca3af]"
                style={{
                  fontFamily: "monospace",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Investigation complete
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
                "{keyword}"<br />
                is ready.
              </Heading>
              <Text
                className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#6b7280]"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: "italic",
                }}
              >
                Your scan uncovered{" "}
                <strong style={{ color: "#0f0f0f", fontStyle: "normal" }}>
                  {painPointsFound}
                </strong>{" "}
                potential pain points and startup ideas.
              </Text>
            </Section>

            <Hr style={{ borderColor: "#e5e7eb", margin: "0 40px" }} />

            {/* Pain points */}
            {topPainPoints.length > 0 && (
              <Section className="px-[40px] pt-[32px] pb-[8px]">
                <table
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ borderCollapse: "collapse", marginBottom: "24px" }}
                >
                  <tr>
                    <td
                      style={{ width: "32px", borderTop: "1px solid #e5e7eb" }}
                    />
                    <td style={{ padding: "0 12px", whiteSpace: "nowrap" }}>
                      <Text
                        className="m-0 text-[10px] text-[#9ca3af]"
                        style={{
                          fontFamily: "monospace",
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                        }}
                      >
                        Top pain points
                      </Text>
                    </td>
                    <td style={{ borderTop: "1px solid #e5e7eb" }} />
                  </tr>
                </table>

                {topPainPoints.map((pp, idx) => (
                  <table
                    key={idx}
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={{
                      borderCollapse: "collapse",
                      marginBottom: "16px",
                      borderLeft: "3px solid #f97316",
                      backgroundColor: "#fafafa",
                      borderRadius: "0 4px 4px 0",
                    }}
                  >
                    <tr>
                      <td style={{ padding: "16px 20px" }}>
                        {/* Title + score row */}
                        <table
                          width="100%"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{
                            borderCollapse: "collapse",
                            marginBottom: "8px",
                          }}
                        >
                          <tr>
                            <td>
                              <Text
                                className="m-0 text-[15px] leading-[22px] font-bold text-[#0f0f0f]"
                                style={{
                                  fontFamily:
                                    "Georgia, 'Times New Roman', serif",
                                }}
                              >
                                {pp.title}
                              </Text>
                            </td>
                            <td
                              align="right"
                              style={{
                                verticalAlign: "top",
                                paddingLeft: "12px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Text
                                className="m-0 text-[12px] font-bold text-[#10b981]"
                                style={{ fontFamily: "monospace" }}
                              >
                                {pp.score.toFixed(1)} / 10
                              </Text>
                            </td>
                          </tr>
                        </table>
                        {/* Excerpt */}
                        <Text
                          className="m-0 text-[13px] leading-[21px] text-[#6b7280]"
                          style={{
                            fontFamily: "Georgia, 'Times New Roman', serif",
                            fontStyle: "italic",
                          }}
                        >
                          "
                          {pp.excerpt.length > 120
                            ? pp.excerpt.substring(0, 120) + "..."
                            : pp.excerpt}
                          "
                        </Text>
                        {/* Score bar */}
                        <table
                          width="100%"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{
                            borderCollapse: "collapse",
                            marginTop: "12px",
                          }}
                        >
                          <tr>
                            <td
                              style={{
                                backgroundColor: "#e5e7eb",
                                borderRadius: "99px",
                                height: "6px",
                                overflow: "hidden",
                              }}
                            >
                              <table
                                cellPadding="0"
                                cellSpacing="0"
                                style={{
                                  borderCollapse: "collapse",
                                  height: "6px",
                                }}
                              >
                                <tr>
                                  <td
                                    style={{
                                      backgroundColor: "#10b981",
                                      width: `${Math.min(100, (pp.score / 10) * 100)}%`,
                                      height: "6px",
                                      borderRadius: "99px",
                                    }}
                                  />
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                ))}
              </Section>
            )}

            {/* CTA */}
            <Section className="px-[40px] pt-[24px] pb-[40px]">
              <table
                width="100%"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  borderCollapse: "collapse",
                  backgroundColor: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: "6px",
                }}
              >
                <tr>
                  <td style={{ padding: "28px 24px", textAlign: "center" }}>
                    <Text
                      className="m-0 text-[11px] text-[#f97316]"
                      style={{
                        fontFamily: "monospace",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                      }}
                    >
                      Your report is ready
                    </Text>
                    <Text
                      className="m-0 text-[18px] font-bold text-[#0f0f0f]"
                      style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        letterSpacing: "-0.3px",
                        marginBottom: "20px",
                      }}
                    >
                      See the full breakdown, competitor gaps,
                      <br />
                      and feature ideas.
                    </Text>
                    <Button
                      href={reportUrl}
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
                      View full report →
                    </Button>
                  </td>
                </tr>
              </table>
            </Section>

            {/* Footer */}
            <Section
              className="px-[40px] py-[28px]"
              style={{
                backgroundColor: "#f9fafb",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <table
                width="100%"
                cellPadding="0"
                cellSpacing="0"
                style={{ borderCollapse: "collapse" }}
              >
                <tr>
                  <td>
                    <Text
                      className="m-0 text-[14px] font-bold text-[#0f0f0f]"
                      style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                      }}
                    >
                      Thredd<span style={{ color: "#f97316" }}>IQ</span>
                    </Text>
                  </td>
                  <td align="right">
                    <Text
                      className="m-0 text-[12px] text-[#9ca3af]"
                      style={{ fontFamily: "monospace" }}
                    >
                      © {String(new Date().getFullYear())}
                    </Text>
                  </td>
                </tr>
              </table>
              <Text
                className="m-0 mt-[12px] text-[13px] leading-[20px] text-[#6b7280]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Questions? Just reply — we read every one.{" "}
                <Link
                  href="https://threddiq.com/unsubscribe"
                  style={{ color: "#0f0f0f", textDecoration: "underline" }}
                >
                  Unsubscribe
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ReportReadyEmail.PreviewProps = {
  keyword: "React bugs",
  painPointsFound: 42,
  reportUrl: "https://threddiq.com/reports/123",
  topPainPoints: [
    {
      title: "State management requires too much boilerplate",
      excerpt:
        "I am spending 40% of my time writing reducers and thunks just to implement a simple toggle button...",
      score: 8.5,
    },
    {
      title: "useEffect dependency arrays cause infinite loops",
      excerpt:
        "Why does React make it so hard to just fetch data on mount without getting warning logs or crashing the tab?",
      score: 7.2,
    },
  ],
} satisfies ReportReadyEmailProps;

export default ReportReadyEmail;
