import React from 'react';
import { motion } from 'framer-motion';

export const Scene3: React.FC<{ duration: number }> = ({ duration }) => {
  return (
    <motion.div 
      className="absolute inset-0 w-full h-full bg-primary overflow-hidden flex flex-col justify-center items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ y: "-100%", filter: "blur(10px)" }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center mix-blend-luminosity opacity-40 scale-105"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/magic_profile.jpg)` }}
      />
      <div className="absolute inset-0 bg-primary/70 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-6xl flex gap-8">
        {/* Profile Identity */}
        <motion.div 
          className="w-1/3 bg-bg-muted/80 border border-secondary/30 p-8 flex flex-col items-center relative overflow-hidden"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <div className="w-32 h-32 rounded-full border-2 border-secondary/50 mb-6 p-2 relative">
            <div className="w-full h-full rounded-full bg-secondary/20 flex items-center justify-center">
              {/* Badge Mangemort representation */}
              <div className="w-16 h-16 bg-accent rotate-45 transform flex items-center justify-center shadow-[0_0_20px_rgba(139,26,26,0.6)]">
                 <span className="text-primary font-display text-2xl font-bold -rotate-45 block">M</span>
              </div>
            </div>
            <motion.svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <motion.circle 
                cx="50" cy="50" r="48" 
                fill="none" 
                stroke="#c9a84c" 
                strokeWidth="1"
                strokeDasharray="300"
                initial={{ strokeDashoffset: 300 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ delay: 1, duration: 2, ease: "easeOut" }}
              />
            </motion.svg>
          </div>
          
          <h3 className="font-display text-2xl text-text-primary uppercase tracking-widest mb-1">Severus Snape</h3>
          <p className="font-body text-accent font-semibold tracking-widest mb-6">MANGEMORT</p>
          
          <div className="w-full h-[1px] bg-secondary/20 mb-6" />
          
          <div className="w-full flex justify-between items-center mb-2">
            <span className="font-mono text-sm text-text-muted uppercase">Réputation</span>
            <span className="font-display text-secondary">À redouter</span>
          </div>
          <div className="w-full h-2 bg-primary overflow-hidden border border-secondary/10">
            <motion.div 
              className="h-full bg-secondary shadow-[0_0_10px_rgba(201,168,76,0.8)]"
              initial={{ width: 0 }}
              animate={{ width: "80%" }}
              transition={{ delay: 1.5, duration: 1 }}
            />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="w-2/3 grid grid-cols-2 gap-6">
          {[
            { label: "Historique de Captures", value: "14", delay: 0.8 },
            { label: "Duels Remportés", value: "42", delay: 1.0 },
            { label: "Évasions", value: "3", delay: 1.2 },
            { label: "Missions", value: "108", delay: 1.4 }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: stat.delay, type: "spring" }}
              className="bg-bg-muted/40 border border-secondary/10 p-6 flex flex-col justify-center relative group"
            >
              <span className="font-mono text-xs text-text-muted uppercase tracking-widest mb-2">{stat.label}</span>
              <motion.span 
                className="font-display text-5xl text-secondary drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay + 0.3 }}
              >
                {stat.value}
              </motion.span>
              <div className="absolute bottom-0 left-0 h-[2px] bg-secondary/50 w-0 group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
