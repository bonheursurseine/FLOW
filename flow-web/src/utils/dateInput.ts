export function toDateInputValue(timestamp: string | Date): string {
  const date = timestamp instanceof Date ? new Date(timestamp) : new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

export function isValidDateInputValue(value: string): boolean {
  return parseDateInputValue(value) !== null;
}

export function replaceTimestampDate(timestamp: string, nextDateValue: string): string | null {
  const nextDateParts = parseDateInputValue(nextDateValue);
  const currentDate = new Date(timestamp);

  if (!nextDateParts || Number.isNaN(currentDate.getTime())) {
    return null;
  }

  const nextTimestamp = new Date(
    nextDateParts.year,
    nextDateParts.month - 1,
    nextDateParts.day,
    currentDate.getHours(),
    currentDate.getMinutes(),
    currentDate.getSeconds(),
    currentDate.getMilliseconds()
  );

  return Number.isNaN(nextTimestamp.getTime()) ? null : nextTimestamp.toISOString();
}

function parseDateInputValue(value: string): { day: number; month: number; year: number } | null {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { day, month, year };
}
