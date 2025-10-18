/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    runtime?: {
      env: {
        SLACK_WEBHOOK_URL: string;
      };
    };
  }
}
