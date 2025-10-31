import Imap from "node-imap";

export interface IMAPConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
}

export function getIMAPConfig(): IMAPConfig {
  return {
    user: process.env.GMAIL_EMAIL || "",
    password: process.env.GMAIL_APP_PASSWORD || "",
    host: "imap.gmail.com",
    port: 993,
    tls: true,
  };
}

export function createIMAPConnection(): Imap {
  const config = getIMAPConfig();

  if (!config.user || !config.password) {
    throw new Error(
      "Gmail credentials not configured in environment variables"
    );
  }

  return new Imap(config);
}
