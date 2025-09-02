
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
        src="https://github.com/faskey37/My-Portfolio/blob/main/WhatsApp_Image_2025-08-31_at_10.41.40_cab56ce6-removebg-preview.png?raw=true"
        alt="EcoVest Logo"
        width={36}
        height={36}
        className="h-9 w-9 object-contain rounded-full"
      />
      <span className={cn(
          "text-xl font-semibold text-white", 
          isCollapsed && "sr-only"
        )}>
          EcoVest
      </span>
    </div>
  );
}
