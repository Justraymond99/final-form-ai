import { useEffect, ReactNode } from 'react';
import { initializeSecurity, logSecurityEvent } from '@/lib/security';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface SecurityWrapperProps {
  children: ReactNode;
}

export const SecurityWrapper = ({ children }: SecurityWrapperProps) => {
  const { user } = useSecureAuth();

  useEffect(() => {
    // Initialize all security measures
    initializeSecurity();

    // Log app initialization
    logSecurityEvent('APP_INITIALIZED', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform
    });

    // Set up security monitoring
    const handleSecurityViolation = (event: SecurityPolicyViolationEvent) => {
      logSecurityEvent('CSP_VIOLATION', {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber
      });
    };

    document.addEventListener('securitypolicyviolation', handleSecurityViolation);

    // Monitor for potential XSS attempts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check for suspicious script injection
            if (element.tagName === 'SCRIPT') {
              logSecurityEvent('SUSPICIOUS_SCRIPT_INJECTION', {
                innerHTML: element.innerHTML,
                src: element.getAttribute('src')
              });
            }

            // Check for suspicious event handlers
            const suspiciousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover'];
            suspiciousAttrs.forEach(attr => {
              if (element.hasAttribute(attr)) {
                logSecurityEvent('SUSPICIOUS_EVENT_HANDLER', {
                  attribute: attr,
                  value: element.getAttribute(attr),
                  tagName: element.tagName
                });
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onclick', 'onload', 'onerror', 'onmouseover']
    });

    // Track page visibility for security monitoring
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logSecurityEvent('PAGE_HIDDEN', { userId: user?.id });
      } else {
        logSecurityEvent('PAGE_VISIBLE', { userId: user?.id });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('securitypolicyviolation', handleSecurityViolation);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, [user?.id]);

  // Security headers verification
  useEffect(() => {
    // Check if we're running in secure context
    if (typeof window !== 'undefined') {
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        logSecurityEvent('INSECURE_CONTEXT', {
          protocol: location.protocol,
          hostname: location.hostname
        });
      }

      // Check for security headers (best effort)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'SECURITY_HEADER_CHECK') {
            logSecurityEvent('SECURITY_HEADERS_VERIFIED', event.data.headers);
          }
        });
      }
    }
  }, []);

  return <>{children}</>;
};

export default SecurityWrapper;