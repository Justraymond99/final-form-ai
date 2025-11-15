import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useBodyMeasurements } from "@/hooks/useBodyMeasurements";
import { Navigation } from "@/components/Navigation";
import { format } from "date-fns";
import { Ruler, TrendingUp, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const BodyMeasurements = () => {
  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [arms, setArms] = useState("");
  const [thighs, setThighs] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const { measurements, addMeasurement, loading } = useBodyMeasurements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMeasurement({
        weight_kg: weight ? parseFloat(weight) : undefined,
        chest_cm: chest ? parseFloat(chest) : undefined,
        waist_cm: waist ? parseFloat(waist) : undefined,
        hips_cm: hips ? parseFloat(hips) : undefined,
        arms_cm: arms ? parseFloat(arms) : undefined,
        thighs_cm: thighs ? parseFloat(thighs) : undefined,
        body_fat_percent: bodyFat ? parseFloat(bodyFat) : undefined,
        notes: notes || undefined,
      });
      toast({
        title: "Measurement logged! 📏",
        description: "Your progress has been recorded",
      });
      // Reset form
      setWeight("");
      setChest("");
      setWaist("");
      setHips("");
      setArms("");
      setThighs("");
      setBodyFat("");
      setNotes("");
    } catch (error) {
      toast({
        title: "Error logging measurement",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const chartData = measurements
    .slice()
    .reverse()
    .slice(-10)
    .map((m) => ({
      date: format(new Date(m.date), "MMM d"),
      weight: m.weight_kg || 0,
      waist: m.waist_cm || 0,
      chest: m.chest_cm || 0,
    }));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Body Measurements</h1>
          <p className="text-muted-foreground">Track your physical progress over time</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Log Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Log Measurements
              </CardTitle>
              <CardDescription>Enter today's measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="70.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bodyFat">Body Fat %</Label>
                    <Input
                      id="bodyFat"
                      type="number"
                      step="0.1"
                      value={bodyFat}
                      onChange={(e) => setBodyFat(e.target.value)}
                      placeholder="15.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chest">Chest (cm)</Label>
                    <Input
                      id="chest"
                      type="number"
                      step="0.1"
                      value={chest}
                      onChange={(e) => setChest(e.target.value)}
                      placeholder="95.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waist">Waist (cm)</Label>
                    <Input
                      id="waist"
                      type="number"
                      step="0.1"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      placeholder="80.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hips">Hips (cm)</Label>
                    <Input
                      id="hips"
                      type="number"
                      step="0.1"
                      value={hips}
                      onChange={(e) => setHips(e.target.value)}
                      placeholder="90.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arms">Arms (cm)</Label>
                    <Input
                      id="arms"
                      type="number"
                      step="0.1"
                      value={arms}
                      onChange={(e) => setArms(e.target.value)}
                      placeholder="35.0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thighs">Thighs (cm)</Label>
                  <Input
                    id="thighs"
                    type="number"
                    step="0.1"
                    value={thighs}
                    onChange={(e) => setThighs(e.target.value)}
                    placeholder="55.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How are you feeling today?"
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Log Measurements
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
                  Progress Trends
                </CardTitle>
                <CardDescription>Last 10 measurements</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" name="Weight (kg)" />
                      <Line type="monotone" dataKey="waist" stroke="hsl(var(--accent))" name="Waist (cm)" />
                      <Line type="monotone" dataKey="chest" stroke="hsl(var(--secondary))" name="Chest (cm)" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Ruler className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No measurements yet</p>
                    <p className="text-sm mt-1">Start tracking to see your progress</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Measurements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Measurements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {measurements.slice(0, 5).map((m) => (
                    <div key={m.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">{format(new Date(m.date), "MMM d, yyyy")}</span>
                        {m.weight_kg && <span className="text-primary">{m.weight_kg} kg</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                        {m.chest_cm && <div>Chest: {m.chest_cm}cm</div>}
                        {m.waist_cm && <div>Waist: {m.waist_cm}cm</div>}
                        {m.arms_cm && <div>Arms: {m.arms_cm}cm</div>}
                      </div>
                    </div>
                  ))}
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

export default BodyMeasurements;
