import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useAppStore();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleDarkMode}
      className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-foreground" />
      ) : (
        <Moon className="h-5 w-5 text-foreground" />
      )}
    </motion.button>
  );
}
