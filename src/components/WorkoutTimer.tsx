import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface WorkoutTimerProps {
  exerciseName?: string;
  defaultSeconds?: number;
  onComplete?: () => void;
}

export const WorkoutTimer = ({ 
  exerciseName, 
  defaultSeconds = 90, 
  onComplete 
}: WorkoutTimerProps) => {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [initialSeconds, setInitialSeconds] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playCompletionSound();
            onComplete?.();
            // Vibrate if supported
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          
          // Play beep at 3, 2, 1 seconds
          if (prev <= 3 && soundEnabled) {
            playBeep();
          }
          
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, seconds, soundEnabled, onComplete]);

  const playBeep = () => {
    if (soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  const playCompletionSound = () => {
    if (soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1200;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(initialSeconds);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialSeconds - seconds) / initialSeconds) * 100;

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        {exerciseName && (
          <h3 className="text-lg font-semibold text-center">{exerciseName}</h3>
        )}
        
        <div className="space-y-2">
          <Label>Rest Time (seconds)</Label>
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
          />
        </div>

        <div className="text-center">
          <div className={`text-6xl font-bold tabular-nums ${
            seconds <= 3 && seconds > 0 ? 'text-destructive animate-pulse' : ''
          }`}>
            {formatTime(seconds)}
          </div>
          <Progress value={progress} className="mt-4" />
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="w-32"
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
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            size="lg"
            variant="outline"
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
        </div>

        {seconds === 0 && (
          <div className="text-center text-lg font-semibold text-primary animate-pulse">
            Rest Complete! 💪
          </div>
        )}
      </CardContent>
    </Card>
  );
};
