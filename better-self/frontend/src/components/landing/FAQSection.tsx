import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: 'Is this therapy?', a: "No, Resetify is a habit-change tool, not therapy. We provide structured plans and AI coaching to help you build better habits. For clinical addiction, please consult a healthcare professional." },
    { q: 'Do I need to pay?', a: "You can start for free with a 3-day plan and limited features. Paid plans unlock the full 30-day journey and unlimited AI coaching." },
    { q: 'Is my data private?', a: "Absolutely. Your data is encrypted and never shared. We take privacy seriously — your journey is yours alone." },
    { q: 'What if I fail a day?', a: "That's okay! Progress isn't linear. Your AI coach will help you get back on track without judgment. One bad day doesn't erase your progress." },
    { q: 'Can I change my habit goal?', a: "Yes! You can adjust your goals anytime. Your plan will adapt to your new focus." },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 bg-secondary/30">
      <div className="max-w-3xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently asked questions</h2>
        </motion.div>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div key={faq.q} className="glass-card rounded-xl overflow-hidden" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
              <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                <span className="font-medium">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-muted-foreground">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
