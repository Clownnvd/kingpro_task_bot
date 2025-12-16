import dayjs from "dayjs";
import { readTasks } from "../sheets/tasksSheet.js";
import { sendTelegram } from "../telegram/api.js";

function isSnoozed(until: string) {
  if (!until?.trim()) return false;
  const d = dayjs(until);
  return d.isValid() && (d.isAfter(dayjs(), "day") || d.isSame(dayjs(), "day"));
}

export async function sendDailyDigest() {
  const { rows } = await readTasks();
  const now = dayjs();
  const today = now.format("YYYY-MM-DD");
  const tomorrow = now.add(1, "day").format("YYYY-MM-DD");

  const items = rows
    .filter(r => (r.status || "").toLowerCase() !== "done")
    .filter(r => !isSnoozed(r.snooze_until))
    .filter(r => {
      if (!r.due_date?.trim()) return true;
      const dl = dayjs(r.due_date);
      if (!dl.isValid()) return true;
      const dls = dl.format("YYYY-MM-DD");
      return dls === today || dls === tomorrow || dl.isBefore(now, "day");
    });

  if (!items.length) {
    await sendTelegram(`🌅 Digest ${today}\nKhông có task nào ✅`);
    return;
  }

  const lines = items.slice(0, 30).map(r => {
    const dl = r.due_date?.trim() ? r.due_date : "—";
    return `• (${r.id}) ${r.task} — DL:${dl} — ${r.priority || "med"}`;
  });

  await sendTelegram(`🌅 Digest ${today}\n${lines.join("\n")}`);
}
