import { format, formatDistanceToNow, isValid } from "date-fns";

type DateInput = Date | string | number;

function toDate(input: DateInput): Date {
  const d = input instanceof Date ? input : new Date(input);
  if (!isValid(d)) throw new RangeError(`formatDate: invalid date input — "${input}"`);
  return d;
}

/**
 * Formats a date as "Jan 01, 2026".
 * @example formatDate("2026-01-01") // "Jan 01, 2026"
 */
export function formatDate(date: DateInput): string {
  return format(toDate(date), "MMM dd, yyyy");
}

/**
 * Formats a date as "09:00 AM".
 * @example formatTime(new Date()) // "02:45 PM"
 */
export function formatTime(date: DateInput): string {
  return format(toDate(date), "hh:mm aa");
}

/**
 * Returns a human-readable relative time string.
 * @example timeAgo("2026-01-01T10:00:00Z") // "2 hours ago"
 */
export function timeAgo(date: DateInput): string {
  return formatDistanceToNow(toDate(date), { addSuffix: true });
}