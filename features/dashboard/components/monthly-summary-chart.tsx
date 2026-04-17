"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/formatters/currency";

type MonthlySummaryChartProps = {
  currencyCode: string;
  data: Array<{
    expenseInCents: number;
    incomeInCents: number;
    label: string;
  }>;
};

export function MonthlySummaryChart({
  currencyCode,
  data,
}: MonthlySummaryChartProps) {
  const formatTooltipValue = (
    value: number | string | ReadonlyArray<number | string> | undefined,
  ) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;

    return formatCurrency(Number(normalizedValue ?? 0), currencyCode);
  };

  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-foreground/62">
        Monthly trend data will appear once transactions are recorded.
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(20,33,61,0.08)" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickFormatter={(value: number | string) =>
              new Intl.NumberFormat("en-US", {
                currency: currencyCode,
                maximumFractionDigits: 0,
                notation: "compact",
                style: "currency",
              }).format(Number(value) / 100)
            }
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            width={92}
          />
          <Tooltip formatter={formatTooltipValue} />
          <Bar dataKey="incomeInCents" fill="#0F766E" radius={[10, 10, 0, 0]} />
          <Bar dataKey="expenseInCents" fill="#B91C1C" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
