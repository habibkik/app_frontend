import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Image, 
  Video, 
  Link2, 
  Smile, 
  Hash,
  AtSign,
  MapPin,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AISuggestionsPanel } from "./AISuggestionsPanel";

interface PostComposerProps {
  content: string;
  onContentChange: (content: string) => void;
  maxLength?: number;
  placeholder?: string;
  selectedPlatforms?: string[];
}

export function PostComposer({ 
  content, 
  onContentChange, 
  maxLength = 280,
  placeholder = "What's on your mind? Write your post here...",
  selectedPlatforms = [],
}: PostComposerProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  
  const characterCount = content.length;
  const isOverLimit = characterCount > maxLength;
  const percentage = Math.min((characterCount / maxLength) * 100, 100);

  const commonEmojis = ["😀", "🎉", "🔥", "💡", "🚀", "❤️", "👍", "✨", "💪", "🙌", "📣", "🎯"];

  const insertEmoji = (emoji: string) => {
    onContentChange(content + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[150px] resize-none text-base"
        />
        
        {/* Character count indicator */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <div className="relative h-5 w-5">
            <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted"
              />
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${percentage * 0.5} 50`}
                className={cn(
                  "transition-all",
                  isOverLimit ? "text-destructive" : percentage > 80 ? "text-warning" : "text-primary"
                )}
              />
            </svg>
          </div>
          <span className={cn(
            "text-xs font-medium",
            isOverLimit ? "text-destructive" : "text-muted-foreground"
          )}>
            {characterCount}/{maxLength}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-1">
          <Button 
            variant={showAISuggestions ? "secondary" : "ghost"} 
            size="icon" 
            className="h-9 w-9" 
            title="AI Suggestions"
            onClick={() => setShowAISuggestions(!showAISuggestions)}
          >
            <Sparkles className={cn("h-4 w-4", showAISuggestions && "text-primary")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Add image">
            <Image className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Add video">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Add link">
            <Link2 className="h-4 w-4" />
          </Button>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9" 
              title="Add emoji"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-4 w-4" />
            </Button>
            
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-0 mb-2 p-2 bg-popover border rounded-lg shadow-lg z-10"
              >
                <div className="flex gap-1 flex-wrap max-w-[200px]">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="p-1.5 hover:bg-muted rounded text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Add hashtag">
            <Hash className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Mention">
            <AtSign className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Add location">
            <MapPin className="h-4 w-4" />
          </Button>
        </div>

        {content.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onContentChange("")}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* AI Suggestions Panel */}
      {showAISuggestions && (
        <AISuggestionsPanel
          selectedPlatforms={selectedPlatforms}
          onSelectCaption={onContentChange}
        />
      )}
    </div>
  );
}
