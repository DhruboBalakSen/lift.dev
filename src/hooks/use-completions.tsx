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

// Shape: { "2026-04-15": { "monday": { "warmup-0": true, "workout-2": true } } }
export type CompletionStore = Record<
  string,
  Record<string, Record<string, boolean>>
>;

function getDateKey(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

async function fetchStore(): Promise<CompletionStore> {
  try {
    const res = await fetch("/api/completions");
    if (!res.ok) throw new Error("Failed to fetch completions");
    return await res.json();
  } catch (err) {
    console.error("Failed to load completions:", err);
    return {};
  }
}

async function postToggle(
  date: string,
  day: string,
  exerciseKey: string,
  completed: boolean
) {
  try {
    await fetch("/api/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, day, exerciseKey, completed }),
    });
  } catch (err) {
    console.error("Failed to save completion:", err);
  }
}

interface CompletionContextValue {
  store: CompletionStore;
  mounted: boolean;
  toggle: (day: DayKey, exerciseKey: string) => void;
  isCompleted: (day: DayKey, exerciseKey: string) => boolean;
  getDayCompletions: (dateKey: string, day: DayKey) => Record<string, boolean>;
  getCompletedCount: (dateKey: string, day: DayKey) => number;
  getAllDateKeys: () => string[];
  getDateKey: () => string;
}

const CompletionContext = createContext<CompletionContextValue | null>(null);

export function CompletionProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<CompletionStore>({});
  const [mounted, setMounted] = useState(false);

  // Load from MongoDB on mount
  useEffect(() => {
    fetchStore().then((data) => {
      setStore(data);
      setMounted(true);
    });
  }, []);

  const toggle = useCallback((day: DayKey, exerciseKey: string) => {
    setStore((prev) => {
      const dateKey = getDateKey();
      const dayData = prev[dateKey]?.[day] ?? {};
      const newCompleted = !dayData[exerciseKey];

      // Fire-and-forget POST to MongoDB
      postToggle(dateKey, day, exerciseKey, newCompleted);

      return {
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [day]: {
            ...dayData,
            [exerciseKey]: newCompleted,
          },
        },
      };
    });
  }, []);

  const isCompleted = useCallback(
    (day: DayKey, exerciseKey: string): boolean => {
      if (!mounted) return false;
      const dateKey = getDateKey();
      return !!store[dateKey]?.[day]?.[exerciseKey];
    },
    [store, mounted]
  );

  const getDayCompletions = useCallback(
    (dateKey: string, day: DayKey): Record<string, boolean> => {
      return store[dateKey]?.[day] ?? {};
    },
    [store]
  );

  const getCompletedCount = useCallback(
    (dateKey: string, day: DayKey): number => {
      const dayData = store[dateKey]?.[day] ?? {};
      return Object.values(dayData).filter(Boolean).length;
    },
    [store]
  );

  const getAllDateKeys = useCallback((): string[] => {
    return Object.keys(store).sort();
  }, [store]);

  return (
    <CompletionContext.Provider
      value={{
        store,
        mounted,
        toggle,
        isCompleted,
        getDayCompletions,
        getCompletedCount,
        getAllDateKeys,
        getDateKey,
      }}
    >
      {children}
    </CompletionContext.Provider>
  );
}

export function useCompletions(): CompletionContextValue {
  const ctx = useContext(CompletionContext);
  if (!ctx)
    throw new Error("useCompletions must be used within CompletionProvider");
  return ctx;
}
