import React from 'react';
import { motion } from 'framer-motion';

export const Scene6: React.FC<{ duration: number }> = ({ duration }) => {
  return (
    <motion.div 
      className="absolute inset-0 w-full h-full bg-primary overflow-hidden flex items-center justify-center flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} // Final exit back to loop
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      <video
        src={`${import.meta.env.BASE_URL}videos/gothic_corridor.mp4`}
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-transparent to-primary opacity-90" />

      {/* Magical central seal */}
      <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
        <motion.div 
          className="absolute inset-0 rounded-full border border-secondary/20"
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-4 rounded-full border-2 border-secondary border-dashed opacity-50"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Core emblem */}
        <motion.div
          className="relative z-10 w-24 h-24 bg-primary border-2 border-secondary transform rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(201,168,76,0.4)]"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 45 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100, damping: 20 }}
        >
          <span className="font-display text-4xl text-secondary -rotate-45 block">M</span>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="text-center relative z-10"
      >
        <h1 className="font-display text-6xl md:text-8xl text-text-primary tracking-[0.2em] uppercase mb-4 drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">
          MSSClick
        </h1>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-[1px] bg-secondary/50" />
          <h2 className="font-display text-xl text-secondary tracking-widest">
            LE RÈGLEMENT OFFICIEL
          </h2>
          <div className="w-16 h-[1px] bg-secondary/50" />
        </div>
      </motion.div>
      
      {/* Light sweep effect across the screen */}
      <motion.div 
        className="absolute top-0 bottom-0 w-32 bg-white/5 skew-x-12 blur-2xl"
        initial={{ left: "-20%" }}
        animate={{ left: "120%" }}
        transition={{ delay: 2, duration: 2, ease: "easeInOut" }}
      />
    </motion.div>
  );
};
