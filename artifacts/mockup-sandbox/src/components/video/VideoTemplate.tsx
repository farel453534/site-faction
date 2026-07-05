import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '../../lib/video/hooks';
import { ReplitLoadingScene } from './ReplitLoadingScene';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';

// Adjust durations here to control pacing
const SCENE_DURATIONS = [
  5000, // Scene1: Intro
  5000, // Scene2: Reglement
  4500, // Scene3: Profil
  4500, // Scene4: Admin
  4500, // Scene5: Edition
  4500, // Scene6: Outro
];

export const VideoTemplate: React.FC = () => {
  const { isLoaded, currentScene } = useVideoPlayer(SCENE_DURATIONS);

  if (!isLoaded) {
    return <ReplitLoadingScene />;
  }

  // Common subtitle component overlaying all scenes
  const renderSubtitle = () => {
    let text = "";
    switch (currentScene) {
      case 0: text = "Bienvenue sur le Règlement Faction MSSClick — votre référence officielle pour le jeu de rôle Harry Potter."; break;
      case 1: text = "Consultez l'intégralité des règles, organisées par catégories et accessibles en un instant."; break;
      case 2: text = "Suivez votre progression : faction, réputation, captures, tout est là."; break;
      case 3: text = "Les responsables disposent d'outils puissants pour gérer les joueurs et les statistiques."; break;
      case 4: text = "Le contenu du site est entièrement éditable depuis l'interface, sans code."; break;
      case 5: text = "MSSClick — le règlement, à portée de main."; break;
    }

    return (
      <motion.div 
        key={`subtitle-${currentScene}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute bottom-12 left-0 right-0 z-50 flex justify-center pointer-events-none"
      >
        <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded border border-secondary/30 max-w-[80vw]">
          <p className="font-body text-text-primary text-xl md:text-2xl text-center subtitle-text font-medium leading-relaxed">
            {text}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full h-[100vh] bg-bg-dark overflow-hidden relative">
      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="scene-1" duration={SCENE_DURATIONS[0]} />}
        {currentScene === 1 && <Scene2 key="scene-2" duration={SCENE_DURATIONS[1]} />}
        {currentScene === 2 && <Scene3 key="scene-3" duration={SCENE_DURATIONS[2]} />}
        {currentScene === 3 && <Scene4 key="scene-4" duration={SCENE_DURATIONS[3]} />}
        {currentScene === 4 && <Scene5 key="scene-5" duration={SCENE_DURATIONS[4]} />}
        {currentScene === 5 && <Scene6 key="scene-6" duration={SCENE_DURATIONS[5]} />}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
         {renderSubtitle()}
      </AnimatePresence>
    </div>
  );
};
