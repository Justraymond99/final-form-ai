import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Activity,
  UserPlus,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSecureAuth } from "@/hooks/useSecureAuth";

const Landing = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { user, loading } = useSecureAuth();

  // Redirect logged-in users to home
  useEffect(() => {
    if (!loading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  // Show nothing while checking auth to prevent flash
  if (loading) {
    return null;
  }

  // If user is logged in, don't render (will redirect)
  if (user) {
    return null;
  }

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

  const howItWorks = [
    {
      step: 1,
      icon: <UserPlus className="h-8 w-8" />,
      title: "Create Your Profile",
      description: "Tell us about your fitness goals, experience level, and preferences. Our AI will personalize everything for you."
    },
    {
      step: 2,
      icon: <Sparkles className="h-8 w-8" />,
      title: "Get AI-Powered Plans",
      description: "Receive custom workout and nutrition plans tailored specifically to your goals and lifestyle."
    },
    {
      step: 3,
      icon: <Dumbbell className="h-8 w-8" />,
      title: "Track Your Workouts",
      description: "Log exercises, track progress, and let the app guide you through each session with timers and tips."
    },
    {
      step: 4,
      icon: <TrendingUp className="h-8 w-8" />,
      title: "See Results",
      description: "Watch your progress unfold with detailed analytics, achievements, and milestone celebrations."
    }
  ];

  const appScreenshots = [
    {
      title: "Dashboard",
      description: "Your daily fitness hub with stats, goals, and quick actions",
      gradient: "from-primary/20 to-accent/20"
    },
    {
      title: "AI Workouts",
      description: "Personalized workout plans generated just for you",
      gradient: "from-accent/20 to-secondary/20"
    },
    {
      title: "Nutrition",
      description: "Smart meal planning and calorie tracking",
      gradient: "from-secondary/20 to-primary/20"
    },
    {
      title: "Progress",
      description: "Beautiful charts showing your fitness journey",
      gradient: "from-primary/20 to-secondary/20"
    }
  ];

  const [currentScreenshot, setCurrentScreenshot] = useState(0);

  const nextScreenshot = () => {
    setCurrentScreenshot((prev) => (prev + 1) % appScreenshots.length);
  };

  const prevScreenshot = () => {
    setCurrentScreenshot((prev) => (prev - 1 + appScreenshots.length) % appScreenshots.length);
  };

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

      {/* App Screenshots Section */}
      <section className="py-20 px-4 bg-background overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              See the App in
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Action</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A beautifully designed experience that makes fitness tracking effortless and enjoyable
            </p>
          </div>

          <div className="relative flex items-center justify-center gap-8">
            {/* Navigation Button - Left */}
            <Button
              variant="outline"
              size="icon"
              onClick={prevScreenshot}
              className="hidden md:flex h-12 w-12 rounded-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            {/* Phone Mockup */}
            <div className="relative">
              <div className="relative w-[280px] h-[560px] bg-card rounded-[3rem] border-4 border-border/50 shadow-2xl overflow-hidden">
                {/* Phone Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-background rounded-full z-10" />
                
                {/* Screen Content */}
                <div className={`absolute inset-4 rounded-[2.25rem] bg-gradient-to-br ${appScreenshots[currentScreenshot].gradient} flex flex-col items-center justify-center p-6 transition-all duration-500`}>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
                      <Dumbbell className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">{appScreenshots[currentScreenshot].title}</h3>
                    <p className="text-muted-foreground text-sm">{appScreenshots[currentScreenshot].description}</p>
                    
                    {/* Fake UI Elements */}
                    <div className="space-y-3 mt-6">
                      <div className="h-12 bg-card/60 rounded-xl w-full" />
                      <div className="h-8 bg-card/40 rounded-lg w-3/4 mx-auto" />
                      <div className="flex gap-2 justify-center">
                        <div className="h-20 w-20 bg-card/50 rounded-xl" />
                        <div className="h-20 w-20 bg-card/50 rounded-xl" />
                        <div className="h-20 w-20 bg-card/50 rounded-xl" />
                      </div>
                      <div className="h-24 bg-card/30 rounded-xl w-full" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-[4rem] blur-2xl -z-10" />
            </div>

            {/* Navigation Button - Right */}
            <Button
              variant="outline"
              size="icon"
              onClick={nextScreenshot}
              className="hidden md:flex h-12 w-12 rounded-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Screenshot Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {appScreenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentScreenshot(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentScreenshot 
                    ? "bg-primary w-8" 
                    : "bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center gap-4 mt-6 md:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={prevScreenshot}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextScreenshot}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              How It
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get started in minutes and begin your transformation journey today
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative group">
                {/* Connector Line (hidden on last item and mobile) */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 text-center h-full">
                  <CardContent className="p-6 pt-8">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {item.step}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 text-primary">
                      {item.icon}
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* CTA under How It Works */}
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="h-14 px-8 gradient-primary hover:opacity-90"
            >
              Start Your Transformation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>


      {/* Pricing Comparison */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Choose Your 
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Plan</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free and upgrade when you're ready for more
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-8 flex flex-col">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground">Perfect for getting started with your fitness journey</p>
              </div>
              
              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Basic workout tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Food logging</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Progress tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Achievement system</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Water & hydration tracking</span>
                </div>
              </div>
              
              <Button 
                onClick={handleGetStarted} 
                variant="outline"
                className="w-full h-12"
              >
                Get Started Free
              </Button>
            </Card>

            {/* Premium Plan */}
            <Card className="border-primary/50 bg-card backdrop-blur-sm p-8 flex flex-col relative overflow-hidden">
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                Popular
              </Badge>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">$9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground">Unlock the full power of AI-driven fitness</p>
              </div>
              
              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="font-semibold">Everything in Free, plus:</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>AI Workout Generator</strong> - Personalized plans</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>AI Nutrition Planning</strong> - Custom meal plans</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Voice Food Logger</strong> - Log with AI speech</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>AI Fitness Chatbot</strong> - 24/7 coaching</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Advanced Analytics</strong> - Detailed insights</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Multi-week Programs</strong> - Long-term planning</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Priority Support</strong> - Get help faster</span>
                </div>
              </div>
              
              <Button 
                onClick={handleGetStarted}
                className="w-full h-12 gradient-primary hover:opacity-90"
              >
                Upgrade to Premium
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
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

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Frequently Asked
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Questions</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Got questions? We've got answers
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-border/50 rounded-xl px-6 bg-card/50 backdrop-blur-sm">
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                Is Final Form really free to use?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                Yes! Our free plan includes basic workout tracking, food logging, progress tracking, achievements, and hydration tracking. You can use these features forever without paying. Premium features like AI workout generation and personalized meal plans require a subscription.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border/50 rounded-xl px-6 bg-card/50 backdrop-blur-sm">
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                What makes the AI workouts different from other apps?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                Our AI considers your fitness level, available equipment, time constraints, muscle recovery, and personal goals to create truly personalized workouts. The plans adapt as you progress, ensuring you're always challenged but never overwhelmed.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border/50 rounded-xl px-6 bg-card/50 backdrop-blur-sm">
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                Can I cancel my Premium subscription anytime?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                Absolutely! You can cancel your subscription at any time with no hidden fees or penalties. Your Premium features will remain active until the end of your billing period, and you'll automatically switch to the free plan.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border/50 rounded-xl px-6 bg-card/50 backdrop-blur-sm">
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                Is my data private and secure?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                Your privacy is our top priority. All your data is encrypted and stored securely. We never sell your personal information to third parties. You can export or delete your data at any time from your account settings.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-border/50 rounded-xl px-6 bg-card/50 backdrop-blur-sm">
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                Do I need gym equipment to use the app?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                Not at all! When setting up your profile, you can specify what equipment you have access to (or none at all). Our AI will generate workouts that work with your available resources, including bodyweight-only routines for home workouts.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border border-border/50 rounded-xl px-6 bg-card/50 backdrop-blur-sm">
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                How does the voice food logging work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                Simply tap the microphone button and describe what you ate naturally, like "I had a chicken salad with olive oil dressing for lunch." Our AI will parse your description, identify the foods, estimate portions, and log the nutritional information automatically.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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