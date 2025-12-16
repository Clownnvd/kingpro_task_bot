import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),

  SHEET_ID: z.string().min(1),
  SHEET_TAB: z.string().default("Tasks"),

  GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_JSON_PATH: z.string().optional(),

  TZ: z.string().optional(),
}).refine(
  (v) => !!v.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 || !!v.GOOGLE_SERVICE_ACCOUNT_JSON_PATH,
  { message: "Provide GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 or GOOGLE_SERVICE_ACCOUNT_JSON_PATH" }
);

export const env = EnvSchema.parse(process.env);
