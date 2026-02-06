import { motion } from "framer-motion";
import { X, Star, Clock, MapPin, CheckCircle, MessageSquare, Bookmark } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BOMComponent } from "@/data/bom";
import { mockSuppliers, Supplier } from "@/data/suppliers";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface BOMSupplierMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  component: BOMComponent | null;
}

export function BOMSupplierMatchModal({
  open,
  onOpenChange,
  component,
}: BOMSupplierMatchModalProps) {
  if (!component) return null;

  const matchedSuppliers = mockSuppliers
    .slice(0, Math.min(component.matchedSuppliers, mockSuppliers.length))
    .map((supplier) => ({
      ...supplier,
      matchScore: Math.floor(Math.random() * 20) + 80,
      estimatedPrice: component.unitCost * (0.85 + Math.random() * 0.3),
      leadTime: `${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 2) + 3} weeks`,
    }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Matched Suppliers for</span>
            <Badge variant="secondary">{component.name}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {matchedSuppliers.map((supplier, index) => (
            <SupplierMatchCard
              key={supplier.id}
              supplier={supplier}
              index={index}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SupplierMatchCardProps {
  supplier: Supplier & {
    matchScore: number;
    estimatedPrice: number;
    leadTime: string;
  };
  index: number;
}

function SupplierMatchCard({ supplier, index }: SupplierMatchCardProps) {
  const fc = useFormatCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {supplier.logo}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{supplier.name}</h4>
                {supplier.verified && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {supplier.location.city}, {supplier.location.country}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  {supplier.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {supplier.responseTime}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className={cn(
                "text-lg font-bold",
                supplier.matchScore >= 90 ? "text-primary" :
                supplier.matchScore >= 80 ? "text-foreground" : "text-muted-foreground"
              )}>
                {supplier.matchScore}%
              </div>
              <p className="text-xs text-muted-foreground">Match</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {supplier.certifications.slice(0, 3).map((cert) => (
              <Badge key={cert} variant="outline" className="text-xs">
                {cert}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-6 mt-3 pt-3 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Est. Price</p>
              <p className="font-semibold">{fc(supplier.estimatedPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lead Time</p>
              <p className="font-medium">{supplier.leadTime}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">MOQ</p>
              <p className="font-medium">{fc(supplier.minOrderValue)}</p>
            </div>

            <div className="flex-1 flex justify-end gap-2">
              <Button variant="outline" size="sm">
                <Bookmark className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
              <Button size="sm">
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
