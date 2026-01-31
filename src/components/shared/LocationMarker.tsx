/**
 * Location Marker Component
 * Custom marker for map entities with hover tooltip
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Factory, Store, Package } from "lucide-react";

import { cn } from "@/lib/utils";

interface LocationMarkerProps {
  type: "supplier" | "competitor" | "producer";
  name: string;
  matchScore?: number;
  demandLevel?: "high" | "medium" | "low";
  onClick?: () => void;
  isSelected?: boolean;
}

const typeIcons = {
  supplier: Package,
  competitor: Store,
  producer: Factory,
};

const typeColors = {
  supplier: "bg-primary text-primary-foreground",
  competitor: "bg-purple-500 text-white",
  producer: "bg-indigo-500 text-white",
};

const demandColors = {
  high: "ring-red-500",
  medium: "ring-amber-500",
  low: "ring-blue-500",
};

export function LocationMarker({
  type,
  name,
  matchScore,
  demandLevel,
  onClick,
  isSelected,
}: LocationMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = typeIcons[type];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative flex items-center justify-center",
          "w-10 h-10 rounded-full shadow-lg",
          "transition-all duration-200",
          typeColors[type],
          isSelected && "ring-4 ring-white",
          demandLevel && `ring-2 ${demandColors[demandLevel]}`
        )}
      >
        <Icon className="h-5 w-5" />
        
        {/* Match score indicator */}
        {matchScore && matchScore >= 90 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">★</span>
          </div>
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
          >
            <div className="bg-popover text-popover-foreground px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap text-sm">
              <p className="font-medium">{name}</p>
              {matchScore && (
                <p className="text-xs text-muted-foreground">{matchScore}% match</p>
              )}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-popover" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
