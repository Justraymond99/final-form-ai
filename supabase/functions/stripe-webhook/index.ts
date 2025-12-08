import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    logStep("Received webhook", { hasSignature: !!signature });

    // Verify webhook signature if secret is configured
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified", { eventType: event.type });
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err.message });
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // For development without webhook secret
      event = JSON.parse(body) as Stripe.Event;
      logStep("Processing unverified webhook (dev mode)", { eventType: event.type });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { 
          customerId: session.customer, 
          email: session.customer_email,
          subscriptionId: session.subscription 
        });

        // Log subscription event for analytics
        if (session.customer_email) {
          const { data: userData } = await supabaseAdmin
            .from("profiles")
            .select("user_id")
            .eq("email", session.customer_email)
            .single();

          if (userData?.user_id) {
            await supabaseAdmin.from("analytics_events").insert({
              user_id: userData.user_id,
              event_name: "subscription_created",
              event_properties: {
                subscription_id: session.subscription,
                amount_total: session.amount_total,
                currency: session.currency,
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { 
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription cancelled", { 
          subscriptionId: subscription.id,
          customer: subscription.customer 
        });

        // Log cancellation for analytics
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (!customer.deleted && customer.email) {
          const { data: userData } = await supabaseAdmin
            .from("profiles")
            .select("user_id")
            .eq("email", customer.email)
            .single();

          if (userData?.user_id) {
            await supabaseAdmin.from("analytics_events").insert({
              user_id: userData.user_id,
              event_name: "subscription_cancelled",
              event_properties: {
                subscription_id: subscription.id,
                reason: subscription.cancellation_details?.reason,
              },
            });
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment succeeded", { 
          invoiceId: invoice.id,
          amount: invoice.amount_paid,
          customer: invoice.customer 
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment failed", { 
          invoiceId: invoice.id,
          customer: invoice.customer,
          attemptCount: invoice.attempt_count 
        });

        // Could trigger notification to user here
        break;
      }

      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR processing webhook", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
