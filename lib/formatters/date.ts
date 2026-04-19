function normalizeDateValue(date: string | Date) {
  return typeof date === "string" ? new Date(date) : date;
}

export function formatDate(date: string | Date) {
  const value = normalizeDateValue(date);

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(value);
}

export function formatDateTime(date: string | Date, timeZone = "UTC") {
  const value = normalizeDateValue(date);

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    }).format(value);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(value);
  }
}

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
    year: "2-digit",
  }).format(date);
}
