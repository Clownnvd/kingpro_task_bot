import { env } from "../config/env.js";
import { getSheetsClient } from "./client.js";
export type TaskRow = {
  id: string;
  task: string;
  link: string;
  notes: string;
  priority: string;
  due_date: string;
  due_time: string;
  repeat: string;
  status: string;
  snooze_until: string;
  last_notified_at: string;
  updated_at: string;
};

const HEADERS: (keyof TaskRow)[] = [
  "id","task","link","notes","priority",
  "due_date","due_time","repeat",
  "status","snooze_until","last_notified_at","updated_at",
];

export async function readTasks(): Promise<{ rows: TaskRow[]; rowNumberMap: number[] }> {
  const sheets = getSheetsClient();
  const range = `${env.SHEET_TAB}!A1:L999`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: env.SHEET_ID,
    range,
  });

  const values = (res.data.values ?? []) as string[][];
  if (values.length === 0) return { rows: [], rowNumberMap: [] };

  const rows: TaskRow[] = [];
  const rowNumberMap: number[] = [];

  for (let i = 1; i < values.length; i++) {
    const line = values[i];
    if (!line || line.every(c => !c)) continue;

    const obj: any = {};
    for (const [c, key] of HEADERS.entries()) {
        obj[key] = (line[c] ?? "").toString();
        }



    if (!obj.id || !obj.task) continue;

    rows.push(obj as TaskRow);
    rowNumberMap.push(i + 1);
  }

  return { rows, rowNumberMap };
}

export async function updateTaskRow(rowNumber: number, patch: Partial<TaskRow>) {
  const sheets = getSheetsClient();
  const range = `${env.SHEET_TAB}!A${rowNumber}:L${rowNumber}`;

  const current = await sheets.spreadsheets.values.get({
    spreadsheetId: env.SHEET_ID,
    range,
  });

  const currentValues = (current.data.values?.[0] ?? []) as string[];

  const merged: any = {};
  for (const [i, key] of HEADERS.entries()) {
    merged[key] = (currentValues[i] ?? "").toString();
    }


  Object.assign(merged, patch);

  const newRow = HEADERS.map(h => merged[h] ?? "");

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.SHEET_ID,
    range,
    valueInputOption: "RAW",
    requestBody: { values: [newRow] },
  });
}

export async function findTaskById(id: string) {
  const { rows, rowNumberMap } = await readTasks();

  for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const rowNo = rowNumberMap[i];
  if (!row || !rowNo) continue;

  if (row.id.trim() === id.trim()) {
    return { row, rowNumber: rowNo };
  }
}

  return null;
}
