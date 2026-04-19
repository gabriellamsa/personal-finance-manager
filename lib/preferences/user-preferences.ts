const COMMON_CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "BRL",
  "CAD",
  "AUD",
  "JPY",
  "INR",
] as const;

const COMMON_TIME_ZONES = [
  "UTC",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Asia/Bangkok",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

export type PreferenceOption = {
  label: string;
  value: string;
};

function getSupportedValues(
  key: "currency" | "timeZone",
  fallback: readonly string[],
) {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf(key);
  }

  return [...fallback];
}

function orderByPriority(
  values: string[],
  priority: readonly string[],
) {
  const normalizedValues = new Set(values);
  const orderedPriority = priority.filter((value) => normalizedValues.has(value));
  const remainingValues = values.filter((value) => !priority.includes(value));

  return [...orderedPriority, ...remainingValues];
}

const supportedCurrencyCodes = orderByPriority(
  getSupportedValues("currency", COMMON_CURRENCY_CODES),
  COMMON_CURRENCY_CODES,
);

const supportedTimeZones = orderByPriority(
  getSupportedValues("timeZone", COMMON_TIME_ZONES),
  COMMON_TIME_ZONES,
);

const supportedCurrencyCodeSet = new Set(supportedCurrencyCodes);
const supportedTimeZoneSet = new Set(supportedTimeZones);
const currencyDisplayNames = new Intl.DisplayNames(["en-US"], {
  type: "currency",
});
const currencyOptions = supportedCurrencyCodes.map((currencyCode) => ({
  label: `${currencyCode} - ${currencyDisplayNames.of(currencyCode) ?? currencyCode}`,
  value: currencyCode,
}));
const timeZoneOptions = supportedTimeZones.map((timeZone) => ({
  label: timeZone,
  value: timeZone,
}));

export function isSupportedCurrencyCode(value: string) {
  return supportedCurrencyCodeSet.has(value);
}

export function isSupportedTimeZone(value: string) {
  return supportedTimeZoneSet.has(value);
}

export function getCurrencyOptions(): PreferenceOption[] {
  return currencyOptions;
}

export function getTimeZoneOptions(): PreferenceOption[] {
  return timeZoneOptions;
}
