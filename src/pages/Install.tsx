import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Download, CheckCircle2, Apple, Chrome } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event (Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="w-20 h-20 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">App Installed!</h1>
            <p className="text-muted-foreground">
              Final Form is now installed on your device. You can access it from your home screen.
            </p>
          </div>
          <Button onClick={() => navigate('/home')} className="w-full">
            Get Started
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="flex justify-center">
          <Smartphone className="w-20 h-20 text-primary" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Install Final Form</h1>
          <p className="text-muted-foreground">
            Get the full app experience with offline access and faster loading times
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">Works Offline</p>
              <p className="text-sm text-muted-foreground">Access your workouts and nutrition plans anytime</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">Lightning Fast</p>
              <p className="text-sm text-muted-foreground">Instant loading with cached content</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">Home Screen Access</p>
              <p className="text-sm text-muted-foreground">Launch directly from your device</p>
            </div>
          </div>
        </div>

        {isIOS ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Apple className="w-5 h-5" />
              <span>iPhone/iPad Installation</span>
            </div>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>Tap the Share button at the bottom of Safari</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Scroll down and tap "Add to Home Screen"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Tap "Add" in the top right corner</span>
              </li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} className="w-full" size="lg">
            <Download className="w-5 h-5 mr-2" />
            Install App
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Chrome className="w-5 h-5" />
              <span>Android/Chrome Installation</span>
            </div>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>Tap the menu (⋮) in your browser</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Select "Install App" or "Add to Home Screen"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Tap "Install" to confirm</span>
              </li>
            </ol>
          </div>
        )}

        <Button variant="outline" onClick={() => navigate('/home')} className="w-full">
          Skip for Now
        </Button>
      </Card>
    </div>
  );
};

export default Install;