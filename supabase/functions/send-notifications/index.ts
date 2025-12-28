import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Create client with anon key for auth verification
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify the JWT and get the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth verification failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const { type, userId, title, body, scheduledFor, data } = await req.json();

    if (!type || !userId || !title || !body) {
      throw new Error("Missing required fields");
    }

    // Ensure user can only queue notifications for themselves
    if (user.id !== userId) {
      console.error(`User ${user.id} attempted to send notification to ${userId}`);
      return new Response(
        JSON.stringify({ error: "Forbidden: Cannot send notifications for other users" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    // Sanitize title and body to prevent injection
    const sanitizedTitle = String(title).slice(0, 100).replace(/<[^>]*>/g, "");
    const sanitizedBody = String(body).slice(0, 500).replace(/<[^>]*>/g, "");

    // Use service role client for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Queue notification
    const { error: insertError } = await supabaseClient
      .from("notification_queue")
      .insert({
        user_id: userId,
        notification_type: type,
        title: sanitizedTitle,
        body: sanitizedBody,
        scheduled_for: scheduledFor || new Date().toISOString(),
        data: data || {},
      });

    if (insertError) throw insertError;

    console.log(`Notification queued for user ${userId}: ${sanitizedTitle}`);

    return new Response(
      JSON.stringify({ success: true, message: "Notification scheduled" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
