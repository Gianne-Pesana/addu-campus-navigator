'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for a premium feel
      }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
