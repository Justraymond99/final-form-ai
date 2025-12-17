import { useState } from "react";
import { Search, Dumbbell, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatLabel } from "@/lib/utils";

const ExerciseLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const filteredExercises = exercises?.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = muscleFilter === 'all' || 
                         exercise.muscle_groups?.includes(muscleFilter);
    const matchesDifficulty = difficultyFilter === 'all' || 
                             exercise.difficulty === difficultyFilter;
    
    return matchesSearch && matchesMuscle && matchesDifficulty;
  });

  const muscleGroups = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 
    'quads', 'hamstrings', 'glutes', 'calves', 'core', 'cardio'
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Exercise Library</h1>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={muscleFilter} onValueChange={setMuscleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Muscle Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Muscles</SelectItem>
                  {muscleGroups.map(muscle => (
                    <SelectItem key={muscle} value={muscle} className="capitalize">
                      {muscle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">Loading exercises...</div>
        ) : filteredExercises && filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedExercise(exercise)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    {exercise.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {exercise.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {exercise.muscle_groups?.slice(0, 3).map((muscle: string) => (
                      <Badge key={muscle} variant="secondary" className="text-xs capitalize">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm">
                    <Badge variant="outline">
                      {formatLabel(exercise.difficulty)}
                    </Badge>
                    <span className="text-muted-foreground">
                      {formatLabel(exercise.exercise_type)}
                    </span>
                  </div>
                  {exercise.equipment && exercise.equipment.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Equipment: {exercise.equipment.join(', ')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No exercises found</p>
              <p className="text-muted-foreground">
                {searchTerm || muscleFilter !== 'all' || difficultyFilter !== 'all'
                  ? "Try adjusting your filters"
                  : "The exercise library is empty"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedExercise.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedExercise.description}</p>
                </div>

                {selectedExercise.instructions && (
                  <div>
                    <h3 className="font-semibold mb-2">Instructions</h3>
                    <p className="text-muted-foreground">{selectedExercise.instructions}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Target Muscles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.muscle_groups?.map((muscle: string) => (
                      <Badge key={muscle} className="capitalize">{muscle}</Badge>
                    ))}
                  </div>
                </div>

                {selectedExercise.equipment && selectedExercise.equipment.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Equipment Needed</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.equipment.map((eq: string) => (
                        <Badge key={eq} variant="outline" className="capitalize">{eq}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Difficulty</h3>
                    <Badge>{formatLabel(selectedExercise.difficulty)}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Type</h3>
                    <Badge variant="secondary" className="capitalize">
                      {selectedExercise.exercise_type}
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Navigation />
    </div>
  );
};

export default ExerciseLibrary;
