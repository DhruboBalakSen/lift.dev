"use client";

import { workoutPlan } from "@/lib/workout-plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useCompletions } from "@/hooks/use-completions";
import { useSelectedDay } from "@/hooks/use-selected-day";

export default function SchedulePage() {
  const { selectedDay } = useSelectedDay();
  const completions = useCompletions();
  const todayWorkout = workoutPlan.days[selectedDay];

  return (
    <>
      {/* Warmup */}
      <Card>
        <CardHeader>
          <CardTitle>🔥 Warmup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {workoutPlan.warmUp.map((item, i) => {
            const key = `warmup-${i}`;
            const checked = completions.isCompleted(selectedDay, key);
            return (
              <label
                key={i}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50 cursor-pointer"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => completions.toggle(selectedDay, key)}
                />
                <span
                  className={
                    checked
                      ? "line-through text-muted-foreground transition-colors"
                      : "transition-colors"
                  }
                >
                  {item.name}
                </span>
              </label>
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
        <CardContent className="space-y-1">
          {todayWorkout?.map((ex, i) => {
            const key = `workout-${i}`;
            const checked = completions.isCompleted(selectedDay, key);
            return (
              <label
                key={i}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50 cursor-pointer"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => completions.toggle(selectedDay, key)}
                />
                <span
                  className={
                    checked
                      ? "flex-1 line-through text-muted-foreground transition-colors"
                      : "flex-1 transition-colors"
                  }
                >
                  {ex.name}
                </span>

                {"reps" in ex && ex.reps && (
                  <Badge variant="outline" className="ml-auto shrink-0">
                    {ex.reps} reps
                  </Badge>
                )}
              </label>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
