"use client";

import { useState } from "react";
import { workoutPlan } from "@/lib/workout-plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar, getTodayKey, type DayKey } from "@/components/app-sidebar";
import { Footer } from "@/components/footer";

export default function WorkoutPage() {
  const [selectedDay, setSelectedDay] = useState<DayKey>(getTodayKey());

  return (
    <SidebarProvider>
      <AppSidebar selectedDay={selectedDay} onSelectDay={setSelectedDay} />
      <SidebarInset>
        {/* Header bar */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2" />
          <h1 className="text-sm font-medium">
            💪 <span className="capitalize">{selectedDay}</span>&apos;s Workout
          </h1>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
            <DayView selectedDay={selectedDay} />
          </div>
          <div className="mt-auto">
            <Footer />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function DayView({ selectedDay }: { selectedDay: DayKey }) {
  const todayWorkout = workoutPlan.days[selectedDay];

  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setCompleted((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <>
      {/* Warmup */}
      <Card>
        <CardHeader>
          <CardTitle>🔥 Warmup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {workoutPlan.warmUp.map((item, i) => {
            const key = `warmup-${i}`;
            return (
              <div
                key={i}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={
                      completed[key] ? "line-through text-muted-foreground" : ""
                    }
                  >
                    {item.name}
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Workout */}
      <Card>
        <CardHeader>
          <CardTitle>
            🏋️ <span className="capitalize">{selectedDay}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayWorkout?.map((ex, i) => {
            const key = `workout-${i}`;
            return (
              <div
                key={i}
                className="flex items-center justify-between gap-4 border-b pb-2 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={
                      completed[key] ? "line-through text-muted-foreground" : ""
                    }
                  >
                    {ex.name}
                  </span>
                </div>

                {/* Optional reps */}
                {"reps" in ex && ex.reps && (
                  <Badge variant="outline">{ex.reps} reps</Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}