/**
 * Date and Timestamp Utilities
 * Ensures strict ISO-8601 storage with timezone preservation.
 */

/**
 * Returns current timestamp as full ISO-8601 with timezone offset
 * e.g., 2026-09-29T19:15:32+05:30
 */
export function getCurrentISOTimestamp(): string {
  const now = new Date();
  return formatToISOWithOffset(now);
}

/**
 * Formats a Date object into an ISO-8601 string including timezone offset
 */
export function formatToISOWithOffset(date: Date): string {
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = (num: number, digits: number = 2) => String(num).padStart(digits, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const milliseconds = pad(date.getMilliseconds(), 3);

  const tzHours = pad(Math.floor(Math.abs(tzo) / 60));
  const tzMinutes = pad(Math.abs(tzo) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${dif}${tzHours}:${tzMinutes}`;
}

/**
 * Extracts YYYY-MM-DD local date key from an ISO timestamp
 */
export function getDateKey(isoTimestamp: string | Date): string {
  const d = typeof isoTimestamp === 'string' ? new Date(isoTimestamp) : isoTimestamp;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Formats an ISO timestamp for display in timeline: "07:15 PM"
 */
export function formatDisplayTime(isoTimestamp: string): string {
  try {
    const d = new Date(isoTimestamp);
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoTimestamp;
  }
}

/**
 * Formats a date for day headers:
 * e.g. "TODAY • 29 SEP 2026" or "YESTERDAY • 28 SEP 2026" or "WEDNESDAY • 24 SEP 2026"
 */
export function formatDayHeader(dateKey: string): { title: string; subtitle: string } {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const today = new Date();
  const todayKey = getDateKey(today);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday);

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];

  const subtitle = `${day} ${monthNames[month - 1]} ${year}`;

  if (dateKey === todayKey) {
    return { title: 'TODAY', subtitle };
  } else if (dateKey === yesterdayKey) {
    return { title: 'YESTERDAY', subtitle };
  } else {
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return { title: dayNames[date.getDay()], subtitle };
  }
}

/**
 * Gets ISO string range for a given date YYYY-MM-DD
 */
export function getDateDayRange(dateKey: string): { startISO: string; endISO: string } {
  const [year, month, day] = dateKey.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  return {
    startISO: formatToISOWithOffset(start),
    endISO: formatToISOWithOffset(end),
  };
}

/**
 * Gets ISO string range for past N days up to today
 */
export function getPastDaysRange(days: number): { startISO: string; endISO: string } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return {
    startISO: formatToISOWithOffset(start),
    endISO: formatToISOWithOffset(end),
  };
}
