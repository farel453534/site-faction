import React from 'react';
import { motion } from 'framer-motion';

export const Scene2: React.FC<{ duration: number }> = ({ duration }) => {
  const sections = [
    "Notions de base",
    "Factions & Rôles",
    "Système de Captures",
    "Comportement & RP",
    "Sanctions & Infractions"
  ];

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex items-center justify-center bg-primary overflow-hidden"
      initial={{ clipPath: "circle(0% at 50% 50%)" }}
      animate={{ clipPath: "circle(150% at 50% 50%)" }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
    >
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center mix-blend-overlay opacity-30"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/parchment_texture.jpg)` }}
      />
      
      <div className="absolute left-0 w-1/3 h-full bg-gradient-to-r from-primary to-transparent z-10" />

      <motion.div 
        className="relative z-20 w-full max-w-5xl px-12 flex items-center"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 1.2 }}
      >
        <div className="w-1/2 pr-12 border-r border-secondary/30">
          <h2 className="font-display text-5xl text-secondary mb-6 leading-tight uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Le Savoir<br/>Ancestral
          </h2>
          <p className="font-body text-text-primary text-lg font-light leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Consultez les textes sacrés qui régissent notre monde. Chaque règle est classée pour une lecture claire et immédiate.
          </p>
        </div>

        <div className="w-1/2 pl-12 flex flex-col gap-4">
          {sections.map((title, i) => (
            <motion.div
              key={i}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.15, type: "spring", damping: 20 }}
              className={`p-4 border ${i === 1 ? 'border-secondary bg-secondary/10' : 'border-secondary/20 bg-bg-muted/50'} backdrop-blur-sm flex justify-between items-center relative overflow-hidden`}
            >
              {i === 1 && (
                <motion.div 
                  className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"
                  layoutId="active-accordion-marker"
                />
              )}
              <span className={`font-display tracking-widest ${i === 1 ? 'text-secondary' : 'text-text-primary'}`}>
                {title}
              </span>
              <span className="text-secondary/50 font-mono text-sm">+</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating magical elements */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(201,168,76,0.8)]"
          initial={{ 
            x: `${20 + Math.random() * 60}vw`, 
            y: "110vh",
            opacity: 0.2
          }}
          animate={{ 
            y: "-10vh",
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "linear"
          }}
        />
      ))}
    </motion.div>
  );
};
