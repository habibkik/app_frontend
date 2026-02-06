import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, MapPin, CheckCircle, Package, AlertCircle, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ComponentPart, SupplierQuote } from "@/data/components";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface SupplierQuoteListProps {
  component: ComponentPart;
  quotes: SupplierQuote[];
  selectedQuoteId: string | null;
  onSelectQuote: (quoteId: string) => void;
  onSupplierClick?: (quote: SupplierQuote) => void;
  isExpanded: boolean;
}

export function SupplierQuoteList({
  component,
  quotes,
  selectedQuoteId,
  onSelectQuote,
  onSupplierClick,
  isExpanded,
}: SupplierQuoteListProps) {
  const fc = useFormatCurrency();
  const lowestPrice = Math.min(...quotes.map((q) => q.unitPrice));

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="pt-2 space-y-2">
            {quotes.map((quote, index) => {
              const isSelected = quote.id === selectedQuoteId;
              const isLowest = quote.unitPrice === lowestPrice;
              const totalCost = quote.unitPrice * component.requiredQuantity;

              return (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-lg border transition-all cursor-pointer group",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                  onClick={() => onSelectQuote(quote.id)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        className={cn(
                          "font-semibold text-sm",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}
                      >
                        {quote.supplierLogo}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSupplierClick?.(quote);
                              }}
                              className="font-medium text-foreground hover:text-primary hover:underline flex items-center gap-1 transition-colors"
                            >
                              {quote.supplierName}
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            {isLowest && (
                              <Badge variant="default" className="text-xs">
                                Lowest
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {quote.supplierLocation}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 text-primary" />
                              {quote.rating}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-foreground">
                            {fc(quote.unitPrice)}
                          </p>
                          <p className="text-xs text-muted-foreground">per unit</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {quote.certifications.map((cert) => (
                          <Badge key={cert} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-6 mt-3 pt-3 border-t">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{quote.leadTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">MOQ: {quote.moq.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {quote.inStock ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-primary" />
                              <span className="text-sm text-primary">
                                In Stock ({quote.stockQuantity?.toLocaleString()})
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Made to Order</span>
                            </>
                          )}
                        </div>

                        <div className="flex-1 text-right">
                          <span className="text-sm text-muted-foreground">Total: </span>
                          <span className="font-semibold">{fc(totalCost)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div
                        className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {isSelected && (
                          <CheckCircle className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
