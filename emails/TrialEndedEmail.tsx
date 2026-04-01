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

interface TrialEndedEmailProps {
  firstName: string;
  upgradeUrl: string;
}

export const TrialEndedEmail = ({
  firstName,
  upgradeUrl,
}: TrialEndedEmailProps) => {
  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: { extend: {} },
        }}
      >
        <Head />
        <Preview>Your trial has ended — upgrade to unlock your reports.</Preview>

        <Body className="m-0 bg-[#f3f4f6] py-[48px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>

          {/* Top accent bar — grey to signal expiry, not the usual orange */}
          <Container className="mx-auto w-full max-w-[600px]">
            <Section style={{ backgroundColor: "#d1d5db", height: "4px", lineHeight: "4px", fontSize: "1px" }}>&#8203;</Section>
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
                Trial expired
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
                Your premium<br />access has ended.
              </Heading>
              <Text
                className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#6b7280]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
              >
                Hi {firstName} — your reports are archived, but not gone.
              </Text>
            </Section>

            <Hr style={{ borderColor: "#e5e7eb", margin: "0 40px" }} />

            {/* Body */}
            <Section className="px-[40px] pt-[32px] pb-[0px]">
              <Text className="m-0 text-[15px] text-[#374151] leading-[26px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Your ThreddIQ trial has officially ended. Your saved investigations and advanced niche reports are now archived — but they're waiting for you the moment you upgrade.
              </Text>
              <Text className="m-0 mt-[16px] text-[15px] text-[#374151] leading-[26px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Upgrading instantly restores full access to all your saved data, deep subreddit analysis, and opportunity scoring.
              </Text>
            </Section>

            {/* Archived items */}
            <Section className="px-[40px] pt-[32px]">
              <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", marginBottom: "24px" }}>
                <tr>
                  <td style={{ width: "32px", borderTop: "1px solid #e5e7eb" }} />
                  <td style={{ padding: "0 12px", whiteSpace: "nowrap" }}>
                    <Text className="m-0 text-[10px] text-[#9ca3af]" style={{ fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase" }}>
                      Currently locked
                    </Text>
                  </td>
                  <td style={{ borderTop: "1px solid #e5e7eb" }} />
                </tr>
              </table>

              {[
                { label: "Investigation Reports", status: "Archived" },
                { label: "Opportunity Scores", status: "Archived" },
                { label: "Advanced Niche Scans", status: "Locked" },
              ].map((item, idx, arr) => (
                <table
                  key={idx}
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    borderCollapse: "collapse",
                    borderBottom: idx < arr.length - 1 ? "1px solid #f3f4f6" : "none",
                  }}
                >
                  <tr>
                    <td style={{ padding: "14px 0" }}>
                      <Text className="m-0 text-[15px] text-[#374151]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        {item.label}
                      </Text>
                    </td>
                    <td align="right" style={{ padding: "14px 0" }}>
                      <Text className="m-0 text-[11px] font-bold text-[#9ca3af]" style={{ fontFamily: "monospace", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                        ● {item.status}
                      </Text>
                    </td>
                  </tr>
                </table>
              ))}
            </Section>

            {/* CTA */}
            <Section className="px-[40px] pt-[32px] pb-[40px]">
              <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "6px" }}>
                <tr>
                  <td style={{ padding: "28px 24px", textAlign: "center" }}>
                    <Text className="m-0 text-[11px] text-[#f97316]" style={{ fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
                      Restore your access
                    </Text>
                    <Text className="m-0 text-[18px] font-bold text-[#0f0f0f]" style={{ fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "-0.3px", marginBottom: "20px" }}>
                      Everything picks up where you left off.
                    </Text>
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
                      Regain full access →
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

TrialEndedEmail.PreviewProps = {
  firstName: "Founder",
  upgradeUrl: "https://threddiq.com/dashboard/billing",
} satisfies TrialEndedEmailProps;

export default TrialEndedEmail;