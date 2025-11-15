import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { initializeSecurity, logSecurityEvent, ValidationSchemas, validateInput } from "@/lib/security";
import { toast } from "sonner";

interface SecureAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  secureSignIn: (email: string, password: string) => Promise<{ error?: string }>;
  secureSignUp: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
}

const SecureAuthContext = createContext<SecureAuthContextType | undefined>(undefined);

export const SecureAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize security measures
    initializeSecurity();

    // Set up auth state listener with security logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Log security events
        if (event === 'SIGNED_IN') {
          await logSecurityEvent('USER_SIGNED_IN', {
            userId: session?.user?.id,
            method: 'email'
          });
        } else if (event === 'SIGNED_OUT') {
          await logSecurityEvent('USER_SIGNED_OUT', {
            userId: session?.user?.id
          });
        } else if (event === 'TOKEN_REFRESHED') {
          await logSecurityEvent('TOKEN_REFRESHED', {
            userId: session?.user?.id
          });
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const secureSignIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      // Validate input
      const validation = validateInput({ email, password }, ValidationSchemas.auth);
      if (!validation.valid) {
        const errorMsg = validation.errors.join(', ');
        await logSecurityEvent('SIGNIN_VALIDATION_FAILED', { email, errors: validation.errors });
        return { error: errorMsg };
      }

      // Rate limiting check
      const lastAttempt = sessionStorage.getItem('last_signin_attempt');
      if (lastAttempt && Date.now() - parseInt(lastAttempt) < 5000) {
        await logSecurityEvent('SIGNIN_RATE_LIMITED', { email });
        return { error: 'Too many sign-in attempts. Please wait a moment.' };
      }

      sessionStorage.setItem('last_signin_attempt', Date.now().toString());

      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        await logSecurityEvent('SIGNIN_FAILED', { email, error: error.message });
        
        // Track failed attempts
        const failedAttempts = parseInt(sessionStorage.getItem('failed_signin_attempts') || '0') + 1;
        sessionStorage.setItem('failed_signin_attempts', failedAttempts.toString());
        
        if (failedAttempts >= 5) {
          await logSecurityEvent('SIGNIN_MULTIPLE_FAILURES', { email, attempts: failedAttempts });
          return { error: 'Account temporarily locked due to multiple failed attempts.' };
        }

        return { error: error.message };
      }

      // Clear failed attempts on success
      sessionStorage.removeItem('failed_signin_attempts');
      await logSecurityEvent('SIGNIN_SUCCESS', { email });
      
      return {};
    } catch (error) {
      console.error('Secure sign in error:', error);
      await logSecurityEvent('SIGNIN_ERROR', { email, error: (error as Error).message });
      return { error: 'An unexpected error occurred' };
    }
  };

  const secureSignUp = async (email: string, password: string, displayName?: string): Promise<{ error?: string }> => {
    try {
      // Validate input
      const validation = validateInput({ email, password }, ValidationSchemas.auth);
      if (!validation.valid) {
        const errorMsg = validation.errors.join(', ');
        await logSecurityEvent('SIGNUP_VALIDATION_FAILED', { email, errors: validation.errors });
        return { error: errorMsg };
      }

      // Additional password strength check
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordPattern.test(password)) {
        await logSecurityEvent('SIGNUP_WEAK_PASSWORD', { email });
        return { 
          error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
        };
      }

      // Rate limiting check
      const lastAttempt = sessionStorage.getItem('last_signup_attempt');
      if (lastAttempt && Date.now() - parseInt(lastAttempt) < 10000) {
        await logSecurityEvent('SIGNUP_RATE_LIMITED', { email });
        return { error: 'Too many sign-up attempts. Please wait a moment.' };
      }

      sessionStorage.setItem('last_signup_attempt', Date.now().toString());

      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            display_name: displayName?.trim() || ''
          }
        }
      });

      if (error) {
        await logSecurityEvent('SIGNUP_FAILED', { email, error: error.message });
        return { error: error.message };
      }

      await logSecurityEvent('SIGNUP_SUCCESS', { email });
      toast.success('Account created successfully! Please check your email for verification.');
      
      return {};
    } catch (error) {
      console.error('Secure sign up error:', error);
      await logSecurityEvent('SIGNUP_ERROR', { email, error: (error as Error).message });
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      await logSecurityEvent('SIGNOUT_INITIATED', { userId: user?.id });
      await supabase.auth.signOut();
      
      // Clear sensitive data from storage
      sessionStorage.removeItem('csrf_token');
      sessionStorage.removeItem('failed_signin_attempts');
      sessionStorage.removeItem('last_signin_attempt');
      sessionStorage.removeItem('last_signup_attempt');
      
    } catch (error) {
      console.error('Sign out error:', error);
      await logSecurityEvent('SIGNOUT_ERROR', { userId: user?.id, error: (error as Error).message });
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    secureSignIn,
    secureSignUp,
  };

  return <SecureAuthContext.Provider value={value}>{children}</SecureAuthContext.Provider>;
};

export const useSecureAuth = () => {
  const context = useContext(SecureAuthContext);
  if (context === undefined) {
    throw new Error("useSecureAuth must be used within a SecureAuthProvider");
  }
  return context;
};