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
} from "@react-email/components";

interface ResetPasswordEmailProps {
  userEmail: string;
  resetLink: string;
}

export const ResetPasswordEmail = ({
  userEmail,
  resetLink,
}: ResetPasswordEmailProps) => {
  return (
    <Html lang="en">
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#f97316",
              },
            },
          },
        }}
      >
        <Head />
        <Preview>Reset your ThreddIQ password</Preview>

        <Body className="m-0 bg-[#f3f4f6] py-[48px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
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
                  fontSize: "32px",
                  fontWeight: "700",
                  letterSpacing: "-0.5px",
                  lineHeight: "1.15",
                }}
              >
                Reset your password
              </Heading>
              <Text
                className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#6b7280]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
              >
                We received a request to reset the password for your account associated with {userEmail}.
              </Text>
            </Section>

            <Hr style={{ borderColor: "#e5e7eb", margin: "0 40px" }} />

            {/* Body copy */}
            <Section className="px-[40px] pt-[32px] pb-0">
              <Text className="m-0 text-[15px] text-[#374151] leading-[26px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                To reset your password, click the button below. This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
              </Text>
            </Section>

            {/* CTA */}
            <Section className="px-[40px] py-[40px]">
              <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "6px" }}>
                <tr>
                  <td style={{ padding: "28px 24px", textAlign: "center" }}>
                    <Button
                      href={resetLink}
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
                      Reset Password →
                    </Button>
                  </td>
                </tr>
              </table>
              <Text className="m-0 mt-[16px] text-center text-[12px] text-[#9ca3af]">
                Or copy and paste this URL into your browser:<br />
                <Link href={resetLink} className="text-[#f97316] break-all">
                  {resetLink}
                </Link>
              </Text>
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
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ResetPasswordEmail.PreviewProps = {
  userEmail: "alex@example.com",
  resetLink: "https://threddiq.com/reset-password?token=123",
} satisfies ResetPasswordEmailProps;

export default ResetPasswordEmail;
