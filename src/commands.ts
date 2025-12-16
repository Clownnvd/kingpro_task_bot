import "dotenv/config";
import { handleTelegramCommands } from "./core/handleCommands.js";

handleTelegramCommands().catch((e) => {
  console.error(e);
  process.exit(1);
});
