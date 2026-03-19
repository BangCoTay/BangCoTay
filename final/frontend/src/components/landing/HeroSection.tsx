import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { ArrowRight, Play, CheckCircle2, Sparkles, MessageCircle } from 'lucide-react';

export function HeroSection() {
  const { setCurrentView } = useAppStore();

  const handleStart = () => {
    setCurrentView('onboarding');
  };

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 pb-16 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        {/* Floating Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-accent/15 to-accent/5 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -50, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-success/10 to-success/5 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Text Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Badge */}
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="w-4 h-4" />
                AI-Powered Behavioral Change
              </motion.span>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] mb-6">
                <span className="text-foreground">Quit bad habits.</span>
                <br />
                <span className="text-gradient-hero">Build better ones.</span>
                <br />
                <span className="text-foreground">In just 30 days.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
                A personal AI coach that helps you break addiction and replace it with healthier habits — one day at a time.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.button
                  onClick={handleStart}
                  className="btn-hero group inline-flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start your 30-day reset
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                <motion.button
                  onClick={scrollToHowItWorks}
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-border hover:border-primary/50 text-foreground font-medium transition-all hover:bg-secondary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play className="w-5 h-5" />
                  See how it works
                </motion.button>
              </div>

              {/* Trust Text */}
              <p className="mt-6 text-sm text-muted-foreground">
                Free to start • No credit card required • Cancel anytime
              </p>
            </motion.div>
          </div>

          {/* Right - Dashboard Preview */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {/* Main Dashboard Card */}
            <div className="relative glass-card p-6 rounded-3xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Day 5 of 30</p>
                  <h3 className="text-lg font-semibold">Today's Tasks</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  On Track
                </div>
              </div>

              {/* Task Cards */}
              <div className="space-y-3">
                <motion.div
                  className="flex items-center gap-4 p-4 rounded-xl bg-success/10 border border-success/20"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <CheckCircle2 className="w-6 h-6 text-success" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">No social media until noon</p>
                    <p className="text-sm text-muted-foreground">Completed at 9:30 AM</p>
                  </div>
                </motion.div>
                
                <motion.div
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">10-minute meditation</p>
                    <p className="text-sm text-muted-foreground">Build your mindfulness habit</p>
                  </div>
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Weekly Progress</span>
                  <span className="font-medium text-primary">72%</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: '72%' }}
                    transition={{ delay: 1.2, duration: 1 }}
                  />
                </div>
              </div>
            </div>

            {/* Floating Chat Bubble */}
            <motion.div
              className="absolute -left-8 bottom-1/4 glass-card p-4 rounded-2xl rounded-bl-md shadow-xl max-w-[200px]"
              initial={{ opacity: 0, y: 20, x: -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 1.5 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">AI Coach</p>
                  <p className="text-xs text-muted-foreground">Great progress! Keep it up! 🔥</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Confetti/Celebration Badge */}
            <motion.div
              className="absolute -right-4 top-1/4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium shadow-lg"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 1.8 }}
            >
              🎉 5-day streak!
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <motion.div
            className="w-1.5 h-3 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, 6, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
