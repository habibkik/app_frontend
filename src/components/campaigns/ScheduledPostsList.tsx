import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export interface ScheduledPost {
  id: string;
  content: string;
  platforms: { id: string; name: string; icon: string }[];
  scheduledAt: Date;
  status: "scheduled" | "published" | "failed";
  createdAt: Date;
}

interface ScheduledPostsListProps {
  posts: ScheduledPost[];
  onDelete: (postId: string) => void;
  onEdit: (post: ScheduledPost) => void;
  onPublishNow: (postId: string) => void;
}

export function ScheduledPostsList({ 
  posts, 
  onDelete, 
  onEdit, 
  onPublishNow 
}: ScheduledPostsListProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      onDelete(postToDelete);
      toast({
        title: "Post deleted",
        description: "The scheduled post has been removed",
      });
    }
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const getStatusBadge = (status: ScheduledPost["status"]) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-300">
            <Clock className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "published":
        return (
          <Badge variant="outline" className="text-green-600 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Published
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="text-red-600 border-red-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/30">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-medium text-lg mb-1">No scheduled posts</h3>
        <p className="text-sm text-muted-foreground">
          Create your first post to see it here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Content preview */}
                  <p className="text-sm line-clamp-2 mb-2">
                    {post.content}
                  </p>

                  {/* Platforms */}
                  <div className="flex items-center gap-2 mb-2">
                    {post.platforms.map((platform) => (
                      <span
                        key={platform.id}
                        className="text-lg"
                        title={platform.name}
                      >
                        {platform.icon}
                      </span>
                    ))}
                  </div>

                  {/* Schedule info */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(post.scheduledAt, "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(post.scheduledAt, "h:mm a")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(post.status)}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(post)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {post.status === "scheduled" && (
                        <DropdownMenuItem onClick={() => onPublishNow(post.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Publish Now
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(post.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete scheduled post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently removed
              and will not be published.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
