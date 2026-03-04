import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";

interface PlatformCardProps {
  name: string;
  color: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: string;
  listingsCount?: number;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function PlatformCard({ name, color, status, lastSync, listingsCount, onConnect, onDisconnect }: PlatformCardProps) {
  const statusConfig = {
    connected: { icon: Wifi, label: "Connected", variant: "default" as const, dot: "bg-emerald-500" },
    disconnected: { icon: WifiOff, label: "Not Connected", variant: "secondary" as const, dot: "bg-muted-foreground" },
    error: { icon: AlertTriangle, label: "Error", variant: "destructive" as const, dot: "bg-destructive" },
  };

  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md">
      <div className="absolute top-0 left-0 h-1 w-full" style={{ backgroundColor: color }} />
      <CardContent className="pt-5 pb-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: color }}>
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm">{name}</p>
              {listingsCount !== undefined && status === "connected" && (
                <p className="text-xs text-muted-foreground">{listingsCount} listings</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <Badge variant={cfg.variant} className="text-[10px] h-5">
              <StatusIcon className="w-3 h-3 mr-1" />
              {cfg.label}
            </Badge>
          </div>
        </div>

        {lastSync && status === "connected" && (
          <p className="text-[11px] text-muted-foreground">Last sync: {lastSync}</p>
        )}

        <Button
          size="sm"
          variant={status === "connected" ? "outline" : "default"}
          className="w-full text-xs"
          onClick={status === "connected" ? onDisconnect : onConnect}
        >
          {status === "connected" ? "Disconnect" : "Connect"}
        </Button>
      </CardContent>
    </Card>
  );
}
