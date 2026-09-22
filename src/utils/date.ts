// Local (device) date/time helpers.
//
// IMPORTANT: `Date.prototype.toISOString()` converts to UTC. Using it for
// "today's date" is a common bug: near midnight, a person east of UTC can
// see tomorrow's date, and a person west of UTC can see yesterday's. These
// helpers read the device's local calendar fields instead (getFullYear /
// getMonth / getDate), so "today" always matches what the person's clock
// actually shows.

/** Today's date as YYYY-MM-DD, in the device's local timezone. */
export function todayIso(): string {
  return toLocalIso(new Date());
}

/** Any Date as YYYY-MM-DD, in the device's local timezone. */
export function toLocalIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Human-readable local date + time, e.g. "Wednesday, September 23, 2026, 2:41 PM". */
export function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
