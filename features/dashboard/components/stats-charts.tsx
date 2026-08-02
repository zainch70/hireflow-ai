"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SurfaceCard } from "@/components/layouts/surface-card";

type StatusPoint = {
  status: string;
  label: string;
  count: number;
};

type TimePoint = {
  date: string;
  count: number;
};

type TopJobPoint = {
  jobId: string;
  jobTitle: string;
  count: number;
};

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function JobsByStatusChart({ data }: { data: StatusPoint[] }) {
  const hasData = data.some((row) => row.count > 0);

  return (
    <SurfaceCard
      title="Jobs by status"
      description="Current openings across the pipeline."
    >
      {!hasData ? (
        <ChartEmpty message="No jobs yet." />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SurfaceCard>
  );
}

export function ApplicationsByStatusChart({ data }: { data: StatusPoint[] }) {
  const hasData = data.some((row) => row.count > 0);

  return (
    <SurfaceCard
      title="Applications by status"
      description="Where candidates sit in review."
    >
      {!hasData ? (
        <ChartEmpty message="No applications yet." />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SurfaceCard>
  );
}

export function ApplicationsOverTimeChart({ data }: { data: TimePoint[] }) {
  const hasData = data.some((row) => row.count > 0);
  const chartData = data.map((row) => ({
    ...row,
    label: row.date.slice(5),
  }));

  return (
    <SurfaceCard
      title="Applications over time"
      description="Daily submissions for the last 30 days."
    >
      {!hasData ? (
        <ChartEmpty message="No submissions in the last 30 days." />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={24} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
              <Tooltip
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as TimePoint | undefined;
                  return point?.date ?? "";
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </SurfaceCard>
  );
}

export function TopJobsByApplicationsChart({ data }: { data: TopJobPoint[] }) {
  return (
    <SurfaceCard
      title="Top jobs by applications"
      description="Roles attracting the most candidates."
    >
      {data.length === 0 ? (
        <ChartEmpty message="No application volume yet." />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="jobTitle"
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="var(--chart-3)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SurfaceCard>
  );
}
