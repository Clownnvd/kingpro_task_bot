import { getUpdates, sendTelegram } from "../telegram/api.js";
import { parseCommand, snoozeUntil } from "../telegram/commands.js";
import { findTaskById, updateTaskRow } from "../sheets/tasksSheet.js";
import { getTelegramOffset, setTelegramOffset } from "../sheets/settings.js";

export async function handleTelegramCommands() {
  const offset = await getTelegramOffset();
  const updates = await getUpdates(offset ? offset + 1 : undefined);
  if (!updates.length) return;

  let maxId = offset;

  for (const u of updates) {
    if (u.update_id > maxId) maxId = u.update_id;

    const text = u.message?.text?.trim();
    if (!text) continue;

    const cmd = parseCommand(text);
    if (!cmd) continue;

    const found = await findTaskById(cmd.id);
    if (!found) {
      await sendTelegram(`❌ Không tìm thấy task id=${cmd.id} trong sheet.`);
      continue;
    }

    if (cmd.kind === "done") {
      await updateTaskRow(found.rowNumber, {
        status: "done",
        snooze_until: "",
        updated_at: new Date().toISOString(),
      });
      await sendTelegram(`✅ DONE (${cmd.id}): ${found.row.task}`);
    }

    if (cmd.kind === "snooze") {
      const until = snoozeUntil(cmd.days);
      await updateTaskRow(found.rowNumber, {
        snooze_until: until,
        updated_at: new Date().toISOString(),
      });
      await sendTelegram(`😴 SNOOZE (${cmd.id}) ${cmd.days}d → ${until}\nTask: ${found.row.task}`);
    }
  }

  await setTelegramOffset(maxId);
}
