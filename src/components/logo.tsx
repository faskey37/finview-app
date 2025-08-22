import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Landmark className="h-6 w-6 text-primary" />
      <span className="text-xl font-semibold text-primary">FinView</span>
    </div>
  );
}
