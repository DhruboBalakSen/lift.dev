"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { workoutPlan } from "@/lib/workout-plan";
import { BarChart3, CalendarDays, Dumbbell, Flame } from "lucide-react";
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useSelectedDay } from "@/hooks/use-selected-day";
import { ALL_DAYS, getTodayKey } from "@/lib/types";

// Re-export for consumers
export { type DayKey, getTodayKey } from "@/lib/types";

export function AppSidebar() {
  const todayKey = getTodayKey();
  const pathname = usePathname();
  const { selectedDay, setSelectedDay } = useSelectedDay();

  return (
    <Sidebar>
      {/* Sidebar Header — branding */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex items-center justify-center rounded-lg bg-primary p-1.5">
            <Dumbbell className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight">Lift</span>
            <span className="text-[11px] text-muted-foreground leading-tight">
              {workoutPlan.title}
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        {/* Analytics link */}
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/analytics"}
                  tooltip="Analytics"
                >
                  <Link href="/analytics">
                    <BarChart3 />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Day navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Schedule</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ALL_DAYS.map((day) => {
                const isToday = day === todayKey;
                const isSelected =
                  pathname === "/schedule" && day === selectedDay;

                return (
                  <SidebarMenuItem key={day}>
                    <SidebarMenuButton
                      asChild
                      isActive={isSelected}
                      tooltip={day.charAt(0).toUpperCase() + day.slice(1)}
                    >
                      <Link
                        href="/schedule"
                        onClick={() => setSelectedDay(day)}
                      >
                        {isToday ? (
                          <Flame className="text-orange-500" />
                        ) : (
                          <CalendarDays />
                        )}
                        <span className="capitalize">{day}</span>
                      </Link>
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
