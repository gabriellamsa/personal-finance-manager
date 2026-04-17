import { type TransactionType } from "@prisma/client";

export type DefaultCategoryDefinition = {
  readonly color: string;
  readonly icon: string;
  readonly name: string;
  readonly slug: string;
  readonly systemKey: string;
  readonly type: TransactionType;
};

export const DEFAULT_CATEGORIES: readonly DefaultCategoryDefinition[] = [
  {
    systemKey: "salary",
    type: "INCOME",
    name: "Salary",
    slug: "salary",
    color: "#2563EB",
    icon: "wallet",
  },
  {
    systemKey: "freelance",
    type: "INCOME",
    name: "Freelance",
    slug: "freelance",
    color: "#0F766E",
    icon: "briefcase",
  },
  {
    systemKey: "investments",
    type: "INCOME",
    name: "Investments",
    slug: "investments",
    color: "#7C3AED",
    icon: "line-chart",
  },
  {
    systemKey: "bonus",
    type: "INCOME",
    name: "Bonus",
    slug: "bonus",
    color: "#9333EA",
    icon: "sparkles",
  },
  {
    systemKey: "refund",
    type: "INCOME",
    name: "Refund",
    slug: "refund",
    color: "#0369A1",
    icon: "rotate-ccw",
  },
  {
    systemKey: "housing",
    type: "EXPENSE",
    name: "Housing",
    slug: "housing",
    color: "#DC2626",
    icon: "home",
  },
  {
    systemKey: "groceries",
    type: "EXPENSE",
    name: "Groceries",
    slug: "groceries",
    color: "#EA580C",
    icon: "shopping-cart",
  },
  {
    systemKey: "transport",
    type: "EXPENSE",
    name: "Transport",
    slug: "transport",
    color: "#0891B2",
    icon: "car",
  },
  {
    systemKey: "utilities",
    type: "EXPENSE",
    name: "Utilities",
    slug: "utilities",
    color: "#4F46E5",
    icon: "bolt",
  },
  {
    systemKey: "health",
    type: "EXPENSE",
    name: "Health",
    slug: "health",
    color: "#BE123C",
    icon: "heart-pulse",
  },
  {
    systemKey: "education",
    type: "EXPENSE",
    name: "Education",
    slug: "education",
    color: "#7C2D12",
    icon: "book-open",
  },
  {
    systemKey: "entertainment",
    type: "EXPENSE",
    name: "Entertainment",
    slug: "entertainment",
    color: "#C026D3",
    icon: "film",
  },
  {
    systemKey: "shopping",
    type: "EXPENSE",
    name: "Shopping",
    slug: "shopping",
    color: "#9333EA",
    icon: "bag",
  },
  {
    systemKey: "travel",
    type: "EXPENSE",
    name: "Travel",
    slug: "travel",
    color: "#0284C7",
    icon: "plane",
  },
  {
    systemKey: "subscriptions",
    type: "EXPENSE",
    name: "Subscriptions",
    slug: "subscriptions",
    color: "#475569",
    icon: "credit-card",
  },
] as const;
