import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Pencil, X } from "lucide-react";

const CHANNEL_MAX_LENGTH: Record<string, number> = {
  email: 2000,
  linkedin: 500,
  whatsapp: 500,
  sms: 160,
  phone_call: 1000,
  facebook: 500,
  instagram: 500,
  tiktok: 300,
  twitter: 280,
};

interface ChannelMessageEditorProps {
  channel: string;
  message: string;
  subject?: string | null;
  onSave: (message: string, subject?: string) => void;
}

export function ChannelMessageEditor({ channel, message, subject, onSave }: ChannelMessageEditorProps) {
  const [editing, setEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(message);
  const [editSubject, setEditSubject] = useState(subject || "");
  const maxLen = CHANNEL_MAX_LENGTH[channel] || 500;

  const handleSave = () => {
    onSave(editMessage, channel === "email" ? editSubject : undefined);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditMessage(message);
    setEditSubject(subject || "");
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="group relative">
        {channel === "email" && subject && (
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Subject: {subject}
          </p>
        )}
        <p className="text-sm text-foreground whitespace-pre-wrap">{message}</p>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {channel === "email" && (
        <Input
          value={editSubject}
          onChange={(e) => setEditSubject(e.target.value)}
          placeholder="Email subject..."
          className="text-sm"
        />
      )}
      <Textarea
        value={editMessage}
        onChange={(e) => setEditMessage(e.target.value)}
        rows={4}
        maxLength={maxLen}
        className="text-sm"
      />
      <div className="flex items-center justify-between">
        <Badge variant={editMessage.length > maxLen ? "destructive" : "secondary"} className="text-xs">
          {editMessage.length}/{maxLen}
        </Badge>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancel}>
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button variant="default" size="icon" className="h-7 w-7" onClick={handleSave}>
            <Check className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
