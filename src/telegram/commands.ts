import dayjs from "dayjs";

export type Command =
  | { kind: "done"; id: string }
  | { kind: "snooze"; id: string; days: number };

export function parseCommand(text: string): Command | null {
  const t = text.trim();

  const doneMatch = t.match(/^\/done\s+(\S+)\s*$/i);
  if (doneMatch && doneMatch[1]) {
    return { kind: "done", id: doneMatch[1] };
  }

  const snoozeMatch = t.match(/^\/snooze\s+(\S+)\s+(\d+)\s*d?\s*$/i);
  if (snoozeMatch && snoozeMatch[1] && snoozeMatch[2]) {
    return { kind: "snooze", id: snoozeMatch[1], days: Number(snoozeMatch[2]) };
  }

  return null;
}

export function snoozeUntil(days: number) {
  return dayjs().add(days, "day").format("YYYY-MM-DD");
}
