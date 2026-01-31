import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PostRequest {
  content: string;
  platforms: string[];
  scheduledAt?: string;
}

interface Credentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
  phoneNumberId?: string;
  pageId?: string;
  accountId?: string;  // Instagram Business Account ID
  openId?: string;     // TikTok Open ID
}

// Twitter OAuth 1.0a signature generation
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

// Post to Twitter/X
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

// Post to Facebook Page
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

// Post to LinkedIn
async function postToLinkedIn(content: string, credentials: Credentials) {
  // First get the user's URN
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

// Send WhatsApp message (template-based for Business API)
async function sendWhatsAppMessage(content: string, credentials: Credentials) {
  // Note: WhatsApp Business API requires template messages for initiating conversations
  // This is a simplified example - production would need recipient number and template
  const url = `https://graph.facebook.com/v18.0/${credentials.phoneNumberId}/messages`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credentials.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: "RECIPIENT_NUMBER", // This would come from the request
      type: "text",
      text: { body: content },
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(`WhatsApp error: ${JSON.stringify(result)}`);
  }
  return { platform: "whatsapp", success: true, data: result };
}

// Post to Instagram (via Facebook Graph API - requires Instagram Business Account)
async function postToInstagram(content: string, credentials: Credentials, imageUrl?: string) {
  const accountId = credentials.accountId;
  const accessToken = credentials.accessToken;
  
  if (!accountId || !accessToken) {
    throw new Error("Instagram requires accountId and accessToken");
  }

  // Instagram requires either an image or video for posts
  // For text-only posts, we create a "carousel" with just text or use the comment feature
  // However, the official API requires media. For text posts, you'd typically:
  // 1. Create a media container with an image URL
  // 2. Publish the container
  
  if (imageUrl) {
    // Step 1: Create media container
    const containerUrl = `https://graph.facebook.com/v18.0/${accountId}/media`;
    const containerResponse = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: content,
        access_token: accessToken,
      }),
    });

    const containerResult = await containerResponse.json();
    if (!containerResponse.ok) {
      throw new Error(`Instagram container error: ${JSON.stringify(containerResult)}`);
    }

    // Step 2: Publish the media
    const publishUrl = `https://graph.facebook.com/v18.0/${accountId}/media_publish`;
    const publishResponse = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerResult.id,
        access_token: accessToken,
      }),
    });

    const publishResult = await publishResponse.json();
    if (!publishResponse.ok) {
      throw new Error(`Instagram publish error: ${JSON.stringify(publishResult)}`);
    }

    return { platform: "instagram", success: true, data: publishResult };
  } else {
    // For text-only posts, Instagram Content Publishing API requires media
    // Return error explaining this limitation
    throw new Error("Instagram requires an image or video for posts. Text-only posts are not supported by the API.");
  }
}

// Post to TikTok (Content Posting API)
async function postToTikTok(content: string, credentials: Credentials, videoUrl?: string) {
  const accessToken = credentials.accessToken;
  
  if (!accessToken) {
    throw new Error("TikTok requires an access token");
  }

  // TikTok Content Posting API requires video content
  // The workflow is:
  // 1. Initialize a post with post/publish/inbox/video/init
  // 2. Upload the video
  // 3. Publish the post
  
  if (!videoUrl) {
    throw new Error("TikTok requires a video URL for posts. Text-only posts are not supported.");
  }

  // Step 1: Query creator info to verify access
  const creatorInfoUrl = "https://open.tiktokapis.com/v2/post/publish/creator_info/query/";
  const creatorResponse = await fetch(creatorInfoUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
  });

  const creatorResult = await creatorResponse.json();
  if (!creatorResponse.ok || creatorResult.error?.code !== "ok") {
    console.error("TikTok creator info error:", creatorResult);
    throw new Error(`TikTok creator info error: ${JSON.stringify(creatorResult)}`);
  }

  // Step 2: Initialize video upload with PULL_FROM_URL
  const initUrl = "https://open.tiktokapis.com/v2/post/publish/video/init/";
  const initResponse = await fetch(initUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title: content.substring(0, 150), // TikTok title limit
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_duet: false,
        disable_stitch: false,
        disable_comment: false,
        video_cover_timestamp_ms: 0,
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: videoUrl,
      },
    }),
  });

  const initResult = await initResponse.json();
  if (!initResponse.ok || initResult.error?.code !== "ok") {
    console.error("TikTok init error:", initResult);
    throw new Error(`TikTok init error: ${JSON.stringify(initResult)}`);
  }

  // The video will be processed asynchronously by TikTok
  // publish_id can be used to check status
  return { 
    platform: "tiktok", 
    success: true, 
    data: {
      publish_id: initResult.data?.publish_id,
      message: "Video submitted for processing. It will appear on your TikTok profile once processing is complete.",
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: PostRequest = await req.json();
    const { content, platforms } = body;

    if (!content || !platforms?.length) {
      return new Response(
        JSON.stringify({ error: "Content and platforms are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's credentials for each platform
    const { data: credentialsData, error: credError } = await supabase
      .from("user_social_credentials")
      .select("*")
      .eq("user_id", user.id)
      .in("platform", platforms);

    if (credError) {
      console.error("Error fetching credentials:", credError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];
    const errors = [];

    for (const platform of platforms) {
      const platformCreds = credentialsData?.find((c) => c.platform === platform);
      
      if (!platformCreds?.is_connected) {
        errors.push({ platform, error: "Not connected" });
        continue;
      }

      const credentials: Credentials = platformCreds.credentials as Credentials;

      try {
        let result;
        switch (platform) {
          case "twitter":
            result = await postToTwitter(content, credentials);
            break;
          case "facebook":
            result = await postToFacebook(content, credentials);
            break;
          case "linkedin":
            result = await postToLinkedIn(content, credentials);
            break;
          case "whatsapp":
            result = await sendWhatsAppMessage(content, credentials);
            break;
          case "instagram":
            // Instagram requires image/video - would need to pass mediaUrl from request
            result = await postToInstagram(content, credentials);
            break;
          case "tiktok":
            // TikTok requires video - would need to pass videoUrl from request
            result = await postToTikTok(content, credentials);
            break;
          default:
            errors.push({ platform, error: "Platform not supported yet" });
            continue;
        }
        results.push(result);
      } catch (err: any) {
        console.error(`Error posting to ${platform}:`, err);
        errors.push({ platform, error: err.message });
      }
    }

    // Log the post
    await supabase.from("scheduled_posts").insert({
      user_id: user.id,
      content,
      platforms,
      status: errors.length === 0 ? "published" : "partial",
      scheduled_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, results, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in social-post:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
