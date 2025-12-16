import dayjs from "dayjs";
import { readTasks, updateTaskRow } from "../sheets/tasksSheet.js";
import { sendTelegram } from "../telegram/api.js";

function isSnoozed(until: string) {
  if (!until?.trim()) return false;
  const d = dayjs(until);
  return d.isValid() && (d.isAfter(dayjs(), "day") || d.isSame(dayjs(), "day"));
}

function shouldNotify(lastNotifiedAt: string) {
  if (!lastNotifiedAt?.trim()) return true;
  const t = dayjs(lastNotifiedAt);
  if (!t.isValid()) return true;
  return dayjs().diff(t, "hour") >= 6;
}

export async function runReminders() {
  const { rows, rowNumberMap } = await readTasks();
  const now = dayjs();

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowNo = rowNumberMap[i];
    if (!r || !rowNo) continue;

    if ((r.status || "").toLowerCase() === "done") continue;
    if (isSnoozed(r.snooze_until)) continue;

    const due = r.due_date?.trim() ? dayjs(r.due_date) : null;
    const overdue = due?.isValid() ? due.isBefore(now, "day") : false;
    const dueToday = due?.isValid() ? due.isSame(now, "day") : false;

    if (!overdue && !dueToday) continue;
    if (!shouldNotify(r.last_notified_at)) continue;

    const msg =
      (overdue ? "⏰ OVERDUE" : "📌 DUE TODAY") +
      ` (${r.id})\n` +
      `Task: ${r.task}\n` +
      (r.due_date ? `Due: ${r.due_date}${r.due_time ? " " + r.due_time : ""}\n` : "") +
      (r.link?.trim() ? `Link: ${r.link}\n` : "") +
      `Cmd: /done ${r.id} | /snooze ${r.id} 2d`;

    await sendTelegram(msg);

    await updateTaskRow(rowNo, {
      last_notified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
}
