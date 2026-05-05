import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Dumbbell,
  Apple,
  Target,
  Trophy,
  Zap,
  Star,
  ArrowRight,
  ArrowUpRight,
  Utensils,
  Activity,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Flame,
  Mic,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSecureAuth } from "@/hooks/useSecureAuth";

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useSecureAuth();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  useEffect(() => {
    if (!loading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || user) {
    return <LoadingSpinner />;
  }

  const handleGetStarted = () => navigate("/auth");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background grid + glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[40vw] h-[40vh] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <Header onGetStarted={handleGetStarted} />

      <main className="relative z-10">
        <Hero
          heroRef={heroRef}
          heroY={heroY}
          heroOpacity={heroOpacity}
          onGetStarted={handleGetStarted}
        />
        <StatsBar />
        <Features />
        <PhoneShowcase />
        <HowItWorks onGetStarted={handleGetStarted} />
        <Pricing onGetStarted={handleGetStarted} />
        <Testimonials />
        <FAQ />
        <FinalCTA onGetStarted={handleGetStarted} />
      </main>

      <Footer />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  HEADER                                                            */
/* ------------------------------------------------------------------ */

const Header = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/final-form-logo.png" alt="Final Form" className="h-8 w-8" />
        <span className="text-sm font-bold tracking-[0.2em] uppercase">
          Final&nbsp;Form
        </span>
        <span className="hidden sm:flex items-center gap-1.5 ml-3 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-primary border border-primary/30 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Live
        </span>
      </div>
      <Button
        onClick={onGetStarted}
        className="h-9 rounded-full text-xs font-bold tracking-widest uppercase gradient-primary hover:opacity-90 px-5"
      >
        Start Training
        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
      </Button>
    </div>
  </header>
);

/* ------------------------------------------------------------------ */
/*  HERO                                                              */
/* ------------------------------------------------------------------ */

const Hero = ({
  heroRef,
  heroY,
  heroOpacity,
  onGetStarted,
}: {
  heroRef: React.RefObject<HTMLElement>;
  heroY: any;
  heroOpacity: any;
  onGetStarted: () => void;
}) => (
  <section
    ref={heroRef}
    className="relative min-h-[100vh] flex flex-col justify-center px-6 pt-12 pb-20 overflow-hidden"
  >
    <motion.div
      style={{ y: heroY, opacity: heroOpacity }}
      className="max-w-7xl mx-auto w-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-8 text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground"
      >
        <span className="w-8 h-px bg-primary" />
        <span>Built for the work</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="font-black uppercase tracking-[-0.04em] leading-[0.85] text-[clamp(3.5rem,12vw,11rem)]"
      >
        <span className="block">Reach Your</span>
        <span className="block bg-gradient-to-br from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
          Final Form
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mt-8 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed"
      >
        AI-built workouts. Smart nutrition. Recovery that actually
        works. One app, every rep, every meal, every win.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <Button
          onClick={onGetStarted}
          size="lg"
          className="group h-14 px-8 rounded-full text-sm font-bold tracking-widest uppercase gradient-primary hover:opacity-90"
        >
          Start Free
          <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:rotate-45" />
        </Button>
        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <Apple className="h-4 w-4" />
          <span>iOS</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>Android</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>Web</span>
        </div>
      </motion.div>

      {/* Side metric */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2 text-right"
      >
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground mb-2">
          Today
        </div>
        <div className="text-5xl font-black tabular-nums text-foreground">
          12,847
        </div>
        <div className="text-xs font-mono uppercase tracking-widest text-primary mt-1">
          workouts logged
        </div>
        <div className="mt-6 w-px h-32 bg-gradient-to-b from-primary to-transparent ml-auto" />
      </motion.div>
    </motion.div>

    {/* Bottom scroll indicator */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground"
    >
      <span>Scroll</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="w-px h-8 bg-gradient-to-b from-primary to-transparent"
      />
    </motion.div>
  </section>
);

/* ------------------------------------------------------------------ */
/*  STATS RIBBON                                                      */
/* ------------------------------------------------------------------ */

const StatsBar = () => {
  const stats = [
    { value: "300K+", label: "Workouts" },
    { value: "9.2M", label: "Reps" },
    { value: "24/7", label: "AI Coach" },
    { value: "94%", label: "Stay consistent" },
  ];
  return (
    <section className="border-y border-border/50 bg-background/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col"
          >
            <div className="text-4xl md:text-5xl font-black tabular-nums">
              {s.value}
            </div>
            <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  FEATURES — bento grid                                             */
/* ------------------------------------------------------------------ */

const Features = () => {
  const items = [
    {
      icon: <Dumbbell className="h-6 w-6" />,
      title: "AI Workout Engine",
      desc: "Every plan rebuilt around your level, equipment, recovery, and goals — recalculated daily.",
      span: "md:col-span-2 md:row-span-2",
      tag: "01",
    },
    {
      icon: <Utensils className="h-6 w-6" />,
      title: "Smart Nutrition",
      desc: "Macros that match the work.",
      span: "md:col-span-2",
      tag: "02",
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: "Voice Logger",
      desc: 'Just say "chicken and rice." Done.',
      span: "",
      tag: "03",
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Live Tracking",
      desc: "Reps, hydration, sleep, recovery — one screen.",
      span: "",
      tag: "04",
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Streaks & Wins",
      desc: "Don't break the chain.",
      span: "md:col-span-2",
      tag: "05",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Personal Goals",
      desc: "Set the target. We engineer the path.",
      span: "md:col-span-2",
      tag: "06",
    },
  ];

  return (
    <Section
      chapter="01 / Method"
      title={
        <>
          Built for athletes
          <br />
          <span className="text-primary">who actually train.</span>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[200px] gap-3">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className={`group relative ${it.span} rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 overflow-hidden hover:border-primary/40 transition-colors`}
          >
            <div className="absolute top-4 right-4 text-[10px] font-mono text-muted-foreground/60 tracking-widest">
              {it.tag}
            </div>
            <div className="flex flex-col h-full justify-between">
              <div className="text-primary">{it.icon}</div>
              <div>
                <div className="text-xl md:text-2xl font-bold tracking-tight">
                  {it.title}
                </div>
                <div className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {it.desc}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-primary/0 group-hover:bg-primary/10 blur-2xl transition-colors duration-500" />
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

/* ------------------------------------------------------------------ */
/*  PHONE SHOWCASE                                                    */
/* ------------------------------------------------------------------ */

const PhoneShowcase = () => {
  const screens = [
    {
      title: "Dashboard",
      sub: "Stats, streaks, quick actions",
      stat: "8,432",
      statLabel: "Steps",
      icon: <Activity className="h-7 w-7" />,
    },
    {
      title: "AI Workouts",
      sub: "Plans built for your level",
      stat: "42",
      statLabel: "Min today",
      icon: <Dumbbell className="h-7 w-7" />,
    },
    {
      title: "Nutrition",
      sub: "Macros that match the work",
      stat: "2,140",
      statLabel: "Calories",
      icon: <Utensils className="h-7 w-7" />,
    },
    {
      title: "Progress",
      sub: "See every PR, every win",
      stat: "+18%",
      statLabel: "Strength",
      icon: <TrendingUp className="h-7 w-7" />,
    },
  ];
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((p) => (p + 1) % screens.length);
  const prev = () => setIdx((p) => (p - 1 + screens.length) % screens.length);
  const s = screens[idx];

  return (
    <Section chapter="02 / Inside" title={<>Every metric.<br /><span className="text-primary">One screen.</span></>}>
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Phone */}
        <div className="flex justify-center order-2 lg:order-1">
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-br from-primary/30 via-primary-glow/20 to-transparent rounded-[5rem] blur-3xl" />
            <div className="relative w-[280px] h-[580px] bg-card rounded-[2.75rem] border border-border/80 shadow-2xl overflow-hidden p-2.5">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-background rounded-full z-20" />
              <div className="relative w-full h-full rounded-[2.25rem] bg-gradient-to-br from-card-elevated via-background to-card overflow-hidden">
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex flex-col p-6 pt-14"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <span>Final Form</span>
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-primary" />
                      14 day
                    </span>
                  </div>
                  <div className="mt-6 text-primary">{s.icon}</div>
                  <div className="mt-4 text-2xl font-black tracking-tight">
                    {s.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.sub}</div>
                  <div className="mt-8 rounded-2xl bg-card/60 border border-border/60 p-4">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {s.statLabel}
                    </div>
                    <div className="mt-1 text-4xl font-black tabular-nums">
                      {s.stat}
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-background overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "72%" }}
                        transition={{ duration: 0.8 }}
                        className="h-full gradient-primary"
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="aspect-square rounded-xl bg-card/40 border border-border/40 flex items-center justify-center"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary/50" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl bg-card/40 border border-border/40 p-3">
                    <div className="h-2 bg-background/60 rounded-full mb-2 w-3/4" />
                    <div className="h-2 bg-background/60 rounded-full w-1/2" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Description list */}
        <div className="order-1 lg:order-2">
          <div className="flex flex-col divide-y divide-border/50">
            {screens.map((screen, i) => (
              <button
                key={screen.title}
                onClick={() => setIdx(i)}
                className={`group flex items-center justify-between py-6 text-left transition-colors ${
                  i === idx ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-5">
                  <span
                    className={`text-xs font-mono tracking-widest ${
                      i === idx ? "text-primary" : "text-muted-foreground/60"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <span className="text-2xl md:text-3xl font-bold tracking-tight">
                    {screen.title}
                  </span>
                </div>
                <ArrowRight
                  className={`h-5 w-5 transition-all ${
                    i === idx
                      ? "text-primary translate-x-0"
                      : "text-muted-foreground/40 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="h-10 w-10 rounded-full border-border/60 bg-transparent"
              aria-label="Previous screen"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="h-10 w-10 rounded-full border-border/60 bg-transparent"
              aria-label="Next screen"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
};

/* ------------------------------------------------------------------ */
/*  HOW IT WORKS — vertical chapter timeline                          */
/* ------------------------------------------------------------------ */

const HowItWorks = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const steps = [
    {
      n: "01",
      title: "Set the target.",
      desc: "Tell us your level, your goals, your equipment. Takes 60 seconds.",
    },
    {
      n: "02",
      title: "AI builds the plan.",
      desc: "Workouts, meals, recovery — engineered around how you actually live.",
    },
    {
      n: "03",
      title: "Train. Log. Eat.",
      desc: "Open the app, follow the day, log it. Voice, barcode, or tap — whatever's fastest.",
    },
    {
      n: "04",
      title: "Earn the result.",
      desc: "PRs, streaks, body comp — every metric tracked, every win marked.",
    },
  ];

  return (
    <Section
      chapter="03 / Method"
      title={
        <>
          Four steps.
          <br />
          <span className="text-primary">No fluff.</span>
        </>
      }
    >
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-4 lg:sticky lg:top-32 self-start">
          <p className="text-muted-foreground text-lg leading-relaxed">
            We don't sell motivation. We give you a system that works on
            the days you don't have any.
          </p>
          <Button
            onClick={onGetStarted}
            className="mt-8 h-12 rounded-full px-6 gradient-primary text-sm font-bold tracking-widest uppercase"
          >
            Get the system <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="lg:col-span-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative grid grid-cols-[auto,1fr] gap-6 md:gap-10 py-10 border-t border-border/50 last:border-b last:border-border/50"
            >
              <div className="text-5xl md:text-7xl font-black tabular-nums text-muted-foreground/30 group-hover:text-primary transition-colors">
                {step.n}
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl md:text-4xl font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-muted-foreground max-w-xl leading-relaxed">
                  {step.desc}
                </p>
              </div>
              <ArrowRight className="hidden md:block absolute top-1/2 -translate-y-1/2 right-0 h-6 w-6 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

/* ------------------------------------------------------------------ */
/*  PRICING                                                           */
/* ------------------------------------------------------------------ */

const Pricing = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const free = [
    "Workout & food logging",
    "Progress tracking",
    "Hydration & sleep tracking",
    "Achievement system",
  ];
  const pro = [
    "Everything in Free",
    "AI Workout Engine — daily plans",
    "AI Nutrition planning + macros",
    "Voice food logger",
    "AI fitness coach (24/7)",
    "Multi-week programming",
    "Advanced analytics",
    "Priority support",
  ];

  return (
    <Section
      chapter="04 / Pricing"
      title={
        <>
          Simple plans.
          <br />
          <span className="text-primary">Cancel anytime.</span>
        </>
      }
    >
      <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        <PricingCard
          name="Free"
          price="$0"
          tagline="Get started, see if it sticks."
          features={free}
          cta="Start free"
          onClick={onGetStarted}
        />
        <PricingCard
          name="Pro"
          price="$9.99"
          tagline="The full system."
          features={pro}
          cta="Go Pro"
          onClick={onGetStarted}
          highlight
        />
      </div>
    </Section>
  );
};

const PricingCard = ({
  name,
  price,
  tagline,
  features,
  cta,
  onClick,
  highlight,
}: {
  name: string;
  price: string;
  tagline: string;
  features: string[];
  cta: string;
  onClick: () => void;
  highlight?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`relative rounded-2xl border p-8 flex flex-col ${
      highlight
        ? "border-primary/60 bg-gradient-to-br from-primary/10 via-card to-card"
        : "border-border/60 bg-card/40"
    }`}
  >
    {highlight && (
      <div className="absolute -top-3 right-6">
        <Badge className="bg-primary text-primary-foreground text-[10px] tracking-widest uppercase font-mono">
          Most Popular
        </Badge>
      </div>
    )}
    <div className="flex items-baseline justify-between">
      <div className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
        {name}
      </div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
        / month
      </div>
    </div>
    <div className="mt-4 flex items-baseline gap-2">
      <span className="text-6xl md:text-7xl font-black tracking-tighter">
        {price}
      </span>
    </div>
    <p className="mt-3 text-muted-foreground">{tagline}</p>

    <div className="mt-8 space-y-3 flex-grow">
      {features.map((f) => (
        <div key={f} className="flex items-center gap-3 text-sm">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              highlight ? "bg-primary" : "bg-muted-foreground"
            }`}
          />
          <span>{f}</span>
        </div>
      ))}
    </div>

    <Button
      onClick={onClick}
      className={`mt-10 h-12 rounded-full text-xs font-bold tracking-widest uppercase ${
        highlight
          ? "gradient-primary hover:opacity-90"
          : "bg-foreground text-background hover:bg-foreground/90"
      }`}
    >
      {cta}
      <ArrowUpRight className="ml-2 h-4 w-4" />
    </Button>
  </motion.div>
);

/* ------------------------------------------------------------------ */
/*  TESTIMONIALS                                                      */
/* ------------------------------------------------------------------ */

const Testimonials = () => {
  const items = [
    {
      name: "James Bishop",
      role: "Lifter",
      content:
        "App actually understands recovery. First time I've gone 6 weeks without burning out.",
    },
    {
      name: "Kelvin Dodzi",
      role: "Busy 9-to-5",
      content:
        "30 min workouts that hit. Voice logging is the cheat code I didn't know I needed.",
    },
    {
      name: "Calvin Costa",
      role: "Beginner",
      content:
        "Walked in not knowing a deadlift from a deadbolt. 3 months in, hitting PRs every week.",
    },
  ];
  return (
    <Section
      chapter="05 / Receipts"
      title={
        <>
          The work
          <br />
          <span className="text-primary">speaks.</span>
        </>
      }
    >
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="rounded-2xl border border-border/60 bg-card/40 p-6 flex flex-col"
          >
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-base leading-relaxed flex-grow">"{t.content}"</p>
            <div className="mt-6 pt-6 border-t border-border/40">
              <div className="text-sm font-bold">{t.name}</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
                {t.role}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

/* ------------------------------------------------------------------ */
/*  FAQ                                                               */
/* ------------------------------------------------------------------ */

const FAQ = () => {
  const faqs = [
    {
      q: "Is Final Form actually free?",
      a: "Yeah. Workout logging, food tracking, progress, achievements, hydration — all free, forever. AI generation, voice logging, and the 24/7 coach are Pro-only.",
    },
    {
      q: "How is the AI different from other apps?",
      a: "It looks at your level, your equipment, your recovery state, and your last 7 days of training. Plans get rebuilt daily, not pulled from a static template.",
    },
    {
      q: "Can I cancel Pro anytime?",
      a: "One tap. No phone calls, no penalties. You stay Pro until the end of the billing cycle, then drop to Free.",
    },
    {
      q: "Is my data private?",
      a: "Encrypted in transit and at rest. We don't sell anything. Export or delete your full history anytime from settings.",
    },
    {
      q: "Do I need a gym?",
      a: "Nope. Tell us what you have (or don't) and the AI plans around it — bodyweight programs included.",
    },
    {
      q: "How does voice food logging work?",
      a: '"Chicken bowl with rice and broccoli" → AI parses the foods, estimates portions, logs the macros. Done.',
    },
  ];

  return (
    <Section chapter="06 / FAQ" title={<>Questions.<br /><span className="text-primary">Answered.</span></>}>
      <div className="max-w-3xl">
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`item-${i}`}
              className="border border-border/60 rounded-xl px-6 bg-card/30 hover:bg-card/50 transition-colors data-[state=open]:bg-card/60"
            >
              <AccordionTrigger className="text-left font-bold text-base hover:no-underline py-5">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-muted-foreground/60 tracking-widest">
                    0{i + 1}
                  </span>
                  {f.q}
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 pl-10 leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
};

/* ------------------------------------------------------------------ */
/*  FINAL CTA                                                         */
/* ------------------------------------------------------------------ */

const FinalCTA = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <section className="relative px-6 py-32 md:py-48 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10" />
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }}
    />
    <div className="relative max-w-5xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-primary/30 bg-primary/5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">
            Ready when you are
          </span>
        </div>
        <h2 className="font-black uppercase tracking-[-0.04em] leading-[0.9] text-[clamp(3rem,9vw,8rem)]">
          Stop scrolling.
          <br />
          <span className="bg-gradient-to-br from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            Start training.
          </span>
        </h2>
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Free to start. No card. Two minutes to your first AI-built session.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={onGetStarted}
            size="lg"
            className="group h-16 px-10 rounded-full text-sm font-bold tracking-widest uppercase gradient-primary hover:opacity-90"
          >
            <Zap className="mr-2 h-5 w-5" />
            Claim your form
            <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover:rotate-45" />
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/*  FOOTER                                                            */
/* ------------------------------------------------------------------ */

const Footer = () => (
  <footer className="relative z-10 border-t border-border/40 px-6 py-12">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <img src="/final-form-logo.png" alt="Final Form" className="h-8 w-8" />
        <span className="text-sm font-bold tracking-[0.2em] uppercase">
          Final&nbsp;Form
        </span>
      </div>
      <div className="flex items-center gap-6 text-xs font-mono uppercase tracking-widest text-muted-foreground">
        <a href="/privacy" className="hover:text-foreground transition-colors">
          Privacy
        </a>
        <a href="/terms" className="hover:text-foreground transition-colors">
          Terms
        </a>
        <a
          href="mailto:support@finalform.app"
          className="hover:text-foreground transition-colors"
        >
          Support
        </a>
      </div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
        © 2026 Final Form
      </div>
    </div>
  </footer>
);

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                   */
/* ------------------------------------------------------------------ */

const Section = ({
  chapter,
  title,
  children,
}: {
  chapter: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section ref={ref} className="px-6 py-24 md:py-36">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-14 md:mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground mb-6">
              <span className="w-8 h-px bg-primary" />
              <span>{chapter}</span>
            </div>
            <h2 className="font-black uppercase tracking-[-0.03em] leading-[0.9] text-[clamp(2.5rem,7vw,5.5rem)]">
              {title}
            </h2>
          </div>
        </motion.div>
        {children}
      </div>
    </section>
  );
};

export default Landing;
