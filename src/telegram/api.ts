import axios from "axios";
import { env } from "../config/env.js";

type Update = {
  update_id: number;
  message?: { text?: string };
};

export async function getUpdates(offset?: number): Promise<Update[]> {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getUpdates`;

  const res = await axios.get(url, {
    params: { offset, timeout: 0, allowed_updates: ["message"] },
  });

  return res.data.result ?? [];
}

export async function sendTelegram(text: string) {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  await axios.post(url, {
    chat_id: env.TELEGRAM_CHAT_ID,
    text,
    disable_web_page_preview: false,
  });
}
