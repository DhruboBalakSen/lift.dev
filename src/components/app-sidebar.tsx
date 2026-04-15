"use client";

import { workoutPlan } from "@/lib/workout-plan";
import { CalendarDays, Dumbbell, Flame } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const ALL_DAYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_MAP: readonly DayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function getTodayKey(): DayKey {
  return DAY_MAP[new Date().getDay()];
}

interface AppSidebarProps {
  selectedDay: DayKey;
  onSelectDay: (day: DayKey) => void;
}

export function AppSidebar({ selectedDay, onSelectDay }: AppSidebarProps) {
  const todayKey = getTodayKey();

  return (
    <Sidebar>
      {/* Sidebar Header — branding */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex items-center justify-center rounded-lg bg-primary p-1.5">
            <Dumbbell className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight">LiftDev</span>
            <span className="text-[11px] text-muted-foreground leading-tight">
              {workoutPlan.title}
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar Content — day navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Schedule</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ALL_DAYS.map((day) => {
                const isToday = day === todayKey;
                const isSelected = day === selectedDay;

                return (
                  <SidebarMenuItem key={day}>
                    <SidebarMenuButton
                      isActive={isSelected}
                      tooltip={day.charAt(0).toUpperCase() + day.slice(1)}
                      onClick={() => onSelectDay(day)}
                    >
                      {isToday ? (
                        <Flame className="text-orange-500" />
                      ) : (
                        <CalendarDays />
                      )}
                      <span className="capitalize">{day}</span>
                    </SidebarMenuButton>
                    {isToday && (
                      <SidebarMenuBadge>
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground leading-none">
                          Today
                        </span>
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer — theme toggle */}
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs text-muted-foreground">Appearance</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
