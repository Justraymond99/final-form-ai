import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PremiumGate } from "@/components/PremiumGate";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Clock, CheckCircle, AlertCircle, Send } from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
  created_at: string;
  category: string;
}

export const PrioritySupport = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const submitTicket = async () => {
    if (!user || !subject || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would go to a support system
      // For now, we'll simulate with a local state update
      const newTicket: SupportTicket = {
        id: Date.now().toString(),
        subject,
        description,
        priority,
        status: "open",
        created_at: new Date().toISOString(),
        category
      };

      setTickets(prev => [newTicket, ...prev]);

      toast({
        title: "Success",
        description: "Your priority support ticket has been submitted! We'll respond within 4 hours.",
      });

      // Reset form
      setSubject("");
      setDescription("");
      setCategory("general");
      setPriority("medium");
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast({
        title: "Error",
        description: "Failed to submit support ticket",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "in_progress": return <Clock className="h-4 w-4 text-blue-500" />;
      case "resolved": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <PremiumGate 
      feature="Priority Support" 
      description="Get fast, personalized support with guaranteed 4-hour response time and direct access to our fitness experts."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Priority Support
              <Badge className="bg-gradient-primary text-background">
                4hr Response Time
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Support Benefits */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Premium Support Benefits</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Guaranteed 4-hour response time</li>
                <li>• Direct access to certified fitness experts</li>
                <li>• Priority queue for all requests</li>
                <li>• Detailed workout and nutrition guidance</li>
                <li>• Technical support for app features</li>
              </ul>
            </div>

            {/* Submit New Ticket */}
            <div className="space-y-4">
              <h4 className="font-semibold">Submit New Support Request</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Question</SelectItem>
                      <SelectItem value="workout">Workout Help</SelectItem>
                      <SelectItem value="nutrition">Nutrition Guidance</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing & Account</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={priority} onValueChange={(value: "high" | "medium" | "low") => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General inquiry</SelectItem>
                      <SelectItem value="medium">Medium - Need assistance</SelectItem>
                      <SelectItem value="high">High - Urgent issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your request"
                />
              </div>

              <div>
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide as much detail as possible about your question or issue..."
                  rows={5}
                />
              </div>

              <Button 
                onClick={submitTicket} 
                disabled={loading || !subject || !description}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Submitting..." : "Submit Priority Request"}
              </Button>
            </div>

            {/* Ticket History Toggle */}
            <div className="border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="w-full"
              >
                {showHistory ? "Hide" : "Show"} Support History
              </Button>
            </div>

            {/* Ticket History */}
            {showHistory && (
              <div className="space-y-4">
                <h4 className="font-semibold">Your Support Tickets</h4>
                {tickets.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      No support tickets yet. Submit your first request above!
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <Card key={ticket.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(ticket.status)}
                              <h5 className="font-medium">{ticket.subject}</h5>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {ticket.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Category: {ticket.category}</span>
                            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Need Immediate Help?</h4>
              <p className="text-sm text-muted-foreground mb-2">
                For critical issues, you can also reach us directly:
              </p>
              <div className="text-sm space-y-1">
                <div>📧 Premium Support: premium@finalform.app</div>
                <div>💬 Priority Chat: Available 9 AM - 6 PM EST</div>
                <div>📞 Emergency Line: 1-800-FITFORM (weekdays)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PremiumGate>
  );
};