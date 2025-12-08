import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEvent {
  event_name: string;
  event_properties?: Record<string, unknown>;
  page_url?: string;
  session_id?: string;
  device_info?: Record<string, unknown>;
}

interface BatchRequest {
  events: AnalyticsEvent[];
}

// Helper for structured logging
function log(level: 'info' | 'warn' | 'error', message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [analytics] ${message}`, data ? JSON.stringify(data) : '');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      log('warn', 'Auth failed', { error: authError?.message });
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    
    // Handle single event or batch
    const events: AnalyticsEvent[] = body.events || [body];
    
    if (!events.length || events.length > 100) {
      return new Response(JSON.stringify({ error: 'Invalid events array (1-100 events)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare events for insertion
    const insertData = events.map(event => ({
      user_id: user.id,
      event_name: event.event_name,
      event_properties: event.event_properties || {},
      page_url: event.page_url,
      session_id: event.session_id,
      device_info: event.device_info || {},
    }));

    // Insert all events
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert(insertData);

    if (insertError) {
      log('error', 'Failed to insert analytics events', { error: insertError.message });
      throw insertError;
    }

    log('info', `Recorded ${events.length} analytics events`, { userId: user.id });

    return new Response(JSON.stringify({ 
      success: true, 
      recorded: events.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('error', 'Analytics error', { error: error.message });
    
    // Log to error_logs table
    try {
      await supabase.from('error_logs').insert({
        error_type: 'analytics_error',
        error_message: error.message,
        error_stack: error.stack,
        function_name: 'analytics',
        severity: 'error'
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
