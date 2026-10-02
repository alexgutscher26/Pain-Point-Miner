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

interface WelcomeEmailProps {
  firstName: string;
  scanUrl: string;
}

export const WelcomeEmail = ({ firstName, scanUrl }: WelcomeEmailProps) => {
  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {},
          },
        }}
      >
        <Head />
        <Preview>Welcome to ThreddIQ — turn complaints into companies.</Preview>

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
                Turn complaints
                <br />
                into companies.
              </Heading>
              <Text
                className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#6b7280]"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: "italic",
                }}
              >
                Your account is ready, {firstName}. Let's find your next idea.
              </Text>
            </Section>

            <Hr style={{ borderColor: "#e5e7eb", margin: "0 40px" }} />

            {/* Body copy */}
            <Section className="px-[40px] pt-[32px] pb-[0px]">
              <Text
                className="m-0 text-[15px] leading-[26px] text-[#374151]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                We built ThreddIQ because the best startup ideas aren't invented
                — they're discovered buried in subreddits, forums, and comment
                threads. Our AI surfaces those frustrations so you can build
                exactly what people are asking for.
              </Text>
            </Section>

            {/* How it works divider */}
            <Section className="px-[40px] pt-[32px]">
              <table
                width="100%"
                cellPadding="0"
                cellSpacing="0"
                style={{ borderCollapse: "collapse" }}
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
                      How it works
                    </Text>
                  </td>
                  <td style={{ borderTop: "1px solid #e5e7eb" }} />
                </tr>
              </table>
            </Section>

            {/* Steps */}
            <Section className="px-[40px] pt-[24px] pb-[8px]">
              {[
                {
                  num: "01",
                  title: "Choose a Community",
                  body: "Pick a subreddit or niche where your target audience vents, asks, and shares frustrations daily.",
                },
                {
                  num: "02",
                  title: "Let the Miner Run",
                  body: "Our AI scans hundreds of posts and comments, clustering recurring pain points by theme and intensity.",
                },
                {
                  num: "03",
                  title: "Build with Confidence",
                  body: "Receive a full report: validated problems, competitor gaps, feature ideas, and audience language — ready to act on.",
                },
              ].map((step) => (
                <table
                  key={step.num}
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ marginBottom: "24px", borderCollapse: "collapse" }}
                >
                  <tr>
                    <td
                      valign="top"
                      style={{
                        width: "44px",
                        paddingTop: "2px",
                        paddingRight: "16px",
                      }}
                    >
                      <Text
                        className="m-0 text-[13px] font-bold text-[#f97316]"
                        style={{
                          fontFamily: "monospace",
                          letterSpacing: "1px",
                        }}
                      >
                        {step.num}
                      </Text>
                    </td>
                    <td
                      valign="top"
                      style={{
                        borderLeft: "2px solid #f3f4f6",
                        paddingLeft: "16px",
                      }}
                    >
                      <Text
                        className="m-0 text-[15px] font-bold text-[#0f0f0f]"
                        style={{
                          fontFamily: "Georgia, 'Times New Roman', serif",
                        }}
                      >
                        {step.title}
                      </Text>
                      <Text
                        className="m-0 mt-[4px] text-[14px] leading-[22px] text-[#6b7280]"
                        style={{
                          fontFamily: "Georgia, 'Times New Roman', serif",
                        }}
                      >
                        {step.body}
                      </Text>
                    </td>
                  </tr>
                </table>
              ))}
            </Section>

            {/* CTA */}
            <Section className="px-[40px] pb-[40px]">
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
                      Ready when you are
                    </Text>
                    <Text
                      className="m-0 text-[18px] font-bold text-[#0f0f0f]"
                      style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        letterSpacing: "-0.3px",
                        marginBottom: "20px",
                      }}
                    >
                      Run your first scan — it takes 60 seconds.
                    </Text>
                    <Button
                      href={scanUrl}
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
                      Start scanning →
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
                  href="#"
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

WelcomeEmail.PreviewProps = {
  firstName: "Alex",
  scanUrl: "https://threddiq.com/dashboard",
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
