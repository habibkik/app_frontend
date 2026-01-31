import { useState } from "react";
import { format, addDays, addHours, setHours, setMinutes } from "date-fns";
import { Calendar as CalendarIcon, Clock, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PostSchedulerProps {
  scheduleType: "now" | "scheduled";
  scheduledDate: Date | undefined;
  scheduledTime: string;
  onScheduleTypeChange: (type: "now" | "scheduled") => void;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
}

const timeSlots = Array.from({ length: 24 * 4 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
});

const quickScheduleOptions = [
  { label: "In 1 hour", getValue: () => addHours(new Date(), 1) },
  { label: "In 3 hours", getValue: () => addHours(new Date(), 3) },
  { label: "Tomorrow 9 AM", getValue: () => setMinutes(setHours(addDays(new Date(), 1), 9), 0) },
  { label: "Tomorrow 6 PM", getValue: () => setMinutes(setHours(addDays(new Date(), 1), 18), 0) },
];

export function PostScheduler({
  scheduleType,
  scheduledDate,
  scheduledTime,
  onScheduleTypeChange,
  onDateChange,
  onTimeChange,
}: PostSchedulerProps) {
  const handleQuickSchedule = (date: Date) => {
    onScheduleTypeChange("scheduled");
    onDateChange(date);
    onTimeChange(format(date, "HH:mm"));
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">When to post</h3>

      <RadioGroup
        value={scheduleType}
        onValueChange={(value) => onScheduleTypeChange(value as "now" | "scheduled")}
        className="grid grid-cols-2 gap-3"
      >
        <Label
          htmlFor="post-now"
          className={cn(
            "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
            scheduleType === "now"
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "hover:border-primary/50"
          )}
        >
          <RadioGroupItem value="now" id="post-now" />
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium">Post Now</span>
          </div>
        </Label>

        <Label
          htmlFor="post-scheduled"
          className={cn(
            "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
            scheduleType === "scheduled"
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "hover:border-primary/50"
          )}
        >
          <RadioGroupItem value="scheduled" id="post-scheduled" />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium">Schedule</span>
          </div>
        </Label>
      </RadioGroup>

      {scheduleType === "scheduled" && (
        <div className="space-y-4 pt-2">
          {/* Quick schedule buttons */}
          <div className="flex flex-wrap gap-2">
            {quickScheduleOptions.map((option) => (
              <Button
                key={option.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSchedule(option.getValue())}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Date and time pickers */}
          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={onDateChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select value={scheduledTime} onValueChange={onTimeChange}>
              <SelectTrigger className="w-[130px]">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {scheduledDate && scheduledTime && (
            <p className="text-sm text-muted-foreground">
              Your post will be published on{" "}
              <span className="font-medium text-foreground">
                {format(scheduledDate, "EEEE, MMMM d, yyyy")} at {scheduledTime}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
