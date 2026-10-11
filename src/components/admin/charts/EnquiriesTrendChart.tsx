"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

type Props = { data: { date: string; count: number }[] };

export default function EnquiriesTrendChart({ data }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    label: format(new Date(d.date), "MMM d"),
  }));

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="enquiryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C89B3C" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#C89B3C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.05)",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value} enquiries`, ""]}
            labelFormatter={(label) => label}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#C89B3C"
            strokeWidth={2.5}
            fill="url(#enquiryGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}