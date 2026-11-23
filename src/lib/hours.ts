import type { DayHours, OpeningHours } from "@/db/schema";

export type DayKey = keyof OpeningHours;

export const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: "mon", label: "Monday", short: "Mon" },
  { key: "tue", label: "Tuesday", short: "Tue" },
  { key: "wed", label: "Wednesday", short: "Wed" },
  { key: "thu", label: "Thursday", short: "Thu" },
  { key: "fri", label: "Friday", short: "Fri" },
  { key: "sat", label: "Saturday", short: "Sat" },
  { key: "sun", label: "Sunday", short: "Sun" },
];

export const BUSINESS_TIMEZONE = "Africa/Johannesburg";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Current weekday + minutes-since-midnight in Newcastle, KZN. */
export function nowInJohannesburg(): { day: DayKey; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = get("weekday").slice(0, 3).toLowerCase() as DayKey;
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  return { day, minutes: hour * 60 + minute };
}

export function isOpenNow(hours: OpeningHours): boolean {
  const { day, minutes } = nowInJohannesburg();
  const today: DayHours | undefined = hours[day];
  if (!today || today.closed) return false;
  return minutes >= toMinutes(today.open) && minutes < toMinutes(today.close);
}

/** Groups identical consecutive days: "Monday – Sunday: 08:00 – 20:00" */
export function describeHours(hours: OpeningHours): string[] {
  const lines: string[] = [];
  let start = 0;
  const text = (d: DayHours) => (d.closed ? "Closed" : `${d.open} – ${d.close}`);

  for (let i = 1; i <= DAYS.length; i++) {
    const current = hours[DAYS[start].key];
    const next = i < DAYS.length ? hours[DAYS[i].key] : null;
    if (!next || text(next) !== text(current)) {
      const label =
        start === i - 1
          ? DAYS[start].label
          : `${DAYS[start].label} – ${DAYS[i - 1].label}`;
      lines.push(`${label}: ${text(current)}`);
      start = i;
    }
  }
  return lines;
}
