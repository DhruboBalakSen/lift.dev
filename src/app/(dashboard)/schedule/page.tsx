"use client";

import { useState } from "react";
import { workoutPlan } from "@/lib/workout-plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompletions } from "@/hooks/use-completions";
import { useSelectedDay } from "@/hooks/use-selected-day";
import { useSkips } from "@/hooks/use-skips";
import { ALL_DAYS, type DayKey } from "@/lib/types";
import { SkipForward, Undo2, ArrowRight, CalendarClock } from "lucide-react";

export default function SchedulePage() {
  const { selectedDay } = useSelectedDay();
  const completions = useCompletions();
  const skips = useSkips();

  const isSkipped = skips.isSkipped(selectedDay);
  const skipInfo = skips.getSkipInfo(selectedDay);
  const rescheduledWorkouts = skips.getRescheduledWorkouts(selectedDay);
  const todayWorkout = workoutPlan.days[selectedDay];

  return (
    <>
      {/* Skipped banner */}
      {isSkipped && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <SkipForward className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-sm">
                  This day&apos;s workout was skipped
                </p>
                {skipInfo?.rescheduledToDay && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <ArrowRight className="h-3 w-3" />
                    Rescheduled to{" "}
                    <span className="capitalize font-medium">
                      {skipInfo.rescheduledToDay}
                    </span>
                    {skipInfo.rescheduledToDate && (
                      <span>({skipInfo.rescheduledToDate})</span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => skips.undoSkip(selectedDay)}
            >
              <Undo2 className="h-4 w-4 mr-1" />
              Undo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Rescheduled workouts from other days */}
      {rescheduledWorkouts.length > 0 && (
        <>
          {rescheduledWorkouts.map(({ fromDay }) => {
            const exercises = workoutPlan.days[fromDay] ?? [];
            return (
              <Card
                key={fromDay}
                className="border-blue-500/50 bg-blue-500/5"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarClock className="h-5 w-5 text-blue-500" />
                    <span>
                      Rescheduled from{" "}
                      <span className="capitalize">{fromDay}</span>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {exercises.map((ex, i) => {
                    const key = `rescheduled-${fromDay}-workout-${i}`;
                    const checked = completions.isCompleted(selectedDay, key);
                    return (
                      <label
                        key={i}
                        className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50 cursor-pointer"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            completions.toggle(selectedDay, key)
                          }
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
                          <Badge
                            variant="outline"
                            className="ml-auto shrink-0"
                          >
                            {ex.reps} reps
                          </Badge>
                        )}
                      </label>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </>
      )}

      {/* Warmup */}
      {!isSkipped && (
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
                    onCheckedChange={() =>
                      completions.toggle(selectedDay, key)
                    }
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
                  {"sets" in item && item.sets && "reps" in item && item.reps && (
                    <Badge variant="outline" className="ml-auto shrink-0">
                      {item.sets}×{item.reps}
                    </Badge>
                  )}
                </label>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Workout */}
      {!isSkipped && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              🏋️ <span className="capitalize">{selectedDay}</span>
            </CardTitle>
            <SkipDayDialog day={selectedDay} onSkip={skips.skipDay} />
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
                    onCheckedChange={() =>
                      completions.toggle(selectedDay, key)
                    }
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
                      {ex.sets && `${ex.sets}×`}
                      {ex.reps}
                    </Badge>
                  )}
                </label>
              );
            })}
          </CardContent>
        </Card>
      )}
    </>
  );
}

// --- Skip Day Dialog ---

function SkipDayDialog({
  day,
  onSkip,
}: {
  day: DayKey;
  onSkip: (
    day: DayKey,
    rescheduledToDay?: DayKey | null,
    rescheduledToDate?: string | null
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rescheduleDay, setRescheduleDay] = useState<string>("");
  const [rescheduleDate, setRescheduleDate] = useState<string>("");

  const availableDays = ALL_DAYS.filter((d) => d !== day);

  // Calculate a suggested date for the selected reschedule day
  const getSuggestedDate = (targetDay: DayKey): string => {
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
    const todayIndex = today.getDay();
    const targetIndex = dayNames.indexOf(targetDay);
    let daysAhead = targetIndex - todayIndex;
    if (daysAhead <= 0) daysAhead += 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysAhead);
    return targetDate.toISOString().slice(0, 10);
  };

  const handleDayChange = (value: string) => {
    setRescheduleDay(value);
    if (value && value !== "none") {
      setRescheduleDate(getSuggestedDate(value as DayKey));
    } else {
      setRescheduleDate("");
    }
  };

  const handleConfirm = () => {
    const targetDay =
      rescheduleDay && rescheduleDay !== "none"
        ? (rescheduleDay as DayKey)
        : null;
    const targetDate = targetDay && rescheduleDate ? rescheduleDate : null;
    onSkip(day, targetDay, targetDate);
    setOpen(false);
    setRescheduleDay("");
    setRescheduleDate("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SkipForward className="h-4 w-4 mr-1" />
          Skip Day
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Skip <span className="capitalize">{day}</span>&apos;s Workout?
          </DialogTitle>
          <DialogDescription>
            Mark this day as skipped. You can optionally reschedule the workout
            to another day.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Reschedule to</label>
            <Select value={rescheduleDay} onValueChange={handleDayChange}>
              <SelectTrigger>
                <SelectValue placeholder="Don't reschedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Don&apos;t reschedule</SelectItem>
                {availableDays.map((d) => (
                  <SelectItem key={d} value={d}>
                    <span className="capitalize">{d}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {rescheduleDay && rescheduleDay !== "none" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Reschedule date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            {rescheduleDay && rescheduleDay !== "none" ? (
              <>
                <ArrowRight className="h-4 w-4 mr-1" />
                Skip & Reschedule
              </>
            ) : (
              <>
                <SkipForward className="h-4 w-4 mr-1" />
                Skip Day
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
