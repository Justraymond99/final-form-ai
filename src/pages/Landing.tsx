import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Dumbbell, 
  Apple, 
  Target, 
  Trophy, 
  Zap, 
  Users, 
  Star,
  Download,
  ArrowRight,
  CheckCircle,
  Utensils,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const features = [
    {
      icon: <Dumbbell className="h-8 w-8 text-primary" />,
      title: "AI Workout Generator",
      description: "Get personalized workouts tailored to your fitness level, goals, and available equipment."
    },
    {
      icon: <Utensils className="h-8 w-8 text-accent" />,
      title: "Smart Nutrition Planning",
      description: "AI-powered meal plans that adapt to your dietary preferences and fitness goals."
    },
    {
      icon: <Activity className="h-8 w-8 text-secondary" />,
      title: "Progress Tracking",
      description: "Track workouts, nutrition, hydration, and see your fitness journey unfold with detailed analytics."
    },
    {
      icon: <Trophy className="h-8 w-8 text-primary" />,
      title: "Achievement System",
      description: "Stay motivated with achievements, streaks, and milestone rewards."
    },
    {
      icon: <Target className="h-8 w-8 text-accent" />,
      title: "Personalized Goals",
      description: "Set and track custom fitness goals with intelligent progress recommendations."
    },
    {
      icon: <Zap className="h-8 w-8 text-secondary" />,
      title: "Voice Food Logger",
      description: "Log meals instantly with voice commands powered by AI speech recognition."
    }
  ];

  const testimonials = [
    {
      name: "James Bishop",
      role: "Fitness Enthusiast",
      content: "This app completely transformed my workout routine. The AI recommendations are spot-on!",
      rating: 5
    },
    {
      name: "Kelvin Dodzi",
      role: "Busy Professional",
      content: "Finally an app that understands my schedule. Quick workouts that actually work.",
      rating: 5
    },
    {
      name: "Calvin Costa",
      role: "Beginner",
      content: "Perfect for someone just starting their fitness journey. Very intuitive and motivating.",
      rating: 5
    }
  ];

  const handleGetStarted = () => {
    navigate("/auth");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email signup for updates
    console.log("Email signup:", email);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/final-form-logo.png" alt="Final Form Logo" className="h-8 w-8" />
            <span className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
              Final Form
            </span>
          </div>
          <Button onClick={handleGetStarted} className="gradient-primary hover:opacity-90">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-br from-background via-card to-background">
        <div className="max-w-4xl mx-auto space-y-8">
          <Badge variant="outline" className="border-primary/50 text-primary bg-card">
            <Smartphone className="mr-2 h-4 w-4" />
            Now Available for iOS & Android
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold gradient-primary bg-clip-text text-transparent leading-tight">
            Helping you reach your Final Form
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your fitness journey with personalized AI-powered workouts, smart nutrition planning, 
            and intelligent progress tracking. All in one beautiful mobile app.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="h-14 px-8 gradient-primary hover:opacity-90 text-lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Start Your Journey
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Apple className="h-6 w-6 text-primary" />
                <span className="text-sm text-primary">iOS</span>
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="h-6 w-6 text-primary" />
                <span className="text-sm text-primary">Android</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Everything You Need to 
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered platform combines cutting-edge technology with proven fitness science 
              to deliver a truly personalized experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section className="py-20 px-4 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Loved by 
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Thousands</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users have to say about their fitness transformation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-card/30 via-background to-card/30">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">
            Ready to Transform Your
            <span className="gradient-primary bg-clip-text text-transparent"> Fitness Journey?</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who have already discovered the power of AI-driven fitness coaching.
          </p>
          
          <div className="space-y-6">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="h-16 px-12 gradient-primary hover:opacity-90 text-lg"
            >
              <Download className="mr-3 h-6 w-6" />
              Download Now - It's Free
            </Button>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Free to download</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Available on all devices</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <img src="/final-form-logo.png" alt="Final Form Logo" className="h-8 w-8" />
              <span className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
                Final Form
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="mailto:support@finalform.app" className="text-muted-foreground hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/10 text-center text-sm text-muted-foreground">
            <p>© 2024 Final Form. All rights reserved. Your AI-powered fitness companion.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;