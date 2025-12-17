import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface WorkoutTimerProps {
  exerciseName?: string;
  defaultSeconds?: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

// Audio frequencies for different sounds
const FREQUENCIES = {
  countdown: [800, 900, 1000], // 3, 2, 1 ascending
  halfwayAlert: 600,
  tenSecondsAlert: 700,
  complete: [1200, 1400, 1600], // Victory chord
  tick: 400,
};

export const WorkoutTimer = ({ 
  exerciseName, 
  defaultSeconds = 90, 
  onComplete,
  autoStart = false,
}: WorkoutTimerProps) => {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [initialSeconds, setInitialSeconds] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const announcedRef = useRef<Set<number>>(new Set());

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Haptic feedback helper
  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    try {
      await Haptics.impact({ style });
    } catch {
      // Haptics not available, use vibration API as fallback
      if (navigator.vibrate) {
        const duration = style === ImpactStyle.Heavy ? 100 : style === ImpactStyle.Light ? 25 : 50;
        navigator.vibrate(duration);
      }
    }
  };

  // Play a tone with given frequency and duration
  const playTone = useCallback((frequency: number, duration: number = 0.1, volume: number = 0.3) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  }, [soundEnabled, getAudioContext]);

  // Play countdown beep (3, 2, 1)
  const playCountdownBeep = useCallback((secondsLeft: number) => {
    const index = 3 - secondsLeft; // 0, 1, 2 for seconds 3, 2, 1
    if (index >= 0 && index < 3) {
      playTone(FREQUENCIES.countdown[index], 0.15, 0.4);
      triggerHaptic(ImpactStyle.Medium);
    }
  }, [playTone]);

  // Play halfway alert
  const playHalfwayAlert = useCallback(() => {
    playTone(FREQUENCIES.halfwayAlert, 0.2, 0.25);
    playTone(FREQUENCIES.halfwayAlert * 1.25, 0.2, 0.25);
    triggerHaptic(ImpactStyle.Light);
  }, [playTone]);

  // Play 10 second warning
  const playTenSecondAlert = useCallback(() => {
    playTone(FREQUENCIES.tenSecondsAlert, 0.15, 0.3);
    triggerHaptic(ImpactStyle.Light);
  }, [playTone]);

  // Play completion sound
  const playCompletionSound = useCallback(() => {
    if (!soundEnabled) return;
    
    // Play victory chord
    FREQUENCIES.complete.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 0.3), i * 100);
    });
    
    // Strong haptic feedback
    triggerHaptic(ImpactStyle.Heavy);
    setTimeout(() => triggerHaptic(ImpactStyle.Heavy), 200);
  }, [soundEnabled, playTone]);

  // Main timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev - 1;
          
          if (newSeconds <= 0) {
            setIsRunning(false);
            playCompletionSound();
            onComplete?.();
            return 0;
          }
          
          // Audio cues at specific times
          if (newSeconds <= 3 && !announcedRef.current.has(newSeconds)) {
            playCountdownBeep(newSeconds);
            announcedRef.current.add(newSeconds);
          } else if (newSeconds === 10 && !announcedRef.current.has(10)) {
            playTenSecondAlert();
            announcedRef.current.add(10);
          } else if (newSeconds === Math.floor(initialSeconds / 2) && !announcedRef.current.has(newSeconds)) {
            playHalfwayAlert();
            announcedRef.current.add(newSeconds);
          }
          
          return newSeconds;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, seconds, initialSeconds, onComplete, playCountdownBeep, playTenSecondAlert, playHalfwayAlert, playCompletionSound]);

  // Reset announced set when timer resets
  useEffect(() => {
    if (seconds === initialSeconds) {
      announcedRef.current.clear();
    }
  }, [seconds, initialSeconds]);

  const toggleTimer = () => {
    if (!isRunning) {
      triggerHaptic(ImpactStyle.Light);
    }
    setIsRunning(!isRunning);
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(initialSeconds);
    announcedRef.current.clear();
    triggerHaptic(ImpactStyle.Light);
  };

  const skipTimer = () => {
    setIsRunning(false);
    setSeconds(0);
    onComplete?.();
    triggerHaptic(ImpactStyle.Medium);
  };

  const addTime = (additionalSeconds: number) => {
    setSeconds(prev => prev + additionalSeconds);
    setInitialSeconds(prev => prev + additionalSeconds);
    triggerHaptic(ImpactStyle.Light);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialSeconds - seconds) / initialSeconds) * 100;

  // Determine visual state
  const isLowTime = seconds <= 10 && seconds > 3;
  const isCritical = seconds <= 3 && seconds > 0;

  return (
    <Card className={`w-full transition-all duration-300 ${
      isCritical ? 'ring-2 ring-destructive' : isLowTime ? 'ring-1 ring-warning' : ''
    }`}>
      <CardContent className="p-6 space-y-4">
        {exerciseName && (
          <h3 className="text-lg font-semibold text-center">{exerciseName}</h3>
        )}
        
        <div className="space-y-2">
          <Label>Rest Time (seconds)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={initialSeconds}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setInitialSeconds(val);
                if (!isRunning) setSeconds(val);
              }}
              disabled={isRunning}
              min={1}
              max={600}
              className="flex-1"
            />
            {isRunning && (
              <Button variant="outline" size="sm" onClick={() => addTime(30)}>
                +30s
              </Button>
            )}
          </div>
        </div>

        <div className="text-center relative">
          <div className={`text-6xl font-bold tabular-nums transition-all duration-200 ${
            isCritical 
              ? 'text-destructive animate-pulse scale-110' 
              : isLowTime 
                ? 'text-warning' 
                : ''
          }`}>
            {formatTime(seconds)}
          </div>
          
          {/* Visual cue for time remaining */}
          {isLowTime && !isCritical && (
            <p className="text-sm text-warning mt-1">Almost there!</p>
          )}
          {isCritical && (
            <p className="text-sm text-destructive mt-1 animate-bounce">Get ready!</p>
          )}
          
          <Progress 
            value={progress} 
            className={`mt-4 transition-all ${isCritical ? 'h-3' : 'h-2'}`}
          />
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="w-32 interactive-scale"
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Start
              </>
            )}
          </Button>
          <Button
            onClick={resetTimer}
            size="lg"
            variant="outline"
            className="interactive-scale"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            onClick={skipTimer}
            size="lg"
            variant="outline"
            className="interactive-scale"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            size="lg"
            variant="outline"
            className="interactive-scale"
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
        </div>

        {seconds === 0 && (
          <div className="text-center text-lg font-semibold text-primary animate-bounce">
            Rest Complete! 💪
          </div>
        )}
      </CardContent>
    </Card>
  );
};
