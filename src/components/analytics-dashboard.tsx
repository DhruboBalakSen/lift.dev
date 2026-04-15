"use client";

import { useMemo } from "react";
import { workoutPlan } from "@/lib/workout-plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { ALL_DAYS, type DayKey } from "@/lib/types";
import type { CompletionStore } from "@/hooks/use-completions";
import type { SkipStore } from "@/hooks/use-skips";
import {
  Flame,
  Target,
  TrendingUp,
  CheckCircle2,
  SkipForward,
} from "lucide-react";

interface AnalyticsDashboardProps {
  store: CompletionStore;
  skipStore: SkipStore;
  mounted: boolean;
}

function getDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getTotalExercises(day: DayKey): number {
  return (workoutPlan.days[day]?.length ?? 0) + workoutPlan.warmUp.length;
}

function getCompletedForDay(
  store: CompletionStore,
  dateKey: string,
  day: DayKey
): number {
  const dayData = store[dateKey]?.[day] ?? {};
  return Object.values(dayData).filter(Boolean).length;
}

function isDaySkipped(
  skipStore: SkipStore,
  dateKey: string,
  day: DayKey
): boolean {
  return !!skipStore[dateKey]?.[day];
}

// Calculate streak (consecutive days with at least 1 completion OR a skip)
function calculateStreak(
  store: CompletionStore,
  skipStore: SkipStore
): number {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10);
    const dayEntries = store[dateKey];
    const skipEntries = skipStore[dateKey];

    if (!dayEntries && !skipEntries) break;

    const totalCompleted = dayEntries
      ? Object.values(dayEntries).reduce(
          (sum, dayData) =>
            sum + Object.values(dayData).filter(Boolean).length,
          0
        )
      : 0;

    // A skip still counts as "active" for streak purposes
    const hasSkips = skipEntries && Object.keys(skipEntries).length > 0;

    if (totalCompleted > 0 || hasSkips) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Get the last 7 calendar days for the weekly chart
function getLast7Days(): {
  dateKey: string;
  label: string;
  dateLabel: string;
  dayOfWeek: DayKey;
}[] {
  const result: { dateKey: string; label: string; dateLabel: string; dayOfWeek: DayKey }[] = [];
  const today = new Date();
  const dayNames: DayKey[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    result.push({
      dateKey: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      dateLabel: `${dd}/${mm}`,
      dayOfWeek: dayNames[d.getDay()],
    });
  }
  return result;
}

const weeklyChartConfig: ChartConfig = {
  completed: {
    label: "Completed",
    color: "var(--chart-1)",
  },
  skipped: {
    label: "Skipped",
    color: "var(--chart-4)",
  },
  remaining: {
    label: "Remaining",
    color: "var(--chart-2)",
  },
};

const radialChartConfig: ChartConfig = {
  progress: {
    label: "Today",
    color: "var(--chart-1)",
  },
};

export function AnalyticsDashboard({
  store,
  skipStore,
  mounted,
}: AnalyticsDashboardProps) {
  const todayDateKey = getDateKey();

  const stats = useMemo(() => {
    if (!mounted) return null;

    const todayDayNames: DayKey[] = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const todayDay = todayDayNames[new Date().getDay()];
    const todaySkipped = isDaySkipped(skipStore, todayDateKey, todayDay);
    const todayTotal = todaySkipped ? 0 : getTotalExercises(todayDay);
    const todayCompleted = todaySkipped
      ? 0
      : getCompletedForDay(store, todayDateKey, todayDay);
    const todayPercentage =
      todayTotal > 0
        ? Math.round((todayCompleted / todayTotal) * 100)
        : 0;

    // Streak
    const streak = calculateStreak(store, skipStore);

    // Total all-time completions
    const allTimeCompleted = Object.values(store).reduce(
      (sum, dateData) =>
        sum +
        Object.values(dateData).reduce(
          (daySum, dayData) =>
            daySum + Object.values(dayData).filter(Boolean).length,
          0
        ),
      0
    );

    // Count all-time skips
    const allTimeSkipped = Object.values(skipStore).reduce(
      (sum, dateData) => sum + Object.keys(dateData).length,
      0
    );

    // Weekly data
    const last7 = getLast7Days();
    const weeklyData = last7.map(({ dateKey, label, dateLabel, dayOfWeek }) => {
      const total = getTotalExercises(dayOfWeek);
      const skipped = isDaySkipped(skipStore, dateKey, dayOfWeek);

      if (skipped) {
        return { day: label, dateLabel, completed: 0, skipped: total, remaining: 0, total };
      }

      const completed = getCompletedForDay(store, dateKey, dayOfWeek);
      const remaining = Math.max(0, total - completed);
      return { day: label, dateLabel, completed, skipped: 0, remaining, total };
    });

    const weeklyCompleted = weeklyData.reduce((s, d) => s + d.completed, 0);
    const weeklyTotal = weeklyData.reduce((s, d) => s + d.total, 0);
    const weeklySkippedCount = weeklyData.filter((d) => d.skipped > 0).length;

    // Per-day breakdown
    const dayBreakdown = ALL_DAYS.map((day) => {
      const skipped = isDaySkipped(skipStore, todayDateKey, day);
      const total = getTotalExercises(day);
      const completed = skipped
        ? 0
        : getCompletedForDay(store, todayDateKey, day);
      return {
        day,
        total,
        completed,
        skipped,
        percentage:
          total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    return {
      todayDay,
      todayTotal,
      todayCompleted,
      todayPercentage,
      todaySkipped,
      streak,
      allTimeCompleted,
      allTimeSkipped,
      weeklyData,
      weeklyCompleted,
      weeklyTotal,
      weeklySkippedCount,
      dayBreakdown,
    };
  }, [store, skipStore, mounted, todayDateKey]);

  if (!mounted || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const radialData = [
    {
      name: "progress",
      value: stats.todaySkipped ? 0 : stats.todayPercentage,
      fill: "var(--color-progress)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                <Target className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Today</p>
                {stats.todaySkipped ? (
                  <Badge
                    variant="outline"
                    className="text-orange-500 border-orange-500/50 mt-1"
                  >
                    Skipped
                  </Badge>
                ) : (
                  <p className="text-2xl font-bold">
                    {stats.todayCompleted}/{stats.todayTotal}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">
                  {stats.streak} {stats.streak === 1 ? "day" : "days"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                <TrendingUp className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {stats.weeklyCompleted}/{stats.weeklyTotal}
                </p>
                {stats.weeklySkippedCount > 0 && (
                  <p className="text-[10px] text-orange-500">
                    {stats.weeklySkippedCount} skipped
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                <SkipForward className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Skipped</p>
                <p className="text-2xl font-bold">{stats.allTimeSkipped}</p>
                <p className="text-[10px] text-muted-foreground">all time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={weeklyChartConfig}
              className="h-62.5 w-full"
            >
              <BarChart data={stats.weeklyData} accessibilityLayer>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={({ x, y, payload, index }: { x: string | number; y: string | number; payload: { value: string }; index: number }) => {
                    const item = stats.weeklyData[index];
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text x={0} y={0} dy={12} textAnchor="middle" className="fill-muted-foreground text-xs">
                          {payload.value}
                        </text>
                        <text x={0} y={0} dy={26} textAnchor="middle" className="fill-muted-foreground text-[10px] opacity-70">
                          {item?.dateLabel}
                        </text>
                      </g>
                    );
                  }}
                  height={45}
                />
                <YAxis tickLine={false} axisLine={false} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="completed"
                  stackId="a"
                  fill="var(--color-completed)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="skipped"
                  stackId="a"
                  fill="var(--color-skipped)"
                  radius={[4, 4, 0, 0]}
                  opacity={0.6}
                />
                <Bar
                  dataKey="remaining"
                  stackId="a"
                  fill="var(--color-remaining)"
                  radius={[4, 4, 0, 0]}
                  opacity={0.3}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Today's Radial Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {stats.todaySkipped ? (
              <div className="flex flex-col items-center justify-center h-45">
                <SkipForward className="h-10 w-10 text-orange-500 mb-2" />
                <p className="text-lg font-semibold text-orange-500">
                  Skipped
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Today&apos;s workout was skipped
                </p>
              </div>
            ) : (
              <>
                <ChartContainer
                  config={radialChartConfig}
                  className="h-45 w-45"
                >
                  <RadialBarChart
                    data={radialData}
                    innerRadius={60}
                    outerRadius={85}
                    startAngle={90}
                    endAngle={90 - (360 * stats.todayPercentage) / 100}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      dataKey="value"
                      cornerRadius={10}
                      fill="var(--color-progress)"
                      background={{ fill: "var(--muted)" }}
                    />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-2xl font-bold"
                    >
                      {stats.todayPercentage}%
                    </text>
                  </RadialBarChart>
                </ChartContainer>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.todayCompleted} of {stats.todayTotal} exercises
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Day-by-day breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Today&apos;s Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.dayBreakdown
            .filter((d) => d.day === stats.todayDay)
            .map((d) => (
              <div key={d.day} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize font-medium flex items-center gap-2">
                    {d.day} Exercises
                    {d.skipped && (
                      <Badge
                        variant="outline"
                        className="text-orange-500 border-orange-500/50 text-[10px]"
                      >
                        Skipped
                      </Badge>
                    )}
                  </span>
                  {!d.skipped && (
                    <span className="text-muted-foreground">
                      {d.completed}/{d.total}
                    </span>
                  )}
                </div>
                {!d.skipped && (
                  <Progress value={d.percentage} className="h-2" />
                )}
              </div>
            ))}
          {!stats.todaySkipped && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Warmup</span>
                <span className="text-muted-foreground">
                  {getCompletedWarmup(store, todayDateKey, stats.todayDay)}/
                  {workoutPlan.warmUp.length}
                </span>
              </div>
              <Progress
                value={
                  workoutPlan.warmUp.length > 0
                    ? Math.round(
                        (getCompletedWarmup(
                          store,
                          todayDateKey,
                          stats.todayDay
                        ) /
                          workoutPlan.warmUp.length) *
                          100
                      )
                    : 0
                }
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getCompletedWarmup(
  store: CompletionStore,
  dateKey: string,
  day: DayKey
): number {
  const dayData = store[dateKey]?.[day] ?? {};
  return Object.entries(dayData).filter(
    ([k, v]) => k.startsWith("warmup-") && v
  ).length;
}
