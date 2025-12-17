import { ArrowLeft, Mail, MessageCircle, FileText, Shield, HelpCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";

const Support = () => {
  const navigate = useNavigate();

  const supportOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 24-48 hours",
      action: () => window.open("mailto:support@final-form-ai.com", "_blank"),
      buttonText: "Send Email",
    },
    {
      icon: MessageCircle,
      title: "FAQ",
      description: "Find answers to common questions",
      action: () => document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" }),
      buttonText: "View FAQ",
    },
  ];

  const faqItems = [
    {
      question: "How do I delete my account?",
      answer: "You can delete your account from Settings > Profile > Delete Account. This will permanently remove all your data including workouts, nutrition logs, and progress photos.",
    },
    {
      question: "How do I cancel my subscription?",
      answer: "Go to Settings > Subscription to manage or cancel your subscription. If you subscribed through the App Store, you'll need to cancel through your Apple ID settings.",
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use industry-standard encryption for all data transmission and storage. Your personal health data is never sold to third parties.",
    },
    {
      question: "How do I export my data?",
      answer: "Go to Settings > Export Data to download all your workout history, nutrition logs, and measurements in a portable format.",
    },
    {
      question: "Can I use the app offline?",
      answer: "Yes, most features work offline. Your data will sync automatically when you're back online.",
    },
    {
      question: "How does the AI workout generator work?",
      answer: "Our AI analyzes your fitness goals, experience level, and preferences to create personalized workout plans. It adapts based on your progress over time.",
    },
    {
      question: "What should I do if I experience a bug?",
      answer: "Please email us at support@final-form-ai.com with a description of the issue, your device model, and iOS version. Screenshots are helpful!",
    },
    {
      question: "How do I restore my purchases?",
      answer: "Go to Settings > Subscription > Restore Purchases. Make sure you're signed in with the same Apple ID used for the original purchase.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-6 space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground">
            We're here to help you get the most out of Final Form
          </p>
        </div>

        {/* Support Options */}
        <div className="grid gap-4 md:grid-cols-2">
          {supportOptions.map((option) => (
            <Card key={option.title} className="hover:bg-accent/5 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <option.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={option.action} variant="outline" className="w-full">
                  {option.buttonText}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Legal & Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/privacy-policy" className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent/10 transition-colors">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Privacy Policy</span>
            </Link>
            <Link to="/terms-of-service" className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent/10 transition-colors">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Terms of Service</span>
            </Link>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div id="faq-section" className="space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="font-semibold">Still need help?</h3>
              <p className="text-muted-foreground text-sm">
                Our support team typically responds within 24-48 hours
              </p>
              <Button onClick={() => window.open("mailto:support@final-form-ai.com", "_blank")}>
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Version */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Final Form v1.0.0</p>
          <p>© {new Date().getFullYear()} Final Form. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Support;
