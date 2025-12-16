import fs from "node:fs";
import { google } from "googleapis";
import { env } from "../config/env.js";

export function getSheetsClient() {
  const json =
    env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH
      ? fs.readFileSync(env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH, "utf8")
      : Buffer.from(env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64!, "base64").toString("utf8");

  const creds = JSON.parse(json);

  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}
