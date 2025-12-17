import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useBodyMeasurements } from "@/hooks/useBodyMeasurements";
import { Navigation } from "@/components/Navigation";
import { format } from "date-fns";
import { Ruler, TrendingUp, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Conversion utilities
const kgToLbs = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;
const lbsToKg = (lbs: number) => Math.round(lbs / 2.20462 * 10) / 10;
const cmToInches = (cm: number) => Math.round(cm / 2.54 * 10) / 10;
const inchesToCm = (inches: number) => Math.round(inches * 2.54 * 10) / 10;

const BodyMeasurements = () => {
  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [arms, setArms] = useState("");
  const [thighs, setThighs] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [notes, setNotes] = useState("");
  const [useImperial, setUseImperial] = useState(true); // Default to imperial (lbs/inches)
  const { toast } = useToast();
  const { measurements, addMeasurement, loading } = useBodyMeasurements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert to metric for storage if using imperial
      const weightKg = weight 
        ? (useImperial ? lbsToKg(parseFloat(weight)) : parseFloat(weight))
        : undefined;
      const chestCm = chest
        ? (useImperial ? inchesToCm(parseFloat(chest)) : parseFloat(chest))
        : undefined;
      const waistCm = waist
        ? (useImperial ? inchesToCm(parseFloat(waist)) : parseFloat(waist))
        : undefined;
      const hipsCm = hips
        ? (useImperial ? inchesToCm(parseFloat(hips)) : parseFloat(hips))
        : undefined;
      const armsCm = arms
        ? (useImperial ? inchesToCm(parseFloat(arms)) : parseFloat(arms))
        : undefined;
      const thighsCm = thighs
        ? (useImperial ? inchesToCm(parseFloat(thighs)) : parseFloat(thighs))
        : undefined;

      await addMeasurement({
        weight_kg: weightKg,
        chest_cm: chestCm,
        waist_cm: waistCm,
        hips_cm: hipsCm,
        arms_cm: armsCm,
        thighs_cm: thighsCm,
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

  // Convert display values based on unit preference
  const displayWeight = (kg: number | null) => {
    if (!kg) return 0;
    return useImperial ? kgToLbs(kg) : kg;
  };

  const displayLength = (cm: number | null) => {
    if (!cm) return 0;
    return useImperial ? cmToInches(cm) : cm;
  };

  const weightUnit = useImperial ? "lbs" : "kg";
  const lengthUnit = useImperial ? "in" : "cm";

  const chartData = measurements
    .slice()
    .reverse()
    .slice(-10)
    .map((m) => ({
      date: format(new Date(m.date), "MMM d"),
      weight: displayWeight(m.weight_kg),
      waist: displayLength(m.waist_cm),
      chest: displayLength(m.chest_cm),
    }));

  return (
    <div className="min-h-screen bg-background pb-24">
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
              <CardDescription className="flex items-center justify-between">
                <span>Enter today's measurements</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Metric</span>
                  <Switch 
                    checked={useImperial} 
                    onCheckedChange={setUseImperial}
                  />
                  <span className="text-xs">Imperial</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight ({weightUnit})</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder={useImperial ? "155.5" : "70.5"}
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
                    <Label htmlFor="chest">Chest ({lengthUnit})</Label>
                    <Input
                      id="chest"
                      type="number"
                      step="0.1"
                      value={chest}
                      onChange={(e) => setChest(e.target.value)}
                      placeholder={useImperial ? "37.5" : "95.5"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waist">Waist ({lengthUnit})</Label>
                    <Input
                      id="waist"
                      type="number"
                      step="0.1"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      placeholder={useImperial ? "31.5" : "80.0"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hips">Hips ({lengthUnit})</Label>
                    <Input
                      id="hips"
                      type="number"
                      step="0.1"
                      value={hips}
                      onChange={(e) => setHips(e.target.value)}
                      placeholder={useImperial ? "35.4" : "90.0"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arms">Arms ({lengthUnit})</Label>
                    <Input
                      id="arms"
                      type="number"
                      step="0.1"
                      value={arms}
                      onChange={(e) => setArms(e.target.value)}
                      placeholder={useImperial ? "13.8" : "35.0"}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thighs">Thighs ({lengthUnit})</Label>
                  <Input
                    id="thighs"
                    type="number"
                    step="0.1"
                    value={thighs}
                    onChange={(e) => setThighs(e.target.value)}
                    placeholder={useImperial ? "21.7" : "55.0"}
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
                      <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" name={`Weight (${weightUnit})`} />
                      <Line type="monotone" dataKey="waist" stroke="hsl(var(--accent))" name={`Waist (${lengthUnit})`} />
                      <Line type="monotone" dataKey="chest" stroke="hsl(var(--secondary))" name={`Chest (${lengthUnit})`} />
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
                        {m.weight_kg && (
                          <span className="text-primary">
                            {displayWeight(m.weight_kg)} {weightUnit}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                        {m.chest_cm && <div>Chest: {displayLength(m.chest_cm)}{lengthUnit}</div>}
                        {m.waist_cm && <div>Waist: {displayLength(m.waist_cm)}{lengthUnit}</div>}
                        {m.arms_cm && <div>Arms: {displayLength(m.arms_cm)}{lengthUnit}</div>}
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