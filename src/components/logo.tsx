
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
    className?: string;
    isCollapsed?: boolean;
}

export default function Logo({ className, isCollapsed = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="https://raw.githubusercontent.com/faskey37/My-Portfolio/main/logo.png"
        alt="EcoVest Logo"
        width={36}
        height={36}
        className="h-9 w-9 object-contain"
      />
      <span className={cn(
          "text-xl font-semibold text-card-foreground", 
          isCollapsed && "sr-only"
        )}>
          EcoVest
      </span>
    </div>
  );
}
