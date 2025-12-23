import dynamic from 'next/dynamic';

export const toolRegistry = {
  'Agentic/Misinformation-Agent': dynamic(() => import('../Tools/Agentic/Misinformation Agent/main')),

  'Creativity/Kaleidoscope-Canvas': dynamic(() => import('../Tools/Creativity/Kaleidoscope Canvas/main')),
  'Creativity/Piano': dynamic(() => import('../Tools/Creativity/Piano/main')),


  'Templates/Clerk-Landing-Page': dynamic(() => import('../Tools/Templates/Clerk Landing Page/main')),
  'Templates/Neon-Landing': dynamic(() => import('../Tools/Templates/Neon Landing/main')),


  'Game/Chess': dynamic(() => import('../Tools/Game/Chess/main')),
  'Game/Maze': dynamic(() => import('../Tools/Game/Maze/main')),
  'Game/Uno': dynamic(() => import('../Tools/Game/Uno/main')),
  'Game/Space-Invader': dynamic(() => import('../Tools/Game/Space Invader/main')),
  'Game/Password-Game': dynamic(() => import('../Tools/Game/Password Game/main')),

  'DevTools/DevForge': dynamic(() => import('../Tools/DevTools/DevForge/main')),
};