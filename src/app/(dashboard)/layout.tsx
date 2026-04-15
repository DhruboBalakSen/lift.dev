"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Footer } from "@/components/footer";
import { CompletionProvider } from "@/hooks/use-completions";
import { DayProvider, useSelectedDay } from "@/hooks/use-selected-day";
import { SkipProvider } from "@/hooks/use-skips";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedDay } = useSelectedDay();

  const pageTitle =
    pathname === "/analytics"
      ? "📊 Analytics"
      : `💪 ${selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}'s Workout`;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2" />
          <h1 className="text-sm font-medium">{pageTitle}</h1>
        </header>

        <div className="flex flex-1 flex-col">
          <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
            {children}
          </div>
          <div className="mt-auto">
            <Footer />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DayProvider>
      <CompletionProvider>
        <SkipProvider>
          <DashboardShell>{children}</DashboardShell>
        </SkipProvider>
      </CompletionProvider>
    </DayProvider>
  );
}
