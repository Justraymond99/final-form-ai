import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { supabase } from "@/integrations/supabase/client";

interface VoiceFoodLoggerProps {
  onFoodLogged: () => void;
}

export const VoiceFoodLogger = ({ onFoodLogged }: VoiceFoodLoggerProps) => {
  const [open, setOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { toast } = useToast();
  const { user } = useSecureAuth();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = processAudio;

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      toast({ title: "Error", description: "Could not access microphone", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    setIsProcessing(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        if (!base64Audio) {
          throw new Error("Failed to convert audio to base64");
        }

        // Send to speech-to-text function
        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { audio: base64Audio }
        });

        if (error) throw error;

        const transcriptText = data?.text || "";
        setTranscript(transcriptText);

        if (transcriptText) {
          // Parse the transcript and try to extract food information
          await parseAndLogFood(transcriptText);
        } else {
          toast({ title: "No speech detected", description: "Please try speaking more clearly", variant: "destructive" });
        }
      };
    } catch (error) {
      console.error('Voice processing error:', error);
      toast({ title: "Error", description: "Failed to process voice input", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const parseAndLogFood = async (text: string) => {
    if (!user) return;

    try {
      // Use AI to parse the food description
      const { data, error } = await supabase.functions.invoke('parse-food-voice', {
        body: { description: text }
      });

      if (error) throw error;

      const foodData = data?.food;
      if (foodData) {
        // Log the parsed food
        const { error: logError } = await supabase
          .from('food_logs')
          .insert({
            user_id: user.id,
            food_name: foodData.name,
            quantity: foodData.quantity || 1,
            unit: foodData.unit || "serving",
            calories: foodData.calories || 0,
            protein_g: foodData.protein || 0,
            carbs_g: foodData.carbs || 0,
            fat_g: foodData.fat || 0,
            fiber_g: foodData.fiber || 0,
            sugar_g: foodData.sugar || 0,
            sodium_mg: foodData.sodium || 0,
            meal_type: foodData.meal_type || "snacks",
            logged_at: new Date().toISOString()
          });

        if (logError) throw logError;

        toast({ 
          title: "Food logged via voice!", 
          description: `Added ${foodData.name} to your log` 
        });
        
        onFoodLogged();
        setOpen(false);
        setTranscript("");
      } else {
        toast({ 
          title: "Couldn't parse food", 
          description: "Please try describing your food more specifically",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Food parsing error:', error);
      toast({ 
        title: "Error parsing food", 
        description: "Please try again or log manually",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="h-16 border-primary/20 hover:bg-primary/5"
        >
          <div className="flex flex-col items-center gap-1">
            <Mic className="h-5 w-5" />
            <span className="text-sm">Voice</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Voice Food Logger</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center space-y-4">
            {!isRecording && !isProcessing && (
              <p className="text-muted-foreground">
                Tap the microphone and describe what you ate.
                <br />
                Example: "I had two slices of pizza for lunch"
              </p>
            )}
            
            {isRecording && (
              <p className="text-primary font-medium">
                🎤 Recording... Describe your food
              </p>
            )}
            
            {isProcessing && (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing your voice...</span>
              </div>
            )}

            {transcript && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Heard:</p>
                <p className="text-sm">{transcript}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            {!isRecording ? (
              <Button 
                onClick={startRecording}
                disabled={isProcessing}
                className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90"
              >
                <Mic className="h-8 w-8" />
              </Button>
            ) : (
              <Button 
                onClick={stopRecording}
                variant="destructive"
                className="w-20 h-20 rounded-full"
              >
                <MicOff className="h-8 w-8" />
              </Button>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};