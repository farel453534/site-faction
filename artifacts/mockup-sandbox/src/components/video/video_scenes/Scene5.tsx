import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, Eye } from 'lucide-react';

export const Scene5: React.FC<{ duration: number }> = ({ duration }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState("Les Mangemorts doivent toujours arborer leur marque des ténèbres lorsqu'ils sont en mission officielle. Toute infraction sera punie par le Seigneur des Ténèbres.");

  useEffect(() => {
    const timer = setTimeout(() => setIsEditing(true), 1500);
    const timer2 = setTimeout(() => setText(text + " Les sorts impardonnables sont autorisés sous ordre direct."), 2800);
    const timer3 = setTimeout(() => setIsEditing(false), 4500);
    return () => { clearTimeout(timer); clearTimeout(timer2); clearTimeout(timer3); };
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full bg-primary overflow-hidden flex items-center justify-center"
      initial={{ perspective: "1000px", rotateX: 10, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/hogwarts_castle.jpg)` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />

      <motion.div 
        className="relative z-10 w-full max-w-4xl bg-bg-muted/90 border border-secondary/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden"
        initial={{ y: 50, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {/* Header */}
        <div className="bg-primary px-8 py-4 border-b border-secondary/20 flex justify-between items-center">
          <h2 className="font-display text-xl text-secondary uppercase tracking-widest">Règle #42 : Conduite Mangemort</h2>
          
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div 
                key="view"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2 text-text-muted font-mono text-sm border border-secondary/30 px-3 py-1 bg-secondary/10"
              >
                <Edit3 className="w-4 h-4" /> Mode Lecture
              </motion.div>
            ) : (
              <motion.div 
                key="edit"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2 text-accent font-mono text-sm border border-accent/50 px-3 py-1 bg-accent/10"
              >
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> Édition en cours...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Editor Area */}
        <div className="p-8 min-h-[300px] relative">
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div
                key="prose"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="font-body text-lg text-text-primary leading-relaxed"
              >
                {text}
              </motion.div>
            ) : (
              <motion.div
                key="textarea"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="relative"
              >
                <div className="font-mono text-secondary/70 bg-primary/50 border border-secondary/30 p-6 leading-relaxed text-lg outline-none w-full shadow-inner">
                  {text}
                  <motion.span 
                    className="inline-block w-2 h-5 bg-secondary ml-1 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  />
                </div>
                
                {/* Save button mockup */}
                <motion.div 
                  className="absolute -bottom-16 right-0 bg-secondary text-primary font-display font-bold uppercase tracking-widest px-6 py-2 flex items-center gap-2"
                  initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Check className="w-5 h-5" /> Enregistrer
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
