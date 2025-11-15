import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePersonalRecords } from "@/hooks/usePersonalRecords";
import { Navigation } from "@/components/Navigation";
import { format } from "date-fns";
import { Trophy, TrendingUp, Plus, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PersonalRecords = () => {
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const { toast } = useToast();
  const { records, addRecord, loading } = usePersonalRecords();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise || !weight || !reps) {
      toast({
        title: "Missing information",
        description: "Please fill in exercise, weight, and reps",
        variant: "destructive",
      });
      return;
    }

    try {
      await addRecord({
        exercise_name: exercise,
        weight_kg: parseFloat(weight),
        reps: parseInt(reps),
        notes: notes || undefined,
      });
      toast({
        title: "New PR recorded! 🏆",
        description: `${exercise}: ${weight}kg x ${reps} reps`,
      });
      setExercise("");
      setWeight("");
      setReps("");
      setNotes("");
    } catch (error) {
      toast({
        title: "Error logging PR",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Group records by exercise
  const exerciseGroups = records.reduce((acc, record) => {
    if (!acc[record.exercise_name]) {
      acc[record.exercise_name] = [];
    }
    acc[record.exercise_name].push(record);
    return acc;
  }, {} as Record<string, typeof records>);

  const chartData = selectedExercise && exerciseGroups[selectedExercise]
    ? exerciseGroups[selectedExercise]
        .slice()
        .reverse()
        .slice(-10)
        .map((r) => ({
          date: format(new Date(r.recorded_at), "MMM d"),
          weight: r.weight_kg,
          reps: r.reps,
        }))
    : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Personal Records</h1>
          <p className="text-muted-foreground">Track your strength progress and celebrate PRs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Log PR Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Log New PR
              </CardTitle>
              <CardDescription>Record your personal best</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exercise">Exercise Name</Label>
                  <Input
                    id="exercise"
                    value={exercise}
                    onChange={(e) => setExercise(e.target.value)}
                    placeholder="Bench Press"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="100"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reps">Reps</Label>
                    <Input
                      id="reps"
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      placeholder="5"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did it feel?"
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Log PR
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Progress Chart */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Strength Progression
                </CardTitle>
                <CardDescription>
                  {selectedExercise || "Select an exercise to view progress"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        name="Weight (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No PRs logged yet</p>
                    <p className="text-sm mt-1">Start tracking to see your progress</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exercise List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Your PRs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {Object.entries(exerciseGroups).map(([exerciseName, exerciseRecords]) => {
                    const latest = exerciseRecords[0];
                    const best = exerciseRecords.reduce((max, r) =>
                      r.weight_kg * r.reps > max.weight_kg * max.reps ? r : max
                    );
                    return (
                      <button
                        key={exerciseName}
                        onClick={() => setSelectedExercise(exerciseName)}
                        className={`w-full p-3 rounded-lg border transition-all text-left ${
                          selectedExercise === exerciseName
                            ? "bg-primary/10 border-primary"
                            : "bg-card border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{exerciseName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Best: {best.weight_kg}kg x {best.reps} reps
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <div className="text-muted-foreground">Latest</div>
                            <div className="font-semibold text-primary">
                              {latest.weight_kg}kg x {latest.reps}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {Object.keys(exerciseGroups).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No exercises logged yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default PersonalRecords;
