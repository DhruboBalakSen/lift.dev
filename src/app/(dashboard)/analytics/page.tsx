"use client";

import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { useCompletions } from "@/hooks/use-completions";

export default function AnalyticsPage() {
  const { store, mounted } = useCompletions();

  return <AnalyticsDashboard store={store} mounted={mounted} />;
}
