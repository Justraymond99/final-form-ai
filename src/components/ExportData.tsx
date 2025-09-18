import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PremiumGate } from "@/components/PremiumGate";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, Table, Calendar, TrendingUp } from "lucide-react";

interface ExportOptions {
  workouts: boolean;
  nutrition: boolean;
  progress: boolean;
  goals: boolean;
  achievements: boolean;
  dailyStats: boolean;
}

export const ExportData = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    workouts: true,
    nutrition: true,
    progress: true,
    goals: false,
    achievements: false,
    dailyStats: false
  });
  const [format, setFormat] = useState<"csv" | "json" | "pdf">("csv");
  const [dateRange, setDateRange] = useState<"all" | "30" | "90" | "365">("90");
  const [loading, setLoading] = useState(false);

  const toggleOption = (key: keyof ExportOptions) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const generateCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(','))
    ].join('\n');
    
    return csvContent;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportData = async () => {
    if (!user) return;

    const selectedOptions = Object.entries(exportOptions)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key);

    if (selectedOptions.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one data type to export",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const exportData: any = {};
      const dateFilter = dateRange === "all" ? null : 
        new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString();

      // Export workouts
      if (exportOptions.workouts) {
        const query = supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', user.id);
        
        if (dateFilter) {
          query.gte('created_at', dateFilter);
        }

        const { data, error } = await query;
        if (error) throw error;
        exportData.workouts = data;
      }

      // Export nutrition data
      if (exportOptions.nutrition) {
        const query = supabase
          .from('food_logs')
          .select('*')
          .eq('user_id', user.id);
        
        if (dateFilter) {
          query.gte('logged_at', dateFilter);
        }

        const { data, error } = await query;
        if (error) throw error;
        exportData.nutrition = data;
      }

      // Export daily tracking/progress
      if (exportOptions.progress) {
        const query = supabase
          .from('daily_tracking')
          .select('*')
          .eq('user_id', user.id);
        
        if (dateFilter) {
          query.gte('date', dateFilter.split('T')[0]);
        }

        const { data, error } = await query;
        if (error) throw error;
        exportData.progress = data;
      }

      // Export goals
      if (exportOptions.goals) {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id);
        if (error) throw error;
        exportData.goals = data;
      }

      // Export achievements
      if (exportOptions.achievements) {
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id);
        if (error) throw error;
        exportData.achievements = data;
      }

      // Generate file based on format
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `final-form-export-${timestamp}`;

      if (format === "json") {
        const jsonContent = JSON.stringify(exportData, null, 2);
        downloadFile(jsonContent, `${filename}.json`, 'application/json');
      } else if (format === "csv") {
        // Create separate CSV files for each data type
        const zip = selectedOptions.length > 1;
        
        for (const [key, data] of Object.entries(exportData)) {
          if (Array.isArray(data) && data.length > 0) {
            const headers = Object.keys(data[0]);
            const csvContent = generateCSV(data, headers);
            downloadFile(csvContent, `${filename}-${key}.csv`, 'text/csv');
          }
        }
      } else if (format === "pdf") {
        // For PDF, we'll create a summary report
        const reportContent = `
Final Form - Fitness Data Export Report
Generated: ${new Date().toLocaleDateString()}
Date Range: ${dateRange === "all" ? "All time" : `Last ${dateRange} days`}

${Object.entries(exportData).map(([key, data]) => 
  `${key.toUpperCase()}: ${Array.isArray(data) ? data.length : 0} records`
).join('\n')}

Note: Detailed data exported as separate CSV files.
        `;
        downloadFile(reportContent, `${filename}-summary.txt`, 'text/plain');
        
        // Also export as CSV for detailed data
        for (const [key, data] of Object.entries(exportData)) {
          if (Array.isArray(data) && data.length > 0) {
            const headers = Object.keys(data[0]);
            const csvContent = generateCSV(data, headers);
            downloadFile(csvContent, `${filename}-${key}.csv`, 'text/csv');
          }
        }
      }

      toast({
        title: "Success",
        description: `Your fitness data has been exported successfully!`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumGate 
      feature="Export Data" 
      description="Export all your fitness data including workouts, nutrition logs, progress tracking, and achievements in multiple formats."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Your Fitness Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Benefits */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Why Export Your Data?</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Keep personal backups of your fitness journey</li>
                <li>• Analyze your data in external tools</li>
                <li>• Share progress with trainers or nutritionists</li>
                <li>• Migrate to other fitness platforms</li>
                <li>• Create custom reports and visualizations</li>
              </ul>
            </div>

            {/* Data Selection */}
            <div className="space-y-4">
              <h4 className="font-semibold">Select Data to Export</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="workouts"
                    checked={exportOptions.workouts}
                    onCheckedChange={() => toggleOption('workouts')}
                  />
                  <label htmlFor="workouts" className="text-sm font-medium leading-none">
                    Workouts & Sessions
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nutrition"
                    checked={exportOptions.nutrition}
                    onCheckedChange={() => toggleOption('nutrition')}
                  />
                  <label htmlFor="nutrition" className="text-sm font-medium leading-none">
                    Nutrition Logs
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="progress"
                    checked={exportOptions.progress}
                    onCheckedChange={() => toggleOption('progress')}
                  />
                  <label htmlFor="progress" className="text-sm font-medium leading-none">
                    Daily Progress
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="goals"
                    checked={exportOptions.goals}
                    onCheckedChange={() => toggleOption('goals')}
                  />
                  <label htmlFor="goals" className="text-sm font-medium leading-none">
                    Goals & Targets
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="achievements"
                    checked={exportOptions.achievements}
                    onCheckedChange={() => toggleOption('achievements')}
                  />
                  <label htmlFor="achievements" className="text-sm font-medium leading-none">
                    Achievements
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dailyStats"
                    checked={exportOptions.dailyStats}
                    onCheckedChange={() => toggleOption('dailyStats')}
                  />
                  <label htmlFor="dailyStats" className="text-sm font-medium leading-none">
                    Daily Statistics
                  </label>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Export Format</Label>
                <Select value={format} onValueChange={(value: "csv" | "json" | "pdf") => setFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4" />
                        CSV (Spreadsheet)
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        JSON (Raw Data)
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        PDF Report + CSV
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={(value: "all" | "30" | "90" | "365") => setDateRange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 3 Months</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Format Info */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h5 className="font-semibold mb-2">Format Information</h5>
                <div className="text-sm space-y-1">
                  {format === "csv" && (
                    <p>CSV files can be opened in Excel, Google Sheets, or any spreadsheet application for easy analysis.</p>
                  )}
                  {format === "json" && (
                    <p>JSON format preserves all data relationships and is ideal for developers or advanced analysis tools.</p>
                  )}
                  {format === "pdf" && (
                    <p>PDF provides a summary report plus CSV files with detailed data for comprehensive documentation.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Export Button */}
            <Button 
              onClick={exportData} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              {loading ? "Exporting..." : "Export Selected Data"}
            </Button>

            {/* Privacy Note */}
            <div className="text-xs text-muted-foreground text-center">
              Your data is exported securely and remains completely private. 
              No data is sent to external servers during the export process.
            </div>
          </CardContent>
        </Card>
      </div>
    </PremiumGate>
  );
};