import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PostResult {
  platform: string;
  success: boolean;
  data?: any;
  error?: string;
}

export function useSocialPosting() {
  const { toast } = useToast();
  const [posting, setPosting] = useState(false);

  const publishPost = async (content: string, platforms: string[]) => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to post",
        variant: "destructive",
      });
      return { success: false, results: [], errors: [] };
    }

    if (platforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return { success: false, results: [], errors: [] };
    }

    setPosting(true);
    try {
      const { data, error } = await supabase.functions.invoke("social-post", {
        body: { content, platforms },
      });

      if (error) throw error;

      const successCount = data.results?.length || 0;
      const errorCount = data.errors?.length || 0;

      if (successCount > 0 && errorCount === 0) {
        toast({
          title: "Posted Successfully!",
          description: `Your content was published to ${successCount} platform${successCount > 1 ? "s" : ""}`,
        });
      } else if (successCount > 0 && errorCount > 0) {
        toast({
          title: "Partially Posted",
          description: `Posted to ${successCount} platform${successCount > 1 ? "s" : ""}, ${errorCount} failed`,
          variant: "default",
        });
      } else {
        toast({
          title: "Posting Failed",
          description: "Failed to post to all platforms. Check your credentials.",
          variant: "destructive",
        });
      }

      return {
        success: successCount > 0,
        results: data.results as PostResult[],
        errors: data.errors as PostResult[],
      };
    } catch (error: any) {
      console.error("Error posting:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to publish post",
        variant: "destructive",
      });
      return { success: false, results: [], errors: [{ platform: "all", error: error.message }] };
    } finally {
      setPosting(false);
    }
  };

  return {
    posting,
    publishPost,
  };
}
