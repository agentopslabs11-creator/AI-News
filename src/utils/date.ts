/**
 * Date utility functions for newspaper editions and video broadcast scheduling.
 */

/**
 * Returns today's date formatted as YYYY-MM-DD in the user's local timezone.
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a given date string or Date object into a readable publication date.
 * E.g., "Monday, November 16, 2026"
 */
export const formatPublicationDate = (
  dateVal?: string | Date | null,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateVal) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  // If simple YYYY-MM-DD string, construct Date with local components to avoid UTC shift
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
    const [y, m, d] = dateVal.trim().split('-').map(Number);
    const localDate = new Date(y, m - 1, d);
    return localDate.toLocaleDateString('en-US', defaultOptions);
  }

  const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  if (isNaN(d.getTime())) return String(dateVal);

  return d.toLocaleDateString('en-US', defaultOptions);
};

/**
 * Checks if a given date string or Date object matches today's calendar date.
 * Works for both YYYY-MM-DD strings and ISO timestamps.
 */
export const isTodayDate = (dateVal?: string | Date | null): boolean => {
  if (!dateVal) return false;
  const now = new Date();
  const todayStr = getTodayDateString();

  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    // Pure YYYY-MM-DD date check
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed === todayStr;
    }

    // If starts with YYYY-MM-DD
    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match && match[1] === todayStr) {
      return true;
    }
  }

  const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  if (isNaN(d.getTime())) return false;

  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};
