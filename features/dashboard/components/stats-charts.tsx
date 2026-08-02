"use client";

import { memo, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SurfaceCard } from "@/components/layouts/surface-card";
import type { AiRecommendation } from "@/lib/ai/shortlist-schema";

type StatusPoint = {
  status: string;
  label: string;
  count: number;
};

type TimePoint = {
  date: string;
  count: number;
};

type RecommendationPoint = {
  recommendation: AiRecommendation;
  label: string;
  count: number;
};

const CHART_HEIGHT = 288;

const RECOMMENDATION_COLORS: Record<AiRecommendation, string> = {
  strong_match: "var(--chart-3)",
  good_match: "var(--chart-2)",
  partial_match: "var(--chart-4)",
  poor_match: "var(--chart-5)",
};

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-56 items-center justify-center px-4 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

/**
 * Fixed-size chart host — avoids Recharts ResponsiveContainer resize thrash on scroll.
 */
function ChartFrame({ children }: { children: (width: number) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    let frame = 0;
    let last = 0;

    const publish = (next: number) => {
      const rounded = Math.floor(next);
      if (rounded <= 0 || Math.abs(rounded - last) < 2) {
        return;
      }
      last = rounded;
      setWidth(rounded);
    };

    publish(el.clientWidth);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        publish(entry.contentRect.width);
      });
    });

    observer.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="h-72 w-full [contain:layout_paint] [content-visibility:auto]"
      style={{ containIntrinsicSize: `auto ${CHART_HEIGHT}px` }}
    >
      {width > 0 ? children(width) : null}
    </div>
  );
}

export const ApplicationsByStatusChart = memo(function ApplicationsByStatusChart({
  data,
}: {
  data: StatusPoint[];
}) {
  const hasData = data.some((row) => row.count > 0);

  return (
    <SurfaceCard
      title="Applications by status"
      description="Where candidates sit in the hiring pipeline."
      className="[contain:content]"
    >
      {!hasData ? (
        <ChartEmpty message="No applications yet." />
      ) : (
        <ChartFrame>
          {(width) => (
            <BarChart
              width={width}
              height={CHART_HEIGHT}
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
                minTickGap={8}
                height={48}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
              <Tooltip isAnimationActive={false} />
              <Bar
                dataKey="count"
                fill="var(--chart-2)"
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          )}
        </ChartFrame>
      )}
    </SurfaceCard>
  );
});

export const ApplicationsOverTimeChart = memo(function ApplicationsOverTimeChart({
  data,
}: {
  data: TimePoint[];
}) {
  const hasData = data.some((row) => row.count > 0);
  const chartData = data.map((row) => ({
    ...row,
    label: row.date.slice(5),
  }));

  return (
    <SurfaceCard
      title="Applications over time"
      description="Daily submissions for the last 30 days."
      className="[contain:content]"
    >
      {!hasData ? (
        <ChartEmpty message="No submissions in the last 30 days." />
      ) : (
        <ChartFrame>
          {(width) => (
            <LineChart
              width={width}
              height={CHART_HEIGHT}
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={28} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
              <Tooltip
                isAnimationActive={false}
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
                isAnimationActive={false}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          )}
        </ChartFrame>
      )}
    </SurfaceCard>
  );
});

export const AiRecommendationsChart = memo(function AiRecommendationsChart({
  data,
}: {
  data: RecommendationPoint[];
}) {
  const hasData = data.some((row) => row.count > 0);

  return (
    <SurfaceCard
      title="AI recommendations"
      description="Latest shortlist band per screened application."
      className="[contain:content]"
    >
      {!hasData ? (
        <ChartEmpty message="Run AI shortlisting on applications to see recommendations." />
      ) : (
        <ChartFrame>
          {(width) => (
            <BarChart
              width={width}
              height={CHART_HEIGHT}
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} height={40} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
              <Tooltip isAnimationActive={false} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                {data.map((row) => (
                  <Cell
                    key={row.recommendation}
                    fill={RECOMMENDATION_COLORS[row.recommendation]}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ChartFrame>
      )}
    </SurfaceCard>
  );
});

export const JobsPublishedChart = memo(function JobsPublishedChart({
  data,
}: {
  data: TimePoint[];
}) {
  const hasData = data.some((row) => row.count > 0);
  const chartData = data.map((row) => ({
    ...row,
    label: row.date.slice(5),
  }));

  return (
    <SurfaceCard
      title="Jobs published"
      description="Roles published per day for the last 30 days."
      className="[contain:content]"
    >
      {!hasData ? (
        <ChartEmpty message="No jobs published in the last 30 days." />
      ) : (
        <ChartFrame>
          {(width) => (
            <BarChart
              width={width}
              height={CHART_HEIGHT}
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={28} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
              <Tooltip
                isAnimationActive={false}
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as TimePoint | undefined;
                  return point?.date ?? "";
                }}
              />
              <Bar
                dataKey="count"
                fill="var(--chart-1)"
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          )}
        </ChartFrame>
      )}
    </SurfaceCard>
  );
});
