import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ScheduledPost {
  id: string;
  user_id: string;
  content: string;
  platforms: string[];
  scheduled_at: string;
  status: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use service role key to bypass RLS and process all users' posts
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting scheduled posts processor...");

    // Find all posts that are scheduled and due
    const now = new Date().toISOString();
    const { data: duePosts, error: fetchError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", now);

    if (fetchError) {
      console.error("Error fetching due posts:", fetchError);
      throw new Error(`Failed to fetch scheduled posts: ${fetchError.message}`);
    }

    if (!duePosts || duePosts.length === 0) {
      console.log("No scheduled posts due for publishing");
      return new Response(
        JSON.stringify({ success: true, message: "No posts to process", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${duePosts.length} posts to process`);

    const results = [];
    const errors = [];

    for (const post of duePosts as ScheduledPost[]) {
      console.log(`Processing post ${post.id} for user ${post.user_id}`);

      try {
        // Get user's credentials for the platforms
        const { data: credentialsData, error: credError } = await supabase
          .from("user_social_credentials")
          .select("*")
          .eq("user_id", post.user_id)
          .in("platform", post.platforms);

        if (credError) {
          console.error(`Error fetching credentials for post ${post.id}:`, credError);
          throw new Error(`Failed to fetch credentials: ${credError.message}`);
        }

        const postResults = [];
        const postErrors = [];

        for (const platform of post.platforms) {
          const platformCreds = credentialsData?.find((c) => c.platform === platform);

          if (!platformCreds?.is_connected) {
            postErrors.push({ platform, error: "Not connected" });
            continue;
          }

          try {
            const result = await publishToPlatform(
              platform,
              post.content,
              platformCreds.credentials
            );
            postResults.push(result);
          } catch (err: any) {
            console.error(`Error posting to ${platform} for post ${post.id}:`, err);
            postErrors.push({ platform, error: err.message });
          }
        }

        // Determine final status
        const finalStatus = postErrors.length === 0 
          ? "published" 
          : postResults.length === 0 
            ? "failed" 
            : "partial";

        // Update post status
        const { error: updateError } = await supabase
          .from("scheduled_posts")
          .update({ 
            status: finalStatus,
            updated_at: new Date().toISOString()
          })
          .eq("id", post.id);

        if (updateError) {
          console.error(`Error updating post ${post.id} status:`, updateError);
        }

        results.push({
          postId: post.id,
          status: finalStatus,
          results: postResults,
          errors: postErrors,
        });
      } catch (err: any) {
        console.error(`Error processing post ${post.id}:`, err);
        
        // Mark as failed
        await supabase
          .from("scheduled_posts")
          .update({ 
            status: "failed",
            updated_at: new Date().toISOString()
          })
          .eq("id", post.id);

        errors.push({
          postId: post.id,
          error: err.message,
        });
      }
    }

    console.log(`Processed ${results.length} posts, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        failed: errors.length,
        results,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in scheduled-posts-processor:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Platform-specific posting functions (same logic as social-post function)
import { createHmac } from "node:crypto";

interface Credentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
  phoneNumberId?: string;
  pageId?: string;
  accountId?: string;
  openId?: string;
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(
    consumerSecret
  )}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  return hmacSha1.update(signatureBaseString).digest("base64");
}

function generateTwitterOAuthHeader(
  method: string,
  url: string,
  credentials: Credentials
): string {
  const oauthParams = {
    oauth_consumer_key: credentials.apiKey!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: credentials.accessToken!,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    credentials.apiSecret!,
    credentials.accessTokenSecret!
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  return (
    "OAuth " +
    Object.entries(signedOAuthParams)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

async function publishToPlatform(
  platform: string,
  content: string,
  credentials: Credentials
): Promise<{ platform: string; success: boolean; data: any }> {
  switch (platform) {
    case "twitter":
      return await postToTwitter(content, credentials);
    case "facebook":
      return await postToFacebook(content, credentials);
    case "linkedin":
      return await postToLinkedIn(content, credentials);
    default:
      throw new Error(`Platform ${platform} not supported for scheduled posts`);
  }
}

async function postToTwitter(content: string, credentials: Credentials) {
  const url = "https://api.x.com/2/tweets";
  const method = "POST";
  const oauthHeader = generateTwitterOAuthHeader(method, url, credentials);

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: content }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(`Twitter error: ${JSON.stringify(result)}`);
  }
  return { platform: "twitter", success: true, data: result };
}

async function postToFacebook(content: string, credentials: Credentials) {
  const url = `https://graph.facebook.com/v18.0/${credentials.pageId}/feed`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: content,
      access_token: credentials.accessToken,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(`Facebook error: ${JSON.stringify(result)}`);
  }
  return { platform: "facebook", success: true, data: result };
}

async function postToLinkedIn(content: string, credentials: Credentials) {
  const meResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${credentials.accessToken}` },
  });

  if (!meResponse.ok) {
    throw new Error("Failed to get LinkedIn user info");
  }

  const meData = await meResponse.json();
  const authorUrn = `urn:li:person:${meData.sub}`;

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credentials.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(`LinkedIn error: ${JSON.stringify(result)}`);
  }
  return { platform: "linkedin", success: true, data: result };
}
