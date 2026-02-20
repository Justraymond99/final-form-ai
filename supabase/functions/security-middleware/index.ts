import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  endpoint: string;
}

const RATE_LIMITS: RateLimitConfig[] = [
  { endpoint: '/auth', maxRequests: 5, windowMs: 900000 }, // 5 requests per 15 minutes for auth
  { endpoint: '/api/food', maxRequests: 100, windowMs: 3600000 }, // 100 requests per hour for food API
  { endpoint: '/api/workout', maxRequests: 50, windowMs: 3600000 }, // 50 requests per hour for workout API
  { endpoint: '/api/chat', maxRequests: 20, windowMs: 3600000 }, // 20 requests per hour for AI chat
  { endpoint: 'default', maxRequests: 200, windowMs: 3600000 }, // 200 requests per hour default
];

async function getRateLimit(ip: string, userId: string | null, endpoint: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const config = RATE_LIMITS.find(limit => endpoint.includes(limit.endpoint)) || 
                   RATE_LIMITS.find(limit => limit.endpoint === 'default')!;
    
    const windowStart = new Date(Date.now() - config.windowMs);
    
    // Check rate limit for IP and user
    const identifier = userId || ip;
    
    const { data: logs, error } = await supabase
      .from('security_audit_log')
      .select('request_count, created_at')
      .eq('ip_address', ip)
      .eq('endpoint', endpoint)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error checking rate limit');
      return { allowed: true, remaining: config.maxRequests };
    }
    
    const totalRequests = logs?.reduce((sum, log) => sum + log.request_count, 0) || 0;
    const remaining = Math.max(0, config.maxRequests - totalRequests);
    
    if (totalRequests >= config.maxRequests) {
      // Log blocked request
      await supabase
        .from('security_audit_log')
        .insert({
          user_id: userId,
          ip_address: ip,
          endpoint,
          action: 'RATE_LIMITED',
          request_count: 1,
          blocked: true
        });
      
      return { allowed: false, remaining: 0 };
    }
    
    // Log successful request
    await supabase
      .from('security_audit_log')
      .insert({
        user_id: userId,
        ip_address: ip,
        endpoint,
        action: 'API_CALL',
        request_count: 1,
        blocked: false
      });
    
    return { allowed: true, remaining: remaining - 1 };
  } catch (error) {
    console.error('Rate limit check failed');
    return { allowed: true, remaining: 100 }; // Fail open
  }
}

function validateCSRFToken(req: Request, token: string): boolean {
  try {
    // Simple CSRF validation - in production, use proper signed tokens
    const origin = req.headers.get('origin') || '';
    const referer = req.headers.get('referer') || '';
    
    // Check if request comes from allowed origins
    const allowedOrigins = [
      'https://finalform.app',
      'https://www.finalform.app',
      'capacitor://localhost',
      'http://localhost',
      'http://localhost:8080',
      'http://127.0.0.1:8080'
    ];
    
    const isValidOrigin = allowedOrigins.some(allowed => 
      origin.includes(allowed) || referer.includes(allowed)
    );
    
    // For now, just validate origin - in production, implement proper CSRF token validation
    return isValidOrigin;
  } catch (error) {
    console.error('CSRF validation error');
    return false;
  }
}

function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potentially harmful characters and scripts
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/[<>'"&]/g, (char) => {
        const entities: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[char] || char;
      })
      .trim()
      .substring(0, 10000); // Limit input length
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      if (typeof key === 'string' && key.length <= 100) { // Limit key length
        sanitized[sanitizeInput(key)] = sanitizeInput(value);
      }
    }
    return sanitized;
  }
  
  return input;
}

function validateInput(data: any, schema: { [key: string]: any }): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value !== undefined && value !== null) {
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
      }
      
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`${field} must be no more than ${rules.maxLength} characters`);
      }
      
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
      
      if (rules.min && typeof value === 'number' && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      
      if (rules.max && typeof value === 'number' && value > rules.max) {
        errors.push(`${field} must be no more than ${rules.max}`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP and user info
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';
    
    const authHeader = req.headers.get('authorization') || '';
    const userAgent = req.headers.get('user-agent') || '';
    const csrfToken = req.headers.get('x-csrf-token') || '';
    
    // Extract user ID from JWT if present
    let userId: string | null = null;
    if (authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        // Basic JWT decode (in production, use proper JWT verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.sub;
      } catch (e) {
        // Invalid JWT - continue without user ID
      }
    }
    
    const url = new URL(req.url);
    const endpoint = url.pathname;
    
    // Rate limiting
    const rateLimit = await getRateLimit(clientIP, userId, endpoint);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        retryAfter: 3600 
      }), {
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': '3600'
        },
      });
    }
    
    // CSRF protection for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      if (!validateCSRFToken(req, csrfToken)) {
        return new Response(JSON.stringify({ 
          error: 'Invalid CSRF token' 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Input validation and sanitization
    let requestData: any = {};
    if (req.method !== 'GET' && req.headers.get('content-type')?.includes('application/json')) {
      try {
        requestData = await req.json();
        requestData = sanitizeInput(requestData);
      } catch (e) {
        return new Response(JSON.stringify({ 
          error: 'Invalid JSON input' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Return security metadata for the client
    return new Response(JSON.stringify({
      security: {
        rateLimitRemaining: rateLimit.remaining,
        csrfTokenValidated: req.method === 'GET' || validateCSRFToken(req, csrfToken),
        inputSanitized: true,
        timestamp: new Date().toISOString()
      },
      data: requestData
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Rate-Limit-Remaining': rateLimit.remaining.toString()
      },
    });
    
  } catch (error) {
    console.error('Security middleware error');
    return new Response(JSON.stringify({
      error: 'Security check failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});