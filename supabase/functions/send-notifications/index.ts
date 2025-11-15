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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { type, userId, title, body, scheduledFor, data } = await req.json();

    if (!type || !userId || !title || !body) {
      throw new Error("Missing required fields");
    }

    // Queue notification
    const { error: insertError } = await supabaseClient
      .from("notification_queue")
      .insert({
        user_id: userId,
        notification_type: type,
        title,
        body,
        scheduled_for: scheduledFor || new Date().toISOString(),
        data: data || {},
      });

    if (insertError) throw insertError;

    console.log(`Notification queued for user ${userId}: ${title}`);

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
