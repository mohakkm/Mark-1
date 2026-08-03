const UTC_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function parseDateInput(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export function formatUtcDayMonth(value: string): string {
  const date = parseDateInput(value);
  if (!date) {
    return "—";
  }

  return `${date.getUTCDate()} ${UTC_MONTHS_SHORT[date.getUTCMonth()]}`;
}

export function formatUtcDayMonthYear(value: string): string {
  const date = parseDateInput(value);
  if (!date) {
    return "—";
  }

  return `${date.getUTCDate()} ${UTC_MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatUtcDayMonthYearTime(value: string): string {
  const date = parseDateInput(value);
  if (!date) {
    return "—";
  }

  const hours = `${date.getUTCHours()}`.padStart(2, "0");
  const minutes = `${date.getUTCMinutes()}`.padStart(2, "0");
  return `${date.getUTCDate()} ${UTC_MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${hours}:${minutes} UTC`;
}
