import type { APIRoute } from 'astro';
import axios from 'axios';

export const prerender = false;

const SLACK_WEBHOOK_URL = import.meta.env.SLACK_WEBHOOK_URL;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { message, email, name, type, company, phone } = body;

    // お問い合わせ種別の日本語変換
    const typeLabels: Record<string, string> = {
      web: 'Webアプリ開発について',
      mobile: 'モバイルアプリ開発について',
      prototype: 'プロトタイプ・POC作成について',
      global: '海外向けサービス開発について',
      other: 'その他のご相談'
    };

    // Slackメッセージの構築
    const slackMessage = {
      text: `📬 新しいお問い合わせが届きました！`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📬 新しいお問い合わせ'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*種別:*\n${typeLabels[type] || '未選択'}`
            },
            {
              type: 'mrkdwn',
              text: `*お名前:*\n${name || '未記入'}`
            },
            {
              type: 'mrkdwn',
              text: `*会社名:*\n${company || '未記入'}`
            },
            {
              type: 'mrkdwn',
              text: `*メール:*\n${email || '未記入'}`
            },
            {
              type: 'mrkdwn',
              text: `*電話番号:*\n${phone || '未記入'}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*お問い合わせ内容:*\n${message || '未記入'}`
          }
        },
        {
          type: 'divider'
        }
      ]
    };

    // axiosでSlackに送信
    const response = await axios.post(SLACK_WEBHOOK_URL, slackMessage);

    if (response.status !== 200) {
      throw new Error(`Slack webhook failed: ${response.status}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Contact API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to send message',
        details: errorMessage
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
