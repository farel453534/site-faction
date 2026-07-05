import React from 'react';
import { motion } from 'framer-motion';
import { Shield, User, MessageSquare, Settings } from 'lucide-react';

export const Scene1: React.FC<{ duration: number }> = ({ duration }) => {
  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden bg-primary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <video
        src={`${import.meta.env.BASE_URL}videos/gothic_corridor.mp4`}
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary opacity-80" />
      
      {/* Title */}
      <motion.div 
        className="absolute top-[15vh] text-center w-full"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
      >
        <h1 className="font-display text-5xl md:text-7xl text-secondary tracking-widest uppercase mb-4 drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">
          Règlement Faction
        </h1>
        <h2 className="font-body text-xl md:text-3xl text-text-primary tracking-widest font-light">
          MSSClick
        </h2>
      </motion.div>

      {/* Cards UI Mockup */}
      <motion.div 
        className="relative z-10 flex gap-6 mt-32"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 1.2 } }
        }}
      >
        {[
          { icon: Shield, title: "Voir le règlement", desc: "Consultation officielle" },
          { icon: User, title: "Mon profil", desc: "Statistiques & Faction" },
          { icon: MessageSquare, title: "Discord", desc: "Rejoindre la communauté" },
          { icon: Settings, title: "Admin", desc: "Gestion serveur" }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            variants={{
              hidden: { y: 40, opacity: 0, rotateX: -20 },
              visible: { y: 0, opacity: 1, rotateX: 0 }
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-48 md:w-64 aspect-[4/5] bg-bg-muted/40 backdrop-blur-md border border-secondary/20 rounded-xl flex flex-col items-center justify-center p-6 relative overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <item.icon className="w-12 h-12 text-secondary mb-6 drop-shadow-[0_0_15px_rgba(201,168,76,0.5)]" />
            <h3 className="font-display text-lg text-text-primary text-center uppercase tracking-wider mb-2">
              {item.title}
            </h3>
            <p className="font-body text-sm text-text-muted text-center">
              {item.desc}
            </p>
            {/* Edge accent */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50" />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
