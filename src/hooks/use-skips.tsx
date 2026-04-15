"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { DayKey } from "@/lib/types";

export type SkipInfo = {
  rescheduledToDay: DayKey | null;
  rescheduledToDate: string | null;
};

// Shape: { "2026-04-15": { "monday": { rescheduledToDay, rescheduledToDate } } }
export type SkipStore = Record<string, Record<string, SkipInfo>>;

function getDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

async function fetchSkips(): Promise<SkipStore> {
  try {
    const res = await fetch("/api/skips");
    if (!res.ok) throw new Error("Failed to fetch skips");
    return await res.json();
  } catch (err) {
    console.error("Failed to load skips:", err);
    return {};
  }
}

interface SkipContextValue {
  store: SkipStore;
  mounted: boolean;
  skipDay: (
    day: DayKey,
    rescheduledToDay?: DayKey | null,
    rescheduledToDate?: string | null
  ) => void;
  undoSkip: (day: DayKey) => void;
  isSkipped: (day: DayKey) => boolean;
  getSkipInfo: (day: DayKey) => SkipInfo | null;
  getRescheduledWorkouts: (
    targetDay: DayKey
  ) => { fromDay: DayKey; fromDate: string }[];
}

const SkipContext = createContext<SkipContextValue | null>(null);

export function SkipProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<SkipStore>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchSkips().then((data) => {
      setStore(data);
      setMounted(true);
    });
  }, []);

  const skipDay = useCallback(
    (
      day: DayKey,
      rescheduledToDay?: DayKey | null,
      rescheduledToDate?: string | null
    ) => {
      const dateKey = getDateKey();

      // Optimistic update
      setStore((prev) => ({
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [day]: {
            rescheduledToDay: rescheduledToDay ?? null,
            rescheduledToDate: rescheduledToDate ?? null,
          },
        },
      }));

      // Persist
      fetch("/api/skips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateKey,
          day,
          rescheduledToDay,
          rescheduledToDate,
        }),
      }).catch(console.error);
    },
    []
  );

  const undoSkip = useCallback((day: DayKey) => {
    const dateKey = getDateKey();

    // Optimistic update
    setStore((prev) => {
      const updated = { ...prev };
      if (updated[dateKey]) {
        const { [day]: _, ...rest } = updated[dateKey];
        updated[dateKey] = rest;
      }
      return updated;
    });

    // Persist
    fetch(`/api/skips?date=${dateKey}&day=${day}`, {
      method: "DELETE",
    }).catch(console.error);
  }, []);

  const isSkipped = useCallback(
    (day: DayKey): boolean => {
      if (!mounted) return false;
      const dateKey = getDateKey();
      return !!store[dateKey]?.[day];
    },
    [store, mounted]
  );

  const getSkipInfo = useCallback(
    (day: DayKey): SkipInfo | null => {
      if (!mounted) return null;
      const dateKey = getDateKey();
      return store[dateKey]?.[day] ?? null;
    },
    [store, mounted]
  );

  // Find workouts rescheduled TO a specific day (for today's date)
  const getRescheduledWorkouts = useCallback(
    (targetDay: DayKey): { fromDay: DayKey; fromDate: string }[] => {
      if (!mounted) return [];
      const results: { fromDay: DayKey; fromDate: string }[] = [];
      const todayDate = getDateKey();

      // Check all dates in the store
      for (const [date, daySkips] of Object.entries(store)) {
        for (const [skippedDay, info] of Object.entries(daySkips)) {
          if (
            info.rescheduledToDay === targetDay &&
            info.rescheduledToDate === todayDate
          ) {
            results.push({
              fromDay: skippedDay as DayKey,
              fromDate: date,
            });
          }
        }
      }
      return results;
    },
    [store, mounted]
  );

  return (
    <SkipContext.Provider
      value={{
        store,
        mounted,
        skipDay,
        undoSkip,
        isSkipped,
        getSkipInfo,
        getRescheduledWorkouts,
      }}
    >
      {children}
    </SkipContext.Provider>
  );
}

export function useSkips(): SkipContextValue {
  const ctx = useContext(SkipContext);
  if (!ctx) throw new Error("useSkips must be used within SkipProvider");
  return ctx;
}
