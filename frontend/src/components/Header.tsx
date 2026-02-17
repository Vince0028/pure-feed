import { Zap } from "lucide-react";
import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <motion.div
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 glow-primary">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-gradient-primary">NoFluff</span>
            <span className="text-muted-foreground font-normal">.ai</span>
          </span>
        </motion.div>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs font-mono text-muted-foreground">Live feed</span>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
