import "dotenv/config";
import { runReminders } from "./core/reminders.js";
runReminders().catch((e) => {
  console.error(e);
  process.exit(1);
});
