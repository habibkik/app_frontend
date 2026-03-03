import { useState } from "react";
import { Send, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Comment {
  id: string;
  author: string;
  initials: string;
  content: string;
  timestamp: string;
  type: "comment" | "activity";
}

const MOCK_COMMENTS: Comment[] = [
  { id: "1", author: "Sarah Chen", initials: "SC", content: "I've reviewed the supplier quotes. Shanghai Steel looks most competitive on price, but Bavaria Machinery has better quality certs.", timestamp: "2h ago", type: "comment" },
  { id: "2", author: "System", initials: "SY", content: "RFQ status changed from Draft to Pending", timestamp: "3h ago", type: "activity" },
  { id: "3", author: "James Wilson", initials: "JW", content: "Agreed on Bavaria. Let's also check their lead time — we need delivery by Q2.", timestamp: "5h ago", type: "comment" },
  { id: "4", author: "System", initials: "SY", content: "Quote received from Istanbul Ceramics ($4.20/unit)", timestamp: "1d ago", type: "activity" },
  { id: "5", author: "Maria Garcia", initials: "MG", content: "Can we add a clarification about packaging requirements? The spec sheet doesn't mention anti-static bags.", timestamp: "1d ago", type: "comment" },
];

interface RFQTeamCommentsProps {
  rfqId?: string;
}

export function RFQTeamComments({ rfqId }: RFQTeamCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [filter, setFilter] = useState<"all" | "comments" | "activity">("all");

  const filtered = filter === "all" ? comments : comments.filter((c) => c.type === filter);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `c-${Date.now()}`, author: "You", initials: "YO",
      content: newComment, timestamp: "Just now", type: "comment",
    };
    setComments([comment, ...comments]);
    setNewComment("");
  };

  return (
    <div className="space-y-4">
      {/* Compose */}
      <div className="space-y-2">
        <Textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={3} />
        <div className="flex justify-between items-center">
          <div className="flex gap-1.5">
            {(["all", "comments", "activity"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" className="text-xs h-7"
                onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</Button>
            ))}
          </div>
          <Button size="sm" onClick={handleSubmit} disabled={!newComment.trim()} className="gap-1">
            <Send className="h-3.5 w-3.5" /> Post
          </Button>
        </div>
      </div>

      {/* Thread */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {filtered.map((c) => (
          <div key={c.id} className={`flex gap-3 ${c.type === "activity" ? "opacity-70" : ""}`}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className={c.type === "activity" ? "bg-muted text-muted-foreground text-xs" : "bg-primary/10 text-primary text-xs"}>
                {c.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{c.author}</span>
                {c.type === "activity" && <Badge variant="outline" className="text-[10px] h-4">Activity</Badge>}
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{c.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
