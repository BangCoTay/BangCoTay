import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { useSubmitOnboarding } from '@/hooks/useOnboarding';
import { useGeneratePlan } from '@/hooks/usePlans';
import { NICHES, ADDICTIONS, PAIN_POINTS } from '@/types';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Star, 
  TrendingUp, 
  Clock, 
  Battery, 
  Brain, 
  Moon, 
  Loader2,
  Scroll,
  Share2,
  Eye,
  Video,
  Smartphone,
  Gamepad2,
  MessageCircle,
  BookOpen,
  Zap,
  Coffee,
  Music,
  ShoppingBag,
  AlertCircle,
  Target
} from 'lucide-react';

// Icons mapping for addiction types
const ADDICTION_ICONS: Record<string, React.ReactNode> = {
  'doomscrolling': <Scroll className="w-5 h-5" />,
  'social-media': <Share2 className="w-5 h-5" />,
  'porn': <Eye className="w-5 h-5" />,
  'youtube-tiktok': <Video className="w-5 h-5" />,
  'late-night-phone': <Smartphone className="w-5 h-5" />,
  'overthinking': <Brain className="w-5 h-5" />,
  'anxiety': <AlertCircle className="w-5 h-5" />,
  'negative-self-talk': <MessageCircle className="w-5 h-5" />,
  'procrastination': <Clock className="w-5 h-5" />,
  'distraction': <Zap className="w-5 h-5" />,
  'cramming': <BookOpen className="w-5 h-5" />,
  'sedentary': <Coffee className="w-5 h-5" />,
  'poor-sleep': <Moon className="w-5 h-5" />,
  'skipping-exercise': <Target className="w-5 h-5" />,
  'sugar': <Coffee className="w-5 h-5" />,
  'binge-eating': <ShoppingBag className="w-5 h-5" />,
  'junk-food': <ShoppingBag className="w-5 h-5" />,
  'excessive-gaming': <Gamepad2 className="w-5 h-5" />,
  'rage-quitting': <Zap className="w-5 h-5" />,
  'gaming-over-sleep': <Moon className="w-5 h-5" />,
};
import { cn } from '@/lib/utils';

// Step types for the new flow
type StepType = 
  | 'identity' 
  | 'social-proof' 
  | 'habit' 
  | 'outcome-preview' 
  | 'intensity' 
  | 'pain-points' 
  | 'relatability' 
  | 'commitment' 
  | 'loading';

const STEPS: StepType[] = [
  'identity',
  'social-proof',
  'habit',
  'outcome-preview',
  'intensity',
  'pain-points',
  'relatability',
  'commitment',
  'loading'
];

const INTERSTITIAL_STEPS: StepType[] = ['social-proof', 'outcome-preview', 'relatability', 'loading'];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingChecks, setLoadingChecks] = useState<number[]>([]);
  const hasSubmittedRef = useRef(false);

  const {
    tempOnboardingData,
    setNiche,
    setAddiction,
    setSeverity,
    togglePainPoint,
    setCurrentView,
    clearTempOnboardingData,
  } = useAppStore();

  const submitOnboarding = useSubmitOnboarding();
  const generatePlan = useGeneratePlan();

  const stepType = STEPS[currentStep];
  const isInterstitial = INTERSTITIAL_STEPS.includes(stepType);
  const questionSteps = STEPS.filter(s => !INTERSTITIAL_STEPS.includes(s));
  const currentQuestionIndex = questionSteps.indexOf(stepType);
  const totalQuestions = questionSteps.length;

  // Auto-advance for interstitials
  useEffect(() => {
    if (stepType === 'social-proof' || stepType === 'outcome-preview' || stepType === 'relatability') {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [stepType]);

  // Loading animation
  useEffect(() => {
    if (stepType === 'loading' && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      const checkTimers = [
        setTimeout(() => setLoadingChecks(prev => [...prev, 0]), 600),
        setTimeout(() => setLoadingChecks(prev => [...prev, 1]), 1200),
        setTimeout(() => setLoadingChecks(prev => [...prev, 2]), 1800),
        setTimeout(() => setLoadingChecks(prev => [...prev, 3]), 2400),
      ];

      // Submit onboarding data and generate plan via API
      const submitData = async () => {
        try {
          // Submit onboarding data
          await submitOnboarding.mutateAsync({
            niche: tempOnboardingData.niche!,
            addiction: tempOnboardingData.addiction!,
            severity: tempOnboardingData.severity!,
            painPoints: tempOnboardingData.painPoints,
            healthyHabit: 'none', // Default value
          });

          // Generate plan (automatically triggered by backend after onboarding)
          await generatePlan.mutateAsync();

          // Clear temp data and navigate to dashboard
          setTimeout(() => {
            clearTempOnboardingData();
            setCurrentView('dashboard');
          }, 3000);
        } catch (error) {
          console.error('Error submitting onboarding:', error);
          // Allow retry if needed by resetting ref (though here we don't have a retry button)
          hasSubmittedRef.current = false;
        }
      };

      submitData();

      return () => {
        clearInterval(progressInterval);
        checkTimers.forEach(t => clearTimeout(t));
      };
    }
  }, [stepType, submitOnboarding, generatePlan, clearTempOnboardingData, setCurrentView]);

  const canProceed = () => {
    switch (stepType) {
      case 'identity': return tempOnboardingData.niche !== null;
      case 'habit': return tempOnboardingData.addiction !== null;
      case 'intensity': return tempOnboardingData.severity !== null;
      case 'pain-points': return tempOnboardingData.painPoints.length > 0;
      case 'commitment': return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (stepType === 'commitment') {
      setCurrentStep(STEPS.indexOf('loading'));
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      setCurrentView('landing');
    } else {
      // Skip back over interstitials
      let newStep = currentStep - 1;
      while (newStep > 0 && INTERSTITIAL_STEPS.includes(STEPS[newStep])) {
        newStep--;
      }
      setCurrentStep(newStep);
    }
  };

  const filteredAddictions = ADDICTIONS.filter(a => a.niche === tempOnboardingData.niche);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 }
    }
  };

  const renderStep = () => {
    switch (stepType) {
      // Step 1 - Identity Creation
      case 'identity':
        return (
          <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="text-center space-y-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Let's personalize your experience
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                What are you struggling with most right now?
              </h1>
              <p className="text-muted-foreground text-lg">
                This takes less than 60 seconds
              </p>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              className="grid sm:grid-cols-2 gap-4"
            >
              {NICHES.map((niche) => (
                <motion.button
                  key={niche.id}
                  variants={itemVariants}
                  className={cn(
                    "group relative overflow-hidden p-5 rounded-2xl border-2 transition-all duration-300",
                    "bg-card hover:bg-accent/5",
                    tempOnboardingData.niche === niche.id 
                      ? "border-primary shadow-lg shadow-primary/20" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setNiche(niche.id)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all",
                      "bg-gradient-to-br",
                      niche.color,
                      tempOnboardingData.niche === niche.id ? "scale-110" : "group-hover:scale-105"
                    )}>
                      {niche.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-semibold text-lg">{niche.label}</span>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      tempOnboardingData.niche === niche.id 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground/30"
                    )}>
                      {tempOnboardingData.niche === niche.id && (
                        <Check className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                  {tempOnboardingData.niche === niche.id && (
                    <motion.div
                      layoutId="selected-glow"
                      className="absolute inset-0 bg-primary/5 rounded-2xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        );

      // Interstitial 1 - Social Proof
      case 'social-proof':
        return (
          <motion.div 
            className="text-center space-y-8 py-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30"
            >
              <Star className="w-10 h-10 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <h2 className="text-2xl sm:text-3xl font-bold">
                Trusted by <span className="text-primary">120,000+</span> users worldwide
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                People your age are using this to regain focus, energy, and control.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {[
                { label: 'Avg. streak', value: '18 days', icon: '🔥' },
                { label: 'Finish 14+ days', value: '73%', icon: '📈' },
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="px-6 py-4 rounded-2xl bg-card border border-border"
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-muted-foreground"
            >
              👉 This is not hype — it's data.
            </motion.p>

            <motion.div 
              className="flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/30"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        );

      // Step 2 - Core Habit Selection
      case 'habit':
        return (
          <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="text-center space-y-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium border border-border">
                <Target className="w-4 h-4 text-primary" />
                Let's focus on one habit first
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Which habit do you want to change?
              </h1>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              className="grid sm:grid-cols-2 gap-3"
            >
              {filteredAddictions.map((addiction) => (
                <motion.button
                  key={addiction.id}
                  variants={itemVariants}
                  className={cn(
                    "group relative p-5 rounded-2xl border-2 transition-all duration-300 text-left",
                    "bg-card hover:bg-secondary/50",
                    tempOnboardingData.addiction === addiction.id 
                      ? "border-primary bg-primary/5 shadow-lg" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setAddiction(addiction.id)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                      tempOnboardingData.addiction === addiction.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      {ADDICTION_ICONS[addiction.id] || <AlertCircle className="w-5 h-5" />}
                    </div>
                    <span className="font-semibold text-lg flex-1">{addiction.label}</span>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      tempOnboardingData.addiction === addiction.id 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground/30"
                    )}>
                      {tempOnboardingData.addiction === addiction.id && (
                        <Check className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        );

      // Interstitial 2 - Outcome Preview
      case 'outcome-preview':
        return (
          <motion.div 
            className="text-center space-y-8 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
            >
              <TrendingUp className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl font-bold"
            >
              What users like you achieve in <span className="text-primary">30 days</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid gap-4 max-w-md mx-auto"
            >
              {[
                { icon: Clock, text: '+2–3 hrs/day reclaimed', color: 'text-blue-500' },
                { icon: Moon, text: 'Better sleep in 7–10 days', color: 'text-purple-500' },
                { icon: Brain, text: 'Stronger focus without willpower', color: 'text-orange-500' },
                { icon: Battery, text: 'Less guilt, more control', color: 'text-green-500' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  <item.icon className={cn("w-6 h-6", item.color)} />
                  <span className="font-medium">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-sm text-muted-foreground italic"
            >
              Results vary, but consistency beats motivation.
            </motion.p>
          </motion.div>
        );

      // Step 3 - Intensity Calibration
      case 'intensity':
        return (
          <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold">
                How much is this habit affecting your life?
              </h1>
              <p className="text-muted-foreground text-lg">
                This helps us adjust the difficulty so it actually works.
              </p>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              className="grid gap-4 max-w-lg mx-auto"
            >
              {[
                { id: 'mild', label: 'Occasionally', description: 'I still have control', emoji: '🟢', color: 'from-green-500/20 to-green-500/5' },
                { id: 'moderate', label: 'Often', description: "It's becoming a problem", emoji: '🟡', color: 'from-yellow-500/20 to-yellow-500/5' },
                { id: 'severe', label: 'Daily', description: 'It feels hard to stop', emoji: '🔴', color: 'from-red-500/20 to-red-500/5' },
              ].map((option) => (
                <motion.button
                  key={option.id}
                  variants={itemVariants}
                  className={cn(
                    "group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden",
                    "bg-card hover:bg-accent/5",
                    tempOnboardingData.severity === option.id 
                      ? "border-primary shadow-lg shadow-primary/20" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSeverity(option.id as 'mild' | 'moderate' | 'severe')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity",
                    option.color,
                    tempOnboardingData.severity === option.id && "opacity-100"
                  )} />
                  <div className="relative flex items-center gap-4">
                    <span className="text-3xl">{option.emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{option.label}</div>
                      <div className="text-muted-foreground">{option.description}</div>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      tempOnboardingData.severity === option.id 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground/30"
                    )}>
                      {tempOnboardingData.severity === option.id && (
                        <Check className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        );

      // Step 4 - Emotional Impact
      case 'pain-points':
        return (
          <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold">
                What is this habit costing you?
              </h1>
              <p className="text-muted-foreground text-lg">
                Select all that apply
              </p>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              {PAIN_POINTS.map((point) => (
                <motion.button
                  key={point.id}
                  variants={itemVariants}
                  className={cn(
                    "group relative p-6 rounded-2xl border-2 transition-all duration-300",
                    "bg-card hover:bg-accent/5 flex flex-col items-center gap-3",
                    tempOnboardingData.painPoints.includes(point.id) 
                      ? "border-primary shadow-lg shadow-primary/20 bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => togglePainPoint(point.id)}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span 
                    className="text-4xl"
                    animate={tempOnboardingData.painPoints.includes(point.id) ? {
                      scale: [1, 1.2, 1],
                    } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {point.icon}
                  </motion.span>
                  <span className="font-semibold">{point.label}</span>
                  {tempOnboardingData.painPoints.includes(point.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        );

      // Interstitial 4 - Relatability Moment
      case 'relatability':
        return (
          <motion.div 
            className="text-center space-y-8 py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="max-w-md mx-auto"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-xl" />
                <div className="relative bg-card border border-border rounded-2xl p-8">
                  <div className="text-6xl mb-6">💬</div>
                  <blockquote className="text-xl sm:text-2xl font-medium italic mb-4">
                    "I didn't realize how much this habit drained me until I saw it clearly."
                  </blockquote>
                  <cite className="text-muted-foreground not-italic">
                    — 22 y/o student
                  </cite>
                </div>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-muted-foreground text-lg"
            >
              Awareness is the first real step toward change.
            </motion.p>

            <motion.div 
              className="flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/30"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        );

      // Step 5 - Commitment Moment
      case 'commitment':
        return (
          <motion.div 
            className="text-center space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl shadow-primary/40"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold">
                Your 30-day plan is ready.
              </h1>
              <p className="text-xl text-muted-foreground">
                Simple daily actions.<br />
                No pressure. No perfection.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-card to-accent/5 border border-border rounded-2xl p-8 max-w-md mx-auto space-y-6"
            >
              <div className="grid gap-4">
                {[
                  { icon: '⏱️', text: 'Takes 5 minutes/day' },
                  { icon: '🔄', text: 'Cancel anytime' },
                  { icon: '📈', text: 'Progress > perfection' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-3 text-left"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-muted-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        );

      // Loading/Creating Plan
      case 'loading':
        return (
          <motion.div 
            className="text-center space-y-8 py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
            >
              <Loader2 className="w-10 h-10 text-white" />
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Building your personalized plan…
              </h2>
              <div className="h-2.5 w-64 mx-auto bg-secondary rounded-full overflow-hidden border border-border">
                <motion.div 
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{loadingProgress}% complete</p>
            </div>

            <div className="max-w-sm mx-auto space-y-3">
              {[
                'Analyzing your habit patterns',
                'Adjusting difficulty level',
                'Designing daily micro-actions',
                'Activating your AI coach',
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: loadingChecks.includes(i) ? 1 : 0.3 }}
                  className="flex items-center gap-3 text-left"
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                    loadingChecks.includes(i) 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}>
                    {loadingChecks.includes(i) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <span className={cn(
                    "transition-colors",
                    loadingChecks.includes(i) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          animate={{ 
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Progress bar - hide on interstitials and loading */}
      {!isInterstitial && (
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
        >
          <div className="max-w-3xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={handleBack}
                className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors border border-border"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </motion.button>
              <div className="flex-1">
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden border border-border">
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground min-w-[3rem] text-right">
                {currentQuestionIndex + 1} / {totalQuestions}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className={cn(
        "flex-1 flex items-center justify-center px-6",
        !isInterstitial ? "pt-28 pb-36" : "py-12"
      )}>
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation - hide on interstitials and loading */}
      {!isInterstitial && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border"
        >
          <div className="max-w-3xl mx-auto px-6 py-5">
            <motion.button
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                "w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300",
                canProceed()
                  ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              whileHover={canProceed() ? { scale: 1.02, y: -2 } : {}}
              whileTap={canProceed() ? { scale: 0.98 } : {}}
            >
              {stepType === 'commitment' ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create my 30-day plan
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
