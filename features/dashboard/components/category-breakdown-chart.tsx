"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "@/lib/formatters/currency";

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
  const formatTooltipValue = (
    value: number | string | ReadonlyArray<number | string> | undefined,
  ) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;

    return formatCurrency(Number(normalizedValue ?? 0), currencyCode);
  };

  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-foreground/62">
        No expense data is available for the current month yet.
      </div>
    );
  }

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="totalAmountInCents"
            innerRadius={62}
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
  );
}
