import { useState } from "react";
import { ThumbsUp, ThumbsDown, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface RecommendationFeedbackProps {
  feature: "pricing" | "content" | "competitor" | "report";
  recommendationId: string;
  className?: string;
}

export function RecommendationFeedback({ feature, recommendationId, className }: RecommendationFeedbackProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [thumbs, setThumbs] = useState<"up" | "down" | null>(null);
  const [rating, setRating] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [applied, setApplied] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const submitFeedback = async (quickThumbs?: "up" | "down") => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Sign in required", description: "Please sign in to provide feedback.", variant: "destructive" });
        return;
      }

      const actionTaken = applied ? "applied" : (quickThumbs || thumbs) === "up" ? "applied" : "dismissed";
      const finalRating = rating || ((quickThumbs || thumbs) === "up" ? 4 : 2);

      const { error } = await supabase
        .from("ai_feedback")
        .insert({
          user_id: user.id,
          feature,
          recommendation_id: recommendationId,
          action_taken: actionTaken,
          rating: finalRating,
          notes: notes || null,
        } as any);

      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Thanks!", description: "Your feedback helps improve recommendations." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <p className={cn("text-xs text-muted-foreground mt-2 flex items-center gap-1", className)}>
        <ThumbsUp className="h-3 w-3" /> Feedback recorded
      </p>
    );
  }

  return (
    <div className={cn("mt-2", className)}>
      {!showDetails ? (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="sm"
            className={cn("h-7 px-2", thumbs === "up" && "text-primary")}
            onClick={() => { setThumbs("up"); submitFeedback("up"); }}
            disabled={saving}
          >
            <ThumbsUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost" size="sm"
            className={cn("h-7 px-2", thumbs === "down" && "text-destructive")}
            onClick={() => { setThumbs("down"); setShowDetails(true); }}
            disabled={saving}
          >
            <ThumbsDown className="h-3 w-3" />
          </Button>
          <button
            className="text-xs text-muted-foreground hover:text-foreground ml-1"
            onClick={() => setShowDetails(true)}
          >
            More feedback
          </button>
        </div>
      ) : (
        <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)}>
                <Star className={cn("h-4 w-4", star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={applied} onChange={(e) => setApplied(e.target.checked)} className="rounded" />
            I applied this recommendation
          </label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes? (optional)" rows={2} className="text-sm" />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => submitFeedback()} disabled={saving}>
              {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
              Submit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowDetails(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
