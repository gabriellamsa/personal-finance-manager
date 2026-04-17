export function formatCurrency(amountInCents: number, currencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    currency: currencyCode,
    style: "currency",
  }).format(amountInCents / 100);
}
