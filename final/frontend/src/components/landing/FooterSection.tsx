import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

export function FinalCTASection() {
  const { setCurrentView } = useAppStore();
  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <motion.div className="max-w-3xl mx-auto text-center relative z-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
          You don't need motivation.<br /><span className="text-gradient-primary">You need a system.</span>
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Start your transformation today. Your future self will thank you.</p>
        <motion.button onClick={() => setCurrentView('onboarding')} className="btn-hero group" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <span className="flex items-center gap-3">Start free. No credit card required.<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
        </motion.button>
      </motion.div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center"><span className="text-white text-sm">✨</span></div>
          <span className="font-bold">Resetify</span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        </div>
        <p className="text-sm text-muted-foreground">© 2024 Resetify. All rights reserved.</p>
      </div>
    </footer>
  );
}
