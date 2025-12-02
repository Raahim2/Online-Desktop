"use client";

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { FaRedo, FaCog, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaClock, FaTrophy } from "react-icons/fa";
import gsap from "gsap";

export default function CyberMaze() {
  // --- Configuration ---
  const [size, setSize] = useState(15);
  const [showControls, setShowControls] = useState(false);
  
  // --- Game State ---
  const [maze, setMaze] = useState([]);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [path, setPath] = useState([]);
  const [gameState, setGameState] = useState("loading"); // loading, playing, won
  const [elapsedTime, setElapsedTime] = useState(0);

  // --- Refs ---
  const mazeRef = useRef([]);
  const playerRef = useRef({ x: 0, y: 0 });
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const winModalRef = useRef(null);

  // --- Helpers ---
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // --- Algorithm: Recursive Backtracker ---
  const generateMaze = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState("loading");
    setElapsedTime(0);
    setPath([{ x: 0, y: 0 }]);
    playerRef.current = { x: 0, y: 0 };
    setPlayer({ x: 0, y: 0 });

    // 1. Initialize Grid (All Walls Closed = True)
    const newMaze = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        row.push({ 
          x, y, 
          visited: false, 
          n: true, s: true, e: true, w: true // True = Wall exists
        });
      }
      newMaze.push(row);
    }

    // 2. Carve Maze
    const stack = [];
    const startX = 0;
    const startY = 0;
    newMaze[startY][startX].visited = true;
    stack.push(newMaze[startY][startX]);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = [];
      const { x, y } = current;

      // North
      if (y > 0 && !newMaze[y - 1][x].visited) neighbors.push({ cell: newMaze[y - 1][x], dir: 'n', opp: 's' });
      // South
      if (y < size - 1 && !newMaze[y + 1][x].visited) neighbors.push({ cell: newMaze[y + 1][x], dir: 's', opp: 'n' });
      // East
      if (x < size - 1 && !newMaze[y][x + 1].visited) neighbors.push({ cell: newMaze[y][x + 1], dir: 'e', opp: 'w' });
      // West
      if (x > 0 && !newMaze[y][x - 1].visited) neighbors.push({ cell: newMaze[y][x - 1], dir: 'w', opp: 'e' });

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        // Knock down walls
        current[next.dir] = false;
        next.cell[next.opp] = false;
        
        next.cell.visited = true;
        stack.push(next.cell);
      } else {
        stack.pop();
      }
    }

    mazeRef.current = newMaze;
    setMaze(newMaze);
    setGameState("playing");

    // GSAP Animation: Reveal Maze
    if (containerRef.current) {
      gsap.fromTo(".maze-cell", 
        { opacity: 0, scale: 0.8 }, 
        { opacity: 1, scale: 1, duration: 0.5, stagger: { amount: 0.5, grid: [size, size], from: "start" }, ease: "power2.out" }
      );
    }

    // Start Timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

  }, [size]);

  useEffect(() => {
    generateMaze();
    return () => clearInterval(timerRef.current);
  }, [generateMaze]);

  // GSAP Win Animation
  useEffect(() => {
    if (gameState === "won" && winModalRef.current) {
        gsap.fromTo(winModalRef.current, 
            { y: 50, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
    }
  }, [gameState]);

  // --- Logic: Movement ---
  const move = useCallback((dx, dy) => {
    if (gameState !== "playing") return;

    const { x, y } = playerRef.current;
    const grid = mazeRef.current;
    if(!grid.length) return;
    
    const cell = grid[y][x];
    let canMove = false;

    // Logic: If wall is TRUE, we CANNOT go that way.
    if (dy === -1 && !cell.n) canMove = true;
    if (dy === 1 && !cell.s) canMove = true;
    if (dx === -1 && !cell.w) canMove = true;
    if (dx === 1 && !cell.e) canMove = true;

    if (canMove) {
      const nx = x + dx;
      const ny = y + dy;
      
      playerRef.current = { x: nx, y: ny };
      setPlayer({ x: nx, y: ny });

      // Path Logic
      setPath(prev => {
        const newPath = [...prev];
        // If we step back onto the previous tile, remove the latest step (backtracking)
        if (newPath.length > 1 && newPath[newPath.length - 2].x === nx && newPath[newPath.length - 2].y === ny) {
            newPath.pop();
        } else {
            newPath.push({ x: nx, y: ny });
        }
        return newPath;
      });

      // Win Check
      if (nx === size - 1 && ny === size - 1) {
        setGameState("won");
        clearInterval(timerRef.current);
      }
    }
  }, [gameState, size]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowUp" || e.key === "w") move(0, -1);
      if (e.key === "ArrowDown" || e.key === "s") move(0, 1);
      if (e.key === "ArrowLeft" || e.key === "a") move(-1, 0);
      if (e.key === "ArrowRight" || e.key === "d") move(1, 0);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [move]);

  // --- Render ---
  return (
    <div className="fixed inset-0 bg-black text-cyan-400 font-sans overflow-hidden flex flex-col items-center justify-center">
      
      {/* HUD */}
      <div className="absolute top-4 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <div className="bg-black/80 backdrop-blur border border-cyan-500/30 px-6 py-2 rounded-full flex items-center gap-4 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <div className="flex items-center gap-2 text-xl font-bold font-mono">
                <FaClock className="text-cyan-500" />
                <span>{formatTime(elapsedTime)}</span>
            </div>
          </div>
      </div>

      {/* Maze Container */}
      <div className="relative p-4">
        {maze.length > 0 && (
          <div 
            ref={containerRef}
            className="relative"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              width: 'min(90vmin, 600px)',
              aspectRatio: '1/1',
            }}
          >
            {maze.map((row, y) => row.map((cell, x) => {
              const isPlayer = player.x === x && player.y === y;
              const isEnd = x === size - 1 && y === size - 1;
              const isPath = path.some(p => p.x === x && p.y === y);

              // --- VISIBILITY LOGIC ---
              // We only apply borders if the wall is TRUE.
              // We use a bright cyan color.
              const wallColor = "2px solid #06b6d4"; // Cyan-500
              const style = {
                borderTop: cell.n ? wallColor : 'none',
                borderBottom: cell.s ? wallColor : 'none',
                borderLeft: cell.w ? wallColor : 'none',
                borderRight: cell.e ? wallColor : 'none',
              };

              return (
                <div 
                  key={`${x}-${y}`} 
                  className="maze-cell relative box-border bg-black"
                  style={style}
                >
                  {/* Floor (Optional: makes open path slightly visible) */}
                  <div className="absolute inset-0 opacity-10 bg-cyan-900 pointer-events-none"></div>

                  {/* Path Trace */}
                  {isPath && !isPlayer && (
                    <div className="absolute inset-0 m-auto w-2 h-2 bg-cyan-500/50 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  )}

                  {/* Start Point */}
                  {x===0 && y===0 && <div className="absolute inset-2 bg-blue-700/50 rounded" />}

                  {/* End Point */}
                  {isEnd && <div className="absolute inset-2 bg-green-500/50 animate-pulse rounded border border-green-400" />}

                  {/* Player */}
                  <div 
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isPlayer ? 'opacity-100' : 'opacity-0'}`}
                  >
                     <div className="w-[60%] h-[60%] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] z-10 relative">
                        {/* Little glow effect */}
                        <div className="absolute inset-0 bg-cyan-400 blur-sm rounded-full animate-pulse"></div>
                     </div>
                  </div>
                </div>
              );
            }))}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-8 flex gap-4 z-20">
        <button 
          onClick={() => setShowControls(!showControls)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white p-4 rounded-full shadow-lg transition-all"
        >
            <FaCog className={showControls ? "animate-spin-slow" : ""} />
        </button>

        <button 
          onClick={generateMaze}
          className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(8,145,178,0.5)] transition-transform active:scale-95"
        >
            <FaRedo />
        </button>
      </div>

      {/* Settings Modal (Popup) */}
      <div className={`
        absolute bottom-28 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 p-6 rounded-2xl shadow-2xl
        flex flex-col gap-4 items-center transition-all duration-300 origin-bottom
        ${showControls ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none translate-y-8'}
      `}>
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs text-cyan-500 font-bold uppercase tracking-wider">
                <span>Map Size</span>
                <span>{size}x{size}</span>
            </div>
            <input 
                type="range" min="5" max="30" value={size} 
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-48 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          <div className="w-full h-px bg-white/10 my-1"></div>

          {/* D-Pad */}
          <div className="grid grid-cols-3 gap-2">
             <div />
             <button onClick={() => move(0,-1)} className="w-12 h-12 bg-zinc-800 rounded hover:bg-zinc-700 active:bg-cyan-700 flex items-center justify-center text-cyan-400"><FaArrowUp/></button>
             <div />
             <button onClick={() => move(-1,0)} className="w-12 h-12 bg-zinc-800 rounded hover:bg-zinc-700 active:bg-cyan-700 flex items-center justify-center text-cyan-400"><FaArrowLeft/></button>
             <div className="w-12 h-12 flex items-center justify-center"><div className="w-2 h-2 bg-zinc-700 rounded-full"/></div>
             <button onClick={() => move(1,0)} className="w-12 h-12 bg-zinc-800 rounded hover:bg-zinc-700 active:bg-cyan-700 flex items-center justify-center text-cyan-400"><FaArrowRight/></button>
             <div />
             <button onClick={() => move(0,1)} className="w-12 h-12 bg-zinc-800 rounded hover:bg-zinc-700 active:bg-cyan-700 flex items-center justify-center text-cyan-400"><FaArrowDown/></button>
             <div />
          </div>
      </div>

      {/* Win Modal */}
      {gameState === 'won' && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div ref={winModalRef} className="bg-zinc-900 border border-cyan-500 p-8 rounded-2xl text-center max-w-xs w-full shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                <FaTrophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 drop-shadow-lg" />
                <h2 className="text-3xl font-bold text-white mb-2">MAZE CLEARED</h2>
                <div className="text-zinc-400 mb-6 font-mono text-sm">
                    TIME: <span className="text-cyan-400 text-xl font-bold">{formatTime(elapsedTime)}</span>
                </div>
                <button 
                    onClick={generateMaze}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all active:scale-95"
                >
                    PLAY AGAIN
                </button>
            </div>
        </div>
      )}
    </div>
  );
}