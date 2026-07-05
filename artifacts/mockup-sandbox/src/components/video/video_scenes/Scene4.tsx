import React from 'react';
import { motion } from 'framer-motion';
import { Database, ShieldCheck, Search } from 'lucide-react';

export const Scene4: React.FC<{ duration: number }> = ({ duration }) => {
  return (
    <motion.div 
      className="absolute inset-0 w-full h-full bg-[#0a101d] overflow-hidden flex"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Sidebar mockup */}
      <motion.div 
        className="w-64 h-full bg-primary border-r border-secondary/20 pt-20 px-6"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-3 mb-10 text-secondary drop-shadow-[0_0_8px_rgba(201,168,76,0.4)]">
          <ShieldCheck className="w-6 h-6" />
          <span className="font-display tracking-widest uppercase">Admin Panel</span>
        </div>
        
        <div className="space-y-4">
          <div className="p-3 bg-secondary/10 border-l-2 border-secondary text-text-primary font-body text-sm flex items-center gap-3">
            <Database className="w-4 h-4 text-secondary" />
            Statistiques
          </div>
          <div className="p-3 text-text-muted font-body text-sm flex items-center gap-3 opacity-50">
            Gestion Admins
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-16 relative">
        <motion.div 
          className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-secondary/5 rounded-full blur-[100px] pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-between items-center mb-12"
        >
          <h2 className="font-display text-4xl text-text-primary uppercase tracking-wider">Global Stats</h2>
          <div className="flex items-center border border-secondary/30 bg-primary px-4 py-2 w-64">
            <Search className="w-4 h-4 text-text-muted mr-3" />
            <span className="font-mono text-xs text-text-muted uppercase">Recherche Discord ID</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          {[
            { t: "Trophées Distribués", v: "1,248" },
            { t: "Kills RP", v: "342" },
            { t: "Captures Totales", v: "89" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.2, duration: 0.6, ease: "easeOut", transformOrigin: "top" }}
              className="bg-primary/50 border border-secondary/20 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm"
            >
              <div className="font-mono text-xs text-text-muted mb-2 uppercase tracking-widest">{stat.t}</div>
              <div className="font-display text-4xl text-secondary">{stat.v}</div>
            </motion.div>
          ))}
        </div>

        {/* Table Mockup */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="w-full bg-primary/30 border border-secondary/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm"
        >
          <div className="grid grid-cols-4 border-b border-secondary/20 p-4 font-mono text-xs text-secondary uppercase tracking-wider bg-bg-muted/50">
            <span>Discord ID</span>
            <span>Rôle</span>
            <span>Faction</span>
            <span>Action</span>
          </div>
          {[1, 2, 3].map((_, i) => (
            <motion.div 
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 2 + i * 0.1 }}
              className="grid grid-cols-4 p-4 border-b border-secondary/10 font-body text-sm text-text-primary items-center hover:bg-secondary/5 transition-colors"
            >
              <span className="font-mono text-text-muted">458291039485...</span>
              <span><span className="px-2 py-1 bg-accent/20 text-accent font-semibold text-xs uppercase border border-accent/30 rounded">Responsable</span></span>
              <span>Ministère</span>
              <span className="text-secondary/80 hover:text-secondary cursor-pointer flex items-center gap-2">
                <Search className="w-3 h-3" />
                Modifier
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};
