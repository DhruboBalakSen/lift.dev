"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { getTodayKey, type DayKey } from "@/lib/types";

interface DayContextValue {
  selectedDay: DayKey;
  setSelectedDay: (day: DayKey) => void;
}

const DayContext = createContext<DayContextValue | null>(null);

export function DayProvider({ children }: { children: ReactNode }) {
  const [selectedDay, setSelectedDay] = useState<DayKey>(getTodayKey());
  return (
    <DayContext.Provider value={{ selectedDay, setSelectedDay }}>
      {children}
    </DayContext.Provider>
  );
}

export function useSelectedDay(): DayContextValue {
  const ctx = useContext(DayContext);
  if (!ctx) throw new Error("useSelectedDay must be used within DayProvider");
  return ctx;
}
