import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { level: "weak", label: "Weak", color: "bg-destructive" };
    if (score <= 4) return { level: "medium", label: "Medium", color: "bg-warning" };
    return { level: "strong", label: "Strong", color: "bg-success" };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              bar === 1 && password.length > 0 && strength.color,
              bar === 2 && (strength.level === "medium" || strength.level === "strong") && strength.color,
              bar === 3 && strength.level === "strong" && strength.color,
              "bg-muted"
            )}
          />
        ))}
      </div>
      <p className={cn(
        "text-xs",
        strength.level === "weak" && "text-destructive",
        strength.level === "medium" && "text-warning",
        strength.level === "strong" && "text-success"
      )}>
        Password strength: {strength.label}
      </p>
    </div>
  );
}
