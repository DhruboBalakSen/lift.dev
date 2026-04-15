"use client";

import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { useCompletions } from "@/hooks/use-completions";
import { useSkips } from "@/hooks/use-skips";

export default function AnalyticsPage() {
  const { store, mounted } = useCompletions();
  const { store: skipStore } = useSkips();

  return (
    <AnalyticsDashboard store={store} skipStore={skipStore} mounted={mounted} />
  );
}
