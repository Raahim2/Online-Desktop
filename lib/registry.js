import dynamic from 'next/dynamic';

// Helper function to ensure no tool tries to render on the server
// const dynamicTool = (importFn) => dynamic(importFn, { 
//   ssr: false, 
//   loading: () => (
//     <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white font-mono">
//       <div className="flex flex-col items-center gap-4">
//         <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
//         <p className="text-sm animate-pulse">Initializing Tool...</p>
//       </div>
//     </div>
//   )
// });

export const toolRegistry = {
  'Devtools/jsx-test': dynamic(() => import('../Tools/Devtools/JSX TEST/main')),
  'game/com': dynamic(() => import('../Tools/game/Com/main')),
  // Agentic
  'Agentic/Misinformation-Agent': dynamic(() => import('../Tools/Agentic/Misinformation Agent/main')),
  // Creativity
  'Creativity/Kaleidoscope-Canvas': dynamic(() => import('../Tools/Creativity/Kaleidoscope Canvas/main')),
  'Creativity/Piano': dynamic(() => import('../Tools/Creativity/Piano/main')),
  'Creativity/CrazySounds': dynamic(() => import('../Tools/Creativity/CrazySounds/main')),

  // Templates
  'Templates/Clerk-Landing-Page': dynamic(() => import('../Tools/Templates/Clerk Landing Page/main')),
  'Templates/Neon-Landing': dynamic(() => import('../Tools/Templates/Neon Landing/main')),
  'Templates/NeuralBreach': dynamic(() => import('../Tools/Templates/NeuralBreach/main')),
  'Templates/Vello-Da-Dhaba': dynamic(() => import('../Tools/Templates/Vello Da Dhaba/main')),
  'Templates/Orbit': dynamic(() => import('../Tools/Templates/Orbit/main')),
  // Game
  'Game/Chess': dynamic(() => import('../Tools/Game/Chess/main')),
  'Game/Maze': dynamic(() => import('../Tools/Game/Maze/main')),
  'Game/Uno': dynamic(() => import('../Tools/Game/Uno/main')),
  'Game/Space-Invader': dynamic(() => import('../Tools/Game/Space Invader/main')),
  'Game/Password-Game': dynamic(() => import('../Tools/Game/Password Game/main')),
  // Devtools
  'Devtools/DevForge': dynamic(() => import('../Tools/Devtools/DevForge/main')),
  'Devtools/HTML2REACT': dynamic(() => import('../Tools/Devtools/HTML2REACT/main')),
};