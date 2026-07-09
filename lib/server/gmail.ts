import { google } from "googleapis";

export interface GmailConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  redirectUri: string;
  user: string;
}

/**
 * Send an email verification message through the Gmail API using an OAuth2
 * refresh token. Ported verbatim from the previous NestJS backend.
 */
export async function sendEmailWithGmail({
  gmailConfig,
  from,
  to,
  url,
}: {
  gmailConfig: GmailConfig;
  from: string;
  to: string;
  url: string;
}) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      gmailConfig.clientId,
      gmailConfig.clientSecret,
      gmailConfig.redirectUri
    );

    oauth2Client.setCredentials({
      refresh_token: gmailConfig.refreshToken,
    });

    const accessTokenResponse = await oauth2Client.getAccessToken();
    if (!accessTokenResponse.token) {
      throw new Error("Failed to obtain access token from Gmail API");
    }

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const emailContent = [
      `From: ${from}`,
      `To: ${to}`,
      "Content-Type: text/html; charset=utf-8",
      "MIME-Version: 1.0",
      "Subject: Verify your email address",
      "",
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${url}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>`,
    ].join("\n");

    const encodedMessage = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    return result.data;
  } catch (error) {
    console.error("Failed to send verification email with Gmail API:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    throw error;
  }
}
