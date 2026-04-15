import { Dumbbell } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="flex flex-col items-center gap-1 py-4 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center gap-1.5">
          <Dumbbell className="h-3.5 w-3.5" />
          <span>Lift</span>
        </div>
        <p>Stay consistent. Trust the process. 💪</p>
      </div>
    </footer>
  );
}
