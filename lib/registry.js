import dynamic from 'next/dynamic';

// Helper function to ensure no tool tries to render on the server
const dynamicTool = (importFn) => dynamic(importFn, { 
  ssr: false, 
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-sm animate-pulse">Initializing Tool...</p>
      </div>
    </div>
  )
});

export const toolRegistry = {
  // Agentic
  'Agentic/Misinformation-Agent': dynamicTool(() => import('../Tools/Agentic/Misinformation Agent/main')),

  // Creativity
  'Creativity/Kaleidoscope-Canvas': dynamicTool(() => import('../Tools/Creativity/Kaleidoscope Canvas/main')),
  'Creativity/Piano': dynamicTool(() => import('../Tools/Creativity/Piano/main')),
  'Creativity/CrazySounds': dynamicTool(() => import('../Tools/Creativity/CrazySounds/main')),

  // Templates
  'Templates/Clerk-Landing-Page': dynamicTool(() => import('../Tools/Templates/Clerk Landing Page/main')),
  'Templates/Neon-Landing': dynamicTool(() => import('../Tools/Templates/Neon Landing/main')),

  // Game
  'Game/Chess': dynamicTool(() => import('../Tools/Game/Chess/main')),
  'Game/Maze': dynamicTool(() => import('../Tools/Game/Maze/main')),
  'Game/Uno': dynamicTool(() => import('../Tools/Game/Uno/main')),
  'Game/Space-Invader': dynamicTool(() => import('../Tools/Game/Space Invader/main')),
  'Game/Password-Game': dynamicTool(() => import('../Tools/Game/Password Game/main')),

  // DevTools
  'DevTools/DevForge': dynamicTool(() => import('../Tools/DevTools/DevForge/main')),
};