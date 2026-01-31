import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CredentialRequest {
  platform: string;
  credentials: Record<string, string>;
  action: "connect" | "disconnect" | "test";
}

// Test Twitter credentials
async function testTwitterCredentials(credentials: Record<string, string>) {
  const { createHmac } = await import("node:crypto");
  
  const url = "https://api.x.com/2/users/me";
  const method = "GET";
  
  const oauthParams = {
    oauth_consumer_key: credentials.apiKey,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: credentials.accessToken,
    oauth_version: "1.0",
  };

  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(oauthParams).sort().map(([k, v]) => `${k}=${v}`).join("&")
  )}`;
  
  const signingKey = `${encodeURIComponent(credentials.apiSecret)}&${encodeURIComponent(credentials.accessTokenSecret)}`;
  const signature = createHmac("sha1", signingKey).update(signatureBaseString).digest("base64");

  const authHeader = "OAuth " + Object.entries({ ...oauthParams, oauth_signature: signature })
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(", ");

  const response = await fetch(url, {
    headers: { Authorization: authHeader },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter auth failed: ${error}`);
  }

  const data = await response.json();
  return { valid: true, username: `@${data.data.username}` };
}

// Test Facebook credentials
async function testFacebookCredentials(credentials: Record<string, string>) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me?access_token=${credentials.accessToken}`
  );

  if (!response.ok) {
    throw new Error("Facebook auth failed");
  }

  const data = await response.json();
  return { valid: true, username: data.name };
}

// Test LinkedIn credentials
async function testLinkedInCredentials(credentials: Record<string, string>) {
  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${credentials.accessToken}` },
  });

  if (!response.ok) {
    throw new Error("LinkedIn auth failed");
  }

  const data = await response.json();
  return { valid: true, username: data.name };
}

// Test WhatsApp Business credentials
async function testWhatsAppCredentials(credentials: Record<string, string>) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${credentials.phoneNumberId}`,
    {
      headers: { Authorization: `Bearer ${credentials.accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error("WhatsApp auth failed");
  }

  const data = await response.json();
  return { valid: true, username: data.display_phone_number || "Connected" };
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

    const body: CredentialRequest = await req.json();
    const { platform, credentials, action } = body;

    if (!platform || !action) {
      return new Response(
        JSON.stringify({ error: "Platform and action are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle disconnect
    if (action === "disconnect") {
      const { error } = await supabase
        .from("user_social_credentials")
        .delete()
        .eq("user_id", user.id)
        .eq("platform", platform);

      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, message: "Disconnected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Test or connect - validate credentials first
    if (!credentials) {
      return new Response(
        JSON.stringify({ error: "Credentials are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let testResult;
    try {
      switch (platform) {
        case "twitter":
          testResult = await testTwitterCredentials(credentials);
          break;
        case "facebook":
          testResult = await testFacebookCredentials(credentials);
          break;
        case "linkedin":
          testResult = await testLinkedInCredentials(credentials);
          break;
        case "whatsapp":
          testResult = await testWhatsAppCredentials(credentials);
          break;
        default:
          // For unsupported platforms, just save without testing
          testResult = { valid: true, username: "Connected" };
      }
    } catch (testError: any) {
      console.error(`Credential test failed for ${platform}:`, testError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid credentials: ${testError.message}` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If just testing, return the result
    if (action === "test") {
      return new Response(
        JSON.stringify({ success: true, ...testResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save credentials (upsert)
    const { error: upsertError } = await supabase
      .from("user_social_credentials")
      .upsert({
        user_id: user.id,
        platform,
        credentials,
        is_connected: true,
        username: testResult.username,
      }, {
        onConflict: "user_id,platform",
      });

    if (upsertError) {
      console.error("Error saving credentials:", upsertError);
      throw upsertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Connected successfully",
        username: testResult.username 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in social-credentials:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
