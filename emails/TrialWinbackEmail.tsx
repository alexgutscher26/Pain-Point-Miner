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

interface TrialWinbackEmailProps {
  firstName: string;
  upgradeUrl: string;
  discountCode?: string;
}

export const TrialWinbackEmail = ({
  firstName,
  upgradeUrl,
  discountCode = "FOUNDER20",
}: TrialWinbackEmailProps) => {
  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: { extend: {} },
        }}
      >
        <Head />
        <Preview>We saved your reports — pick up where you left off (and take 20% off).</Preview>

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
                We miss you
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
                Still need a<br />market advantage?
              </Heading>
              <Text
                className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#6b7280]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
              >
                Hi {firstName} — your reports are still waiting for you.
              </Text>
            </Section>

            <Hr style={{ borderColor: "#e5e7eb", margin: "0 40px" }} />

            {/* Body */}
            <Section className="px-[40px] pt-[32px] pb-[0px]">
              <Text className="m-0 text-[15px] text-[#374151] leading-[26px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                We noticed you haven't picked up where you left off. Your reports and niche data are still safe for a few more days — but we don't want you to lose that momentum.
              </Text>
              <Text className="m-0 mt-[16px] text-[15px] text-[#374151] leading-[26px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Thousands of new discussions were analyzed by our engine this week while you were away. Stop guessing and start building on real user problems.
              </Text>
            </Section>

            {/* Discount block */}
            <Section className="px-[40px] pt-[32px] pb-[8px]">
              <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", marginBottom: "24px" }}>
                <tr>
                  <td style={{ width: "32px", borderTop: "1px solid #e5e7eb" }} />
                  <td style={{ padding: "0 12px", whiteSpace: "nowrap" }}>
                    <Text className="m-0 text-[10px] text-[#9ca3af]" style={{ fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase" }}>
                      Special offer
                    </Text>
                  </td>
                  <td style={{ borderTop: "1px solid #e5e7eb" }} />
                </tr>
              </table>

              <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "6px" }}>
                <tr>
                  <td style={{ padding: "28px 24px", textAlign: "center" }}>
                    <Text className="m-0 text-[11px] text-[#f97316]" style={{ fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
                      20% off your first 3 months
                    </Text>
                    <Text className="m-0 text-[15px] text-[#374151] leading-[24px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif", marginBottom: "20px" }}>
                      Use this code at checkout to unlock your investigations.
                    </Text>
                    {/* Discount code */}
                    <table cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", margin: "0 auto 20px auto", backgroundColor: "#ffffff", border: "1px solid #fed7aa", borderRadius: "4px" }}>
                      <tr>
                        <td style={{ padding: "10px 24px" }}>
                          <Text className="m-0 text-[22px] font-bold text-[#0f0f0f]" style={{ fontFamily: "monospace", letterSpacing: "4px" }}>
                            {discountCode}
                          </Text>
                        </td>
                      </tr>
                    </table>
                    <Button
                      href={upgradeUrl}
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
                      Apply my discount →
                    </Button>
                  </td>
                </tr>
              </table>
            </Section>

            {/* Footer */}
            <Section className="px-[40px] py-[28px] mt-[32px]" style={{ backgroundColor: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
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
                Questions? Just reply — we read every one.{" "}
                <Link href="https://threddiq.com/unsubscribe" style={{ color: "#0f0f0f", textDecoration: "underline" }}>Unsubscribe</Link>
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

TrialWinbackEmail.PreviewProps = {
  firstName: "Founder",
  upgradeUrl: "https://threddiq.com/dashboard/billing",
  discountCode: "FOUNDER20",
} satisfies TrialWinbackEmailProps;

export default TrialWinbackEmail;