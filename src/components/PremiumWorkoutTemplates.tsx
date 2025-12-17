import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PremiumGate } from "@/components/PremiumGate";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatLabel } from "@/lib/utils";
import { Star, Clock, Target, Zap, Play, Save } from "lucide-react";

interface PremiumTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  difficulty: string;
  estimated_duration: number;
  exercises: any[];
  category: string;
  features: string[];
  is_premium: boolean;
}

const premiumTemplates: PremiumTemplate[] = [
  {
    id: "premium-1",
    name: "Elite Athlete Performance",
    type: "performance",
    description: "Advanced training protocol used by professional athletes for peak performance",
    difficulty: "expert",
    estimated_duration: 90,
    category: "Elite Training",
    features: ["Olympic Movements", "Plyometrics", "Sport-Specific", "Recovery Protocols"],
    is_premium: false,
    exercises: [
      { name: "Clean & Jerk", sets: 5, reps: "3", rest: 300, weight: "85% 1RM" },
      { name: "Snatch", sets: 5, reps: "2", rest: 300, weight: "87% 1RM" },
      { name: "Box Jump", sets: 4, reps: "6", rest: 120, height: "36\"" },
      { name: "Sprint Intervals", sets: 8, reps: "30 sec", rest: 90, intensity: "95%" },
      { name: "Recovery Stretch", sets: 1, reps: "15 min", rest: 0 }
    ]
  },
  {
    id: "premium-2",
    name: "Metabolic Conditioning Master",
    type: "metcon",
    description: "High-intensity metabolic conditioning for maximum fat burn and endurance",
    difficulty: "advanced",
    estimated_duration: 45,
    category: "Fat Loss",
    features: ["HIIT Circuits", "Metabolic Boost", "Time-Based", "Equipment Minimal"],
    is_premium: false,
    exercises: [
      { name: "Burpee Box Jump Over", sets: 5, reps: "45 sec", rest: 15 },
      { name: "Kettlebell Swings", sets: 5, reps: "45 sec", rest: 15 },
      { name: "Mountain Climbers", sets: 5, reps: "45 sec", rest: 15 },
      { name: "Battle Ropes", sets: 5, reps: "45 sec", rest: 15 },
      { name: "Plank to Push-up", sets: 5, reps: "45 sec", rest: 60 }
    ]
  },
  {
    id: "premium-3",
    name: "Powerlifting Specialization",
    type: "powerlifting",
    description: "Periodized powerlifting program for strength gains in squat, bench, and deadlift",
    difficulty: "advanced",
    estimated_duration: 120,
    category: "Strength",
    features: ["Periodization", "1RM Testing", "Accessory Work", "Competition Prep"],
    is_premium: false,
    exercises: [
      { name: "Competition Squat", sets: 6, reps: "1-3", rest: 300, notes: "Work up to opener" },
      { name: "Bench Press", sets: 6, reps: "1-3", rest: 300, notes: "Competition commands" },
      { name: "Deadlift", sets: 5, reps: "1-2", rest: 300, notes: "Singles at 90%" },
      { name: "Close-Grip Bench", sets: 4, reps: "5", rest: 180 },
      { name: "Romanian Deadlift", sets: 4, reps: "8", rest: 120 }
    ]
  },
  {
    id: "premium-4",
    name: "Gymnastic Strength Builder",
    type: "gymnastics",
    description: "Progressive bodyweight strength training inspired by gymnastic movements",
    difficulty: "intermediate",
    estimated_duration: 60,
    category: "Bodyweight",
    features: ["Progressive Skills", "Core Intensive", "Flexibility", "Movement Quality"],
    is_premium: false,
    exercises: [
      { name: "Handstand Progression", sets: 5, reps: "30 sec hold", rest: 90 },
      { name: "Ring Dips", sets: 4, reps: "8-12", rest: 120 },
      { name: "Muscle-ups (Assisted)", sets: 5, reps: "3-5", rest: 180 },
      { name: "L-Sit Progression", sets: 4, reps: "20 sec", rest: 60 },
      { name: "Hollow Body Rocks", sets: 3, reps: "30", rest: 60 }
    ]
  },
  {
    id: "premium-5",
    name: "Rehabilitation & Recovery",
    type: "recovery",
    description: "Therapeutic exercise program for injury prevention and mobility enhancement",
    difficulty: "beginner",
    estimated_duration: 40,
    category: "Recovery",
    features: ["Injury Prevention", "Mobility", "Corrective Exercise", "Pain Relief"],
    is_premium: false,
    exercises: [
      { name: "Cat-Cow Stretch", sets: 3, reps: "15", rest: 30 },
      { name: "Hip 90/90 Stretch", sets: 3, reps: "30 sec each", rest: 30 },
      { name: "Thoracic Spine Rotation", sets: 3, reps: "10 each", rest: 30 },
      { name: "Glute Activation", sets: 3, reps: "15", rest: 45 },
      { name: "Deep Breathing", sets: 3, reps: "10 breaths", rest: 60 }
    ]
  },
  {
    id: "premium-6",
    name: "Athletic Performance Stack",
    type: "athletic",
    description: "Multi-phase training for explosive power, speed, and agility development",
    difficulty: "advanced",
    estimated_duration: 75,
    category: "Sports Performance",
    features: ["Plyometrics", "Speed Training", "Agility", "Power Development"],
    is_premium: false,
    exercises: [
      { name: "Depth Jumps", sets: 4, reps: "5", rest: 180, height: "24\"" },
      { name: "Lateral Bounds", sets: 4, reps: "8 each", rest: 120 },
      { name: "Acceleration Sprints", sets: 6, reps: "20m", rest: 120 },
      { name: "Agility Ladder", sets: 4, reps: "2 patterns", rest: 90 },
      { name: "Medicine Ball Slams", sets: 4, reps: "10", rest: 90 }
    ]
  }
];

export const PremiumWorkoutTemplates = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<PremiumTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const saveTemplate = async (template: PremiumTemplate) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('workout_templates')
        .insert({
          user_id: user.id,
          name: template.name,
          type: template.type,
          description: template.description,
          difficulty: template.difficulty,
          estimated_duration: template.estimated_duration,
          exercises: template.exercises
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${template.name} has been added to your workout templates!`
      });

      setShowPreview(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save workout template",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = async (template: PremiumTemplate) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          name: template.name,
          exercises_data: template.exercises,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Workout Started",
        description: `Started ${template.name} - Time to train!`
      });

      // In a real app, this would navigate to the workout session
      setShowPreview(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error starting workout:', error);
      toast({
        title: "Error",
        description: "Failed to start workout",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-orange-100 text-orange-800";
      case "expert": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <PremiumGate 
      feature="Premium Workout Templates" 
      description="Access exclusive, professionally designed workout templates created by certified trainers and sports scientists."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Premium Workout Templates
              <Badge className="bg-gradient-primary text-background">
                Exclusive
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Professional-Grade Templates</h4>
              <p className="text-sm text-muted-foreground">
                These exclusive templates are designed by certified trainers and sports scientists, 
                featuring advanced techniques and periodization strategies used by elite athletes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {premiumTemplates.map((template) => (
                <Card key={template.id} className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {formatLabel(template.difficulty)}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="border-primary text-primary">
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {template.estimated_duration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {template.exercises.length} exercises
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}
                      className="w-full"
                      variant="outline"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedTemplate && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedTemplate.name}
                    <Badge className="bg-gradient-primary text-background">
                      Premium
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedTemplate.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="font-semibold">{selectedTemplate.estimated_duration} min</div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                    <div>
                      <div className="font-semibold">{formatLabel(selectedTemplate.difficulty)}</div>
                      <div className="text-sm text-muted-foreground">Difficulty</div>
                    </div>
                    <div>
                      <div className="font-semibold">{selectedTemplate.exercises.length}</div>
                      <div className="text-sm text-muted-foreground">Exercises</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Workout Exercises</h4>
                    <div className="space-y-2">
                      {selectedTemplate.exercises.map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          <div>
                            <div className="font-medium">{exercise.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {exercise.sets} sets × {exercise.reps} reps
                              {exercise.rest && ` • ${exercise.rest}s rest`}
                              {exercise.weight && ` • ${exercise.weight}`}
                              {exercise.notes && ` • ${exercise.notes}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => startWorkout(selectedTemplate)}
                      disabled={loading}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Workout
                    </Button>
                    <Button 
                      onClick={() => saveTemplate(selectedTemplate)}
                      disabled={loading}
                      variant="outline"
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Template
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PremiumGate>
  );
};