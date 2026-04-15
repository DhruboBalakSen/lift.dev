"use client";

import { useMemo } from "react";
import { workoutPlan } from "@/lib/workout-plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import type { DayKey } from "@/lib/types";
import type { CompletionStore } from "@/hooks/use-completions";
import {
  Flame,
  Target,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

const ALL_DAYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

interface AnalyticsDashboardProps {
  store: CompletionStore;
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

// Calculate streak (consecutive days with at least 1 completion)
function calculateStreak(store: CompletionStore): number {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10);
    const dayEntries = store[dateKey];

    if (!dayEntries) break;

    const totalCompleted = Object.values(dayEntries).reduce(
      (sum, dayData) => sum + Object.values(dayData).filter(Boolean).length,
      0
    );

    if (totalCompleted > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Get the last 7 calendar days for the weekly chart
function getLast7Days(): { dateKey: string; label: string; dayOfWeek: DayKey }[] {
  const result: { dateKey: string; label: string; dayOfWeek: DayKey }[] = [];
  const today = new Date();
  const dayNames: DayKey[] = [
    "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
  ];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    result.push({
      dateKey: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
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
  total: {
    label: "Total",
    color: "var(--chart-2)",
  },
};

const radialChartConfig: ChartConfig = {
  progress: {
    label: "Today",
    color: "var(--chart-1)",
  },
};

export function AnalyticsDashboard({ store, mounted }: AnalyticsDashboardProps) {
  const todayDateKey = getDateKey();

  const stats = useMemo(() => {
    if (!mounted) return null;

    // Today's stats
    const todayDayNames: DayKey[] = [
      "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
    ];
    const todayDay = todayDayNames[new Date().getDay()];
    const todayTotal = getTotalExercises(todayDay);
    const todayCompleted = getCompletedForDay(store, todayDateKey, todayDay);
    const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    // Streak
    const streak = calculateStreak(store);

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

    // Weekly data
    const last7 = getLast7Days();
    const weeklyData = last7.map(({ dateKey, label, dayOfWeek }) => {
      const total = getTotalExercises(dayOfWeek);
      const completed = getCompletedForDay(store, dateKey, dayOfWeek);
      return { day: label, completed, total };
    });

    const weeklyCompleted = weeklyData.reduce((s, d) => s + d.completed, 0);
    const weeklyTotal = weeklyData.reduce((s, d) => s + d.total, 0);

    // Per-day completion for today (for detailed breakdown)
    const dayBreakdown = ALL_DAYS.map((day) => {
      const total = getTotalExercises(day);
      const completed = getCompletedForDay(store, todayDateKey, day);
      return { day, total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
    });

    return {
      todayDay,
      todayTotal,
      todayCompleted,
      todayPercentage,
      streak,
      allTimeCompleted,
      weeklyData,
      weeklyCompleted,
      weeklyTotal,
      dayBreakdown,
    };
  }, [store, mounted, todayDateKey]);

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

  const radialData = [{ name: "progress", value: stats.todayPercentage, fill: "var(--color-progress)" }];

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
                <p className="text-2xl font-bold">
                  {stats.todayCompleted}/{stats.todayTotal}
                </p>
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
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                <CheckCircle2 className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">All Time</p>
                <p className="text-2xl font-bold">{stats.allTimeCompleted}</p>
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
            <ChartContainer config={weeklyChartConfig} className="h-62.5 w-full">
              <BarChart data={stats.weeklyData} accessibilityLayer>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="completed"
                  fill="var(--color-completed)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="total"
                  fill="var(--color-total)"
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
            <ChartContainer config={radialChartConfig} className="h-45 w-45">
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
          </CardContent>
        </Card>
      </div>

      {/* Day-by-day breakdown for today */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Breakdown by Day Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.dayBreakdown
            .filter((d) => d.day === stats.todayDay)
            .map((d) => (
              <div key={d.day} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize font-medium">{d.day} Exercises</span>
                  <span className="text-muted-foreground">
                    {d.completed}/{d.total}
                  </span>
                </div>
                <Progress value={d.percentage} className="h-2" />
              </div>
            ))}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Warmup</span>
              <span className="text-muted-foreground">
                {getCompletedWarmup(store, todayDateKey, stats.todayDay)}/{workoutPlan.warmUp.length}
              </span>
            </div>
            <Progress
              value={
                workoutPlan.warmUp.length > 0
                  ? Math.round(
                      (getCompletedWarmup(store, todayDateKey, stats.todayDay) /
                        workoutPlan.warmUp.length) *
                        100
                    )
                  : 0
              }
              className="h-2"
            />
          </div>
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
  return Object.entries(dayData)
    .filter(([k, v]) => k.startsWith("warmup-") && v)
    .length;
}
