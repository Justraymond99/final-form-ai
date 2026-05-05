import { supabase } from "@/integrations/supabase/client";

// CSRF Token management
let csrfToken: string | null = null;

export const generateCSRFToken = (): string => {
  if (typeof window === 'undefined') return '';
  
  // Generate a random CSRF token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  csrfToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
  // Store in sessionStorage
  sessionStorage.setItem('csrf_token', csrfToken);
  return csrfToken;
};

export const getCSRFToken = (): string => {
  if (typeof window === 'undefined') return '';
  
  if (!csrfToken) {
    csrfToken = sessionStorage.getItem('csrf_token') || generateCSRFToken();
  }
  return csrfToken;
};

// Input validation schemas
export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-Z\s'-]{2,50}$/,
  phone: /^\+?[\d\s-()]{10,}$/,
  url: /^https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+$/
};

// Validation schemas for different forms
export const ValidationSchemas = {
  profile: {
    display_name: { required: true, type: 'string', minLength: 2, maxLength: 50, pattern: ValidationPatterns.name },
    email: { required: true, type: 'string', pattern: ValidationPatterns.email },
    age: { type: 'number', min: 13, max: 120 },
    height_cm: { type: 'number', min: 100, max: 250 },
    weight_kg: { type: 'number', min: 30, max: 300 }
  },
  foodLog: {
    food_name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
    quantity: { required: true, type: 'number', min: 0.1, max: 1000 },
    calories: { type: 'number', min: 0, max: 10000 },
    meal_type: { required: true, type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] }
  },
  workout: {
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    type: { required: true, type: 'string', enum: ['strength', 'cardio', 'hiit', 'yoga', 'sports'] },
    duration_minutes: { type: 'number', min: 5, max: 300 }
  },
  waterLog: {
    amount_ml: { required: true, type: 'number', min: 50, max: 2000 }
  },
  auth: {
    email: { required: true, type: 'string', pattern: ValidationPatterns.email },
    password: { required: true, type: 'string', minLength: 8, maxLength: 128 }
  }
} as const;

export const validateInput = (data: any, schema: ValidationSchema): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Sanitize input first
  const sanitizedData = sanitizeInput(data);
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = sanitizedData[field];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value !== undefined && value !== null && value !== '') {
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
      
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
};

export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
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
      .substring(0, 10000);
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      if (typeof key === 'string' && key.length <= 100) {
        sanitized[sanitizeInput(key)] = sanitizeInput(value);
      }
    }
    return sanitized;
  }
  
  return input;
};

// Rate limiting helper for client-side
export const checkRateLimit = (key: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  if (typeof window === 'undefined') return true;
  
  const rateLimitKey = `rate_limit_${key}`;
  const requestsKey = `requests_${key}`;
  
  const lastCall = sessionStorage.getItem(rateLimitKey);
  const requestCount = parseInt(sessionStorage.getItem(requestsKey) || '0');
  
  const now = Date.now();
  
  // Reset if window has passed
  if (!lastCall || now - parseInt(lastCall) > windowMs) {
    sessionStorage.setItem(rateLimitKey, now.toString());
    sessionStorage.setItem(requestsKey, '1');
    return true;
  }
  
  // Check if limit exceeded
  if (requestCount >= maxRequests) {
    return false;
  }
  
  // Increment request count
  sessionStorage.setItem(requestsKey, (requestCount + 1).toString());
  return true;
};

// Secure wrapper for common Supabase operations
export const secureSupabaseCall = {
  async select(tableName: string, columns: string = '*', filters?: Record<string, any>) {
    if (!checkRateLimit(`${tableName}_select`, 50, 60000)) {
      throw new Error('Rate limit exceeded');
    }
    
    let query = (supabase as any).from(tableName).select(columns);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    return await query;
  },

  async insert(tableName: string, data: any) {
    if (!checkRateLimit(`${tableName}_insert`, 20, 60000)) {
      throw new Error('Rate limit exceeded');
    }
    
    const sanitizedData = sanitizeInput(data);
    return await (supabase as any).from(tableName).insert(sanitizedData);
  },

  async update(tableName: string, data: any, filters: Record<string, any>) {
    if (!checkRateLimit(`${tableName}_update`, 30, 60000)) {
      throw new Error('Rate limit exceeded');
    }
    
    const sanitizedData = sanitizeInput(data);
    let query = (supabase as any).from(tableName).update(sanitizedData);
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    return await query;
  },

  async delete(tableName: string, filters: Record<string, any>) {
    if (!checkRateLimit(`${tableName}_delete`, 10, 60000)) {
      throw new Error('Rate limit exceeded');
    }
    
    let query = (supabase as any).from(tableName).delete();
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    return await query;
  }
};

// Content Security Policy helper
export const applyCSP = () => {
  if (typeof document === 'undefined') return;
  
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.openai.com https://accounts.google.com https://*.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = csp;
  document.head.appendChild(meta);
};

// Initialize security measures
export const initializeSecurity = () => {
  if (typeof window === 'undefined') return;
  
  // Generate CSRF token
  generateCSRFToken();
  
  // Apply CSP
  applyCSP();
  
  // Clean up old rate limit entries
  const now = Date.now();
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('rate_limit_')) {
      const timestamp = sessionStorage.getItem(key);
      if (timestamp && now - parseInt(timestamp) > 3600000) { // 1 hour
        sessionStorage.removeItem(key);
      }
    }
  });
};

// Security audit logging
export const logSecurityEvent = async (event: string, details?: any) => {
  try {
    await supabase.functions.invoke('security-middleware', {
      body: {
        action: 'SECURITY_EVENT',
        event,
        details: sanitizeInput(details),
        timestamp: new Date().toISOString()
      },
      headers: {
        'X-CSRF-Token': getCSRFToken()
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};