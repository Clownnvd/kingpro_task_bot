import "dotenv/config";
import { sendDailyDigest } from "./core/digest.js";

sendDailyDigest().catch((e) => {
  console.error(e);
  process.exit(1);
});
