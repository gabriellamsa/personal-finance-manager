"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "@/lib/formatters/currency";

const percentageFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  style: "percent",
});

type CategoryBreakdownChartProps = {
  currencyCode: string;
  data: Array<{
    color: string;
    name: string;
    totalAmountInCents: number;
  }>;
};

export function CategoryBreakdownChart({
  currencyCode,
  data,
}: CategoryBreakdownChartProps) {
  const totalExpensesInCents = data.reduce(
    (total, entry) => total + entry.totalAmountInCents,
    0,
  );
  const formatTooltipValue = (
    value: number | string | ReadonlyArray<number | string> | undefined,
  ) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;

    return formatCurrency(Number(normalizedValue ?? 0), currencyCode);
  };

  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-foreground/62">
        Add expense transactions this month to populate the category chart.
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-6">
      <div className="h-[260px] min-w-0">
        <ResponsiveContainer
          height="100%"
          initialDimension={{ height: 260, width: 640 }}
          width="100%"
        >
          <PieChart accessibilityLayer>
            <Pie
              data={data}
              dataKey="totalAmountInCents"
              innerRadius={62}
              nameKey="name"
              outerRadius={96}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={formatTooltipValue} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul
        aria-label="Expense categories legend"
        className="grid min-w-0 divide-y divide-border border-y border-border"
      >
        {data.map((entry) => {
          const percentage =
            totalExpensesInCents > 0
              ? entry.totalAmountInCents / totalExpensesInCents
              : 0;

          return (
            <li
              className="flex min-w-0 items-center gap-3 py-3"
              key={entry.name}
            >
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {entry.name}
                </p>
                <p className="text-xs text-foreground/58">
                  {percentageFormatter.format(percentage)}
                  {" of expenses"}
                </p>
              </div>
              <p className="shrink-0 font-mono text-sm font-medium tabular-nums text-foreground/76">
                {formatCurrency(entry.totalAmountInCents, currencyCode)}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
