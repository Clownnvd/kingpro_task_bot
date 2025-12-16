import { getSheetsClient } from "./client.js";
import { env } from "../config/env.js";

const TAB = "Settings";

export async function getTelegramOffset(): Promise<number> {
  const sheets = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: env.SHEET_ID,
    range: `${TAB}!B1:B1`,
  });

  const v = res.data.values?.[0]?.[0];
  return Number(v ?? 0);
}

export async function setTelegramOffset(offset: number) {
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.SHEET_ID,
    range: `${TAB}!B1:B1`,
    valueInputOption: "RAW",
    requestBody: { values: [[String(offset)]] },
  });
}
