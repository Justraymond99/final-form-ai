import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ParsedFood {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  meal_type: string;
}

interface VoiceFoodLoggerProps {
  onFoodParsed: (food: ParsedFood) => void;
  selectedMeal: string;
}

export const VoiceFoodLogger = ({ onFoodParsed, selectedMeal }: VoiceFoodLoggerProps) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        await processAudio();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscript("");

      toast({
        title: "Recording started",
        description: "Describe what you ate...",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) {
      toast({
        title: "No audio",
        description: "No audio was recorded. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Convert audio to base64
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      );

      // Transcribe audio
      const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });

      if (transcribeError) throw transcribeError;

      const transcribedText = transcribeData.text;
      if (!transcribedText) {
        throw new Error("Could not transcribe audio");
      }

      setTranscript(transcribedText);

      // Add meal context to the description
      const descriptionWithContext = `${transcribedText} (for ${selectedMeal})`;

      // Parse the food description
      const { data: parseData, error: parseError } = await supabase.functions.invoke('parse-food-voice', {
        body: { description: descriptionWithContext }
      });

      if (parseError) throw parseError;

      if (parseData.food) {
        onFoodParsed({
          ...parseData.food,
          meal_type: selectedMeal
        });
        
        toast({
          title: "Food recognized!",
          description: `Found: ${parseData.food.name}`,
        });
      } else {
        throw new Error("Could not parse food from description");
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/30">
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="text-center">
            <h3 className="font-medium text-sm">Voice Food Logger</h3>
            <p className="text-xs text-muted-foreground">
              Say what you ate, e.g. "I had a chicken sandwich with fries"
            </p>
          </div>

          <Button
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            className={`rounded-full h-16 w-16 ${isRecording ? 'animate-pulse' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            {isProcessing ? "Processing..." : isRecording ? "Tap to stop" : "Tap to speak"}
          </p>

          {transcript && (
            <div className="w-full mt-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Heard:</p>
              <p className="text-sm">{transcript}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
