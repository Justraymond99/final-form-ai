import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileJson, FileSpreadsheet, Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useToast } from "@/hooks/use-toast";
import { analytics } from "@/lib/analytics";

type ExportFormat = "csv" | "json";

const DATA_CATEGORIES = [
  { id: "workouts", label: "Workout Sessions", table: "workout_sessions" },
  { id: "food_logs", label: "Food Logs", table: "food_logs" },
  { id: "water_logs", label: "Water Logs", table: "water_logs" },
  { id: "body_measurements", label: "Body Measurements", table: "body_measurements" },
  { id: "personal_records", label: "Personal Records", table: "personal_records" },
  { id: "goals", label: "Goals", table: "goals" },
  { id: "daily_tracking", label: "Daily Tracking", table: "daily_tracking" },
  { id: "achievements", label: "Achievements", table: "achievements" },
] as const;

export const DataExport = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    DATA_CATEGORIES.map((c) => c.id)
  );
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [isExporting, setIsExporting] = useState(false);

  const toggleCategory = (id: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, id] : prev.filter((c) => c !== id)
    );
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toCsv = (data: any[]): string => {
    if (!data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          const str = typeof val === "object" ? JSON.stringify(val) : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  };

  const handleExport = async () => {
    if (!user || selectedCategories.length === 0) return;

    setIsExporting(true);
    const exportData: Record<string, any[]> = {};

    try {
      for (const cat of DATA_CATEGORIES.filter((c) =>
        selectedCategories.includes(c.id)
      )) {
        const { data, error } = await supabase
          .from(cat.table as any)
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error(`Error exporting ${cat.table}:`, error);
          continue;
        }
        if (data && data.length > 0) {
          exportData[cat.id] = data;
        }
      }

      const timestamp = new Date().toISOString().slice(0, 10);

      if (format === "json") {
        const content = JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            userId: user.id,
            data: exportData,
          },
          null,
          2
        );
        downloadFile(content, `final-form-export-${timestamp}.json`, "application/json");
      } else {
        for (const [key, rows] of Object.entries(exportData)) {
          const csv = toCsv(rows);
          if (csv) {
            downloadFile(csv, `final-form-${key}-${timestamp}.csv`, "text/csv");
          }
        }
      }

      analytics.dataExported(format);

      toast({
        title: "Export complete",
        description: `${Object.keys(exportData).length} data categories exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting your data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Export Your Data
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Shield className="h-3 w-3" />
          Download a copy of all your fitness data (GDPR compliant)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex gap-3">
          <Button
            variant={format === "csv" ? "default" : "outline"}
            size="sm"
            onClick={() => setFormat("csv")}
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button
            variant={format === "json" ? "default" : "outline"}
            size="sm"
            onClick={() => setFormat("json")}
          >
            <FileJson className="h-4 w-4 mr-1" />
            JSON
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {DATA_CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox
                id={`export-${cat.id}`}
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={(checked) =>
                  toggleCategory(cat.id, checked as boolean)
                }
              />
              <Label htmlFor={`export-${cat.id}`} className="text-sm">
                {cat.label}
              </Label>
            </div>
          ))}
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting || selectedCategories.length === 0}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export {selectedCategories.length} Categories
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
