export function formatCurrency(amountInCents: number, currencyCode = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      currency: currencyCode,
      style: "currency",
    }).format(amountInCents / 100);
  } catch {
    return new Intl.NumberFormat("en-US", {
      currency: "USD",
      style: "currency",
    }).format(amountInCents / 100);
  }
}
