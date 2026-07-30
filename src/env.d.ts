/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    runtime?: {
      env: {
        SLACK_WEBHOOK_URL?: string;
        CRM_INQUIRY_WEBHOOK_URL?: string;
        CRM_INQUIRY_WEBHOOK_TOKEN?: string;
        CRM_INQUIRY_WEBHOOK_AUTH_HEADER?: string;
        TURNSTILE_SECRET_KEY?: string;
        RATE_LIMIT?: { get(key: string): Promise<string | null> };
      };
    };
  }
}
