import { motion } from "framer-motion";

interface TypingIndicatorProps {
  supplierName: string;
  supplierLogo: string;
}

export function TypingIndicator({ supplierName, supplierLogo }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-2 justify-start"
    >
      <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-xs font-bold text-primary-foreground">
          {supplierLogo}
        </span>
      </div>

      <div className="max-w-[70%] space-y-1">
        <div className="rounded-2xl px-4 py-3 bg-muted rounded-bl-md">
          <div className="flex items-center gap-1">
            <motion.div
              className="h-2 w-2 rounded-full bg-muted-foreground/60"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0,
              }}
            />
            <motion.div
              className="h-2 w-2 rounded-full bg-muted-foreground/60"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0.2,
              }}
            />
            <motion.div
              className="h-2 w-2 rounded-full bg-muted-foreground/60"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0.4,
              }}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {supplierName} is typing...
        </p>
      </div>
    </motion.div>
  );
}
