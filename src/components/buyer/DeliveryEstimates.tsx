/**
 * Delivery Estimates Component
 * Shows shipping cost estimates for suppliers
 */
import { motion } from "framer-motion";
import { 
  Truck, 
  Clock, 
  Package,
  Plane,
  Ship,
  MapPin,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DeliveryEstimate, SupplierMatch } from "@/stores/analysisStore";

interface DeliveryEstimatesProps {
  supplier: SupplierMatch;
}

const methodIcons: Record<string, React.ReactNode> = {
  "Air Freight": <Plane className="h-4 w-4" />,
  "Sea Freight": <Ship className="h-4 w-4" />,
  "Express": <Truck className="h-4 w-4" />,
  "Standard": <Package className="h-4 w-4" />,
};

export function DeliveryEstimates({ supplier }: DeliveryEstimatesProps) {
  const estimates = supplier.deliveryEstimates;

  if (!estimates || estimates.length === 0) {
    return (
      <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <Truck className="h-4 w-4 inline mr-2" />
        Delivery estimates not available for this supplier
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Truck className="h-3.5 w-3.5" />
        Estimated Delivery Costs from {supplier.location}
      </p>
      
      <div className="grid gap-2">
        {estimates.map((estimate, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg",
              "bg-muted/50 hover:bg-muted transition-colors"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {methodIcons[estimate.method] || <Package className="h-4 w-4" />}
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{estimate.method}</p>
                {estimate.carrier && (
                  <p className="text-xs text-muted-foreground">{estimate.carrier}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{estimate.days}</span>
              </div>
              <Badge variant="secondary" className="font-semibold">
                ${estimate.cost}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Inline delivery summary for supplier cards
export function DeliverySummary({ estimates }: { estimates?: DeliveryEstimate[] }) {
  if (!estimates || estimates.length === 0) return null;

  const fastest = estimates.reduce((min, est) => 
    !min || parseInt(est.days) < parseInt(min.days) ? est : min
  , estimates[0]);

  const cheapest = estimates.reduce((min, est) => 
    !min || est.cost < min.cost ? est : min
  , estimates[0]);

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <Badge variant="outline" className="text-xs">
        <Truck className="h-3 w-3 mr-1" />
        From ${cheapest.cost}
      </Badge>
      <Badge variant="outline" className="text-xs">
        <Clock className="h-3 w-3 mr-1" />
        {fastest.days} fastest
      </Badge>
    </div>
  );
}
