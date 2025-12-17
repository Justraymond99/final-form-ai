import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Sparkles, 
  Dumbbell, 
  Utensils, 
  Brain,
  Heart,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Clock,
  ChevronRight,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGenerationHistory, GenerationType, GenerationHistoryItem } from "@/hooks/useGenerationHistory";
import { WeeklyCoachInsights } from "@/components/WeeklyCoachInsights";
import { WeeklyInsights } from "@/components/WeeklyInsights";
import { format } from "date-fns";

const typeConfig: Record<GenerationType, { icon: React.ElementType; label: string; color: string }> = {
  workout: { icon: Dumbbell, label: "Workouts", color: "text-primary" },
  nutrition: { icon: Utensils, label: "Nutrition", color: "text-green-500" },
  insights: { icon: Brain, label: "AI Insights", color: "text-purple-500" },
  recovery: { icon: Heart, label: "Recovery", color: "text-red-500" },
};

const InsightHistoryCard = ({ 
  item, 
  onDelete, 
  onToggleSaved 
}: { 
  item: GenerationHistoryItem;
  onDelete: (id: string) => void;
  onToggleSaved: (id: string, saved: boolean) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[item.generation_type];
  const Icon = config.icon;

  const renderContent = () => {
    const content = item.content as Record<string, unknown>;
    
    if (item.generation_type === 'insights' && content.summary) {
      return (
        <div className="space-y-2">
          <p className="text-sm">{content.summary as string}</p>
          {content.highlights && Array.isArray(content.highlights) && (
            <div className="space-y-1">
              {(content.highlights as Array<{ text: string }>).slice(0, 3).map((h, i) => (
                <p key={i} className="text-xs text-muted-foreground">• {h.text}</p>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (item.generation_type === 'workout' && content.weeks) {
      return (
        <div className="text-sm">
          <p>{(content as { weeks: number }).weeks}-week program</p>
          {content.difficulty && <Badge variant="outline" className="mt-1">{content.difficulty as string}</Badge>}
        </div>
      );
    }

    if (item.generation_type === 'nutrition') {
      return (
        <div className="text-sm">
          <p>{content.goal as string || 'Custom nutrition plan'}</p>
          {content.targetCalories && (
            <p className="text-xs text-muted-foreground">{content.targetCalories as number} cal/day target</p>
          )}
        </div>
      );
    }

    if (item.generation_type === 'recovery') {
      return (
        <div className="text-sm">
          {content.recommendations && Array.isArray(content.recommendations) && (
            <p>{(content.recommendations as string[]).length} recommendations</p>
          )}
        </div>
      );
    }

    return <p className="text-sm text-muted-foreground">Generated content</p>;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{item.title}</h4>
                {item.is_saved && <BookmarkCheck className="h-3 w-3 text-primary" />}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Clock className="h-3 w-3" />
                {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
              </div>
              {renderContent()}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggleSaved(item.id, !item.is_saved)}
            >
              {item.is_saved ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Insights() {
  const navigate = useNavigate();
  const { history, loading, fetchHistory, deleteGeneration, toggleSaved } = useGenerationHistory();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredHistory = activeTab === "all" 
    ? history 
    : activeTab === "saved"
    ? history.filter(h => h.is_saved)
    : history.filter(h => h.generation_type === activeTab);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteGeneration(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Insights
            </h1>
            <p className="text-sm text-muted-foreground">Your personalized fitness intelligence</p>
          </div>
        </div>

        {/* Live Insights */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold">Live Insights</h2>
          <WeeklyCoachInsights />
          <WeeklyInsights />
        </div>

        {/* Generation History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Generation History</h2>
            <Button variant="ghost" size="sm" onClick={() => fetchHistory()}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
              <TabsTrigger value="workout">
                <Dumbbell className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="nutrition">
                <Utensils className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="insights">
                <Brain className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="recovery">
                <Heart className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-20 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredHistory.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-medium mb-1">No generations yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate workouts, nutrition plans, or get AI insights to see them here
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button variant="outline" size="sm" onClick={() => navigate('/workouts')}>
                        <Dumbbell className="h-4 w-4 mr-1" />
                        Generate Workout
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate('/nutrition')}>
                        <Utensils className="h-4 w-4 mr-1" />
                        Generate Meal Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3 pr-4">
                    {filteredHistory.map(item => (
                      <InsightHistoryCard
                        key={item.id}
                        item={item}
                        onDelete={setDeleteId}
                        onToggleSaved={toggleSaved}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this generation?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove this item from your history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
