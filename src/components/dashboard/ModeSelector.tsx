import { ChevronDown, ShoppingCart, Factory, Store } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDashboardMode, DashboardMode } from "@/contexts/DashboardModeContext";
import { modeConfig } from "@/config/navigation";
import { cn } from "@/lib/utils";

const modeIcons: Record<DashboardMode, typeof ShoppingCart> = {
  buyer: ShoppingCart,
  producer: Factory,
  seller: Store,
};

export function ModeSelector() {
  const { mode, setMode } = useDashboardMode();
  const CurrentIcon = modeIcons[mode];
  const currentConfig = modeConfig[mode];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 gap-2 border-border bg-card hover:bg-secondary"
        >
          <CurrentIcon className={cn("h-4 w-4", currentConfig.color)} />
          <span className="hidden sm:inline font-medium">{currentConfig.label}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {(Object.keys(modeConfig) as DashboardMode[]).map((modeKey) => {
          const config = modeConfig[modeKey];
          const Icon = modeIcons[modeKey];
          const isActive = mode === modeKey;

          return (
            <DropdownMenuItem
              key={modeKey}
              onClick={() => setMode(modeKey)}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                isActive && "bg-secondary"
              )}
            >
              <Icon className={cn("h-4 w-4", config.color)} />
              <div className="flex flex-col">
                <span className="font-medium">{config.label}</span>
                <span className="text-xs text-muted-foreground">
                  {config.description}
                </span>
              </div>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
