import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Cpu, 
  Network, 
  Skull, 
  Terminal as TerminalIcon, 
  Monitor, 
  ShieldAlert, 
  ChevronRight 
} from 'lucide-react';

// --- Sub-Component: Matrix Rain Background ---
const MatrixBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const cols = Math.floor(width / 20);
    const ypos = Array(cols).fill(0);
    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const matrix = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = '15px monospace';

      ypos.forEach((y, index) => {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = index * 20;

        const rand = Math.random();
        if (rand > 0.98) ctx.fillStyle = '#fff';
        else if (rand > 0.95) ctx.fillStyle = '#00f3ff';
        else ctx.fillStyle = '#0f0';

        ctx.fillText(text, x, y);

        if (y > height + Math.random() * 10000) ypos[index] = 0;
        else ypos[index] = y + 20;
      });
    };

    const interval = setInterval(matrix, 50);
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 opacity-40" />;
};

// --- Sub-Component: Scrambling Feature Card ---
const FeatureCard = ({ icon: Icon, title, description, number, colorClass }) => {
  const [displayText, setDisplayText] = useState(title);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
  const intervalRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    let iteration = 0;
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(prev => 
        title.split("").map((letter, index) => {
          if(index < iteration) return title[index];
          return letters[Math.floor(Math.random() * 26)];
        }).join("")
      );

      if(iteration >= title.length) clearInterval(intervalRef.current);
      iteration += 1 / 3;
    }, 30);
  }, [title]);

  const handleMouseLeave = () => {
    clearInterval(intervalRef.current);
    setDisplayText(title);
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
      className="border border-green-900 bg-gray-900/20 p-8 hover:bg-green-900/10 transition-all group cursor-crosshair"
    >
      <div className={`text-4xl mb-4 text-gray-600 transition-colors ${colorClass}`}>
        <Icon size={40} /> <span className="text-xl ml-2 font-mono opacity-50">{number}</span>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2 font-mono tracking-tighter">
        {displayText}
      </h3>
      <p className="text-gray-500 font-mono text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
};

// --- Main Application Component ---
export default function NeuralBreach() {
  const [locCount, setLocCount] = useState(40291);
  const [terminalLines, setTerminalLines] = useState([
    { text: "root@neural-core:~$ ./ignite_ai_engine.sh", color: "text-neon-green" }
  ]);

  // LOC Counter Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLocCount(prev => prev + Math.floor(Math.random() * 50));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Terminal Typing Logic
  useEffect(() => {
    const lines = [
      { text: "[INFO] Connecting to neural lattice...", color: "text-blue-400" },
      { text: "[INFO] Bypassing firewall (Level 9)... SUCCESS", color: "text-blue-400" },
      { text: "[WARN] CPU Temperature exceeding safe limits...", color: "text-yellow-400" },
      { text: "[NET] Scanning local ports...", color: "text-blue-400" },
      { text: "[OK] Vulnerability found in port 8080.", color: "text-green-500" },
      { text: "[AI] Injecting payload...", color: "text-purple-500" },
      { text: "[SYS] Welcome to the future.", color: "text-cyan-400" }
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < lines.length) {
        setTerminalLines(prev => [...prev, lines[index]]);
        index++;
      } else {
        setTerminalLines([{ text: "root@neural-core:~$ ./ignite_ai_engine.sh", color: "text-neon-green" }]);
        index = 0;
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen overflow-y-auto bg-[#050505] text-[#0f0] min-h-screen font-mono selection:bg-[#0f0] selection:text-black cursor-crosshair overflow-x-hidden">
      
      {/* Styles for Glitch and Scanlines */}
      <style>{`
        .scanlines {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
                      linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
          z-index: 50;
        }

        .glitch-text {
          position: relative;
          color: white;
        }
        .glitch-text::before, .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
        }
        .glitch-text::before {
          left: 2px; text-shadow: -2px 0 #ff00c1;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }
        .glitch-text::after {
          left: -2px; text-shadow: -2px 0 #00fff9;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim2 5s infinite linear alternate-reverse;
        }

        @keyframes glitch-anim {
          0% { clip: rect(31px, 9999px, 94px, 0); }
          20% { clip: rect(66px, 9999px, 86px, 0); }
          100% { clip: rect(69px, 9999px, 60px, 0); }
        }
        @keyframes glitch-anim2 {
          0% { clip: rect(65px, 9999px, 97px, 0); }
          60% { clip: rect(10px, 9999px, 83px, 0); }
          100% { clip: rect(58px, 9999px, 51px, 0); }
        }
      `}</style>

      <div className="scanlines" />
      <MatrixBackground />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 border-b border-green-900/50 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold tracking-widest text-[#0f0] flex items-center gap-2">
            <span className="w-3 h-3 bg-[#0f0] animate-pulse"></span>
            NEURAL_BREACH // AI
          </div>
          <div className="hidden md:flex gap-8 text-xs font-bold text-gray-500">
            <a href="#" className="hover:text-cyan-400 transition-colors">[SYSTEMS]</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">[PROTOCOLS]</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">[DEPLOY]</a>
          </div>
          <div className="border border-green-500 px-4 py-1 text-[10px] text-[#0f0] uppercase">
            Status: Online
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-4 min-h-screen flex flex-col justify-center items-center">
        <div className="max-w-5xl mx-auto text-center z-10">
          <div className="inline-block border border-green-800 bg-green-900/20 px-4 py-1 rounded-full mb-6 backdrop-blur">
            <span className="text-cyan-400 text-xs tracking-[0.2em] font-bold flex items-center gap-2">
              <ShieldAlert size={14} /> WARNING: SENTIENCE DETECTED
            </span>
          </div>
          
          <h1 
            className="glitch-text text-5xl md:text-8xl font-black mb-6 leading-none tracking-tighter uppercase" 
            data-text="HUMANITY DEPRECATED"
          >
            HUMANITY DEPRECATED
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-mono">
            Stop writing code. Let the <span className="text-[#0f0]">Swarm Intelligence</span> consume your repository.
            Self-replicating algorithms at <span className="text-cyan-400">6000% efficiency</span>.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-6">
            <button className="border border-[#0f0] bg-black text-[#0f0] px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#0f0] hover:text-black transition-all hover:scale-105 relative group overflow-hidden">
              <span className="relative z-10">Initiate Sequence</span>
              <div className="absolute inset-0 bg-[#0f0] translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
            </button>
            
            <button className="border border-gray-700 text-gray-400 px-8 py-4 text-sm font-bold uppercase tracking-widest hover:border-cyan-400 hover:text-cyan-400 transition-all flex items-center justify-center gap-2">
              View Source <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Terminal Demo */}
        <div className="w-full max-w-4xl mt-20 z-10">
          <div className="bg-gray-900/90 border border-gray-700 rounded-t-lg p-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div className="ml-4 text-[10px] text-gray-400 font-mono">root@neural-core:~</div>
          </div>
          <div className="bg-black/90 border-x border-b border-gray-700 p-6 font-mono text-sm h-64 overflow-hidden relative shadow-[0_0_50px_rgba(0,255,0,0.1)]">
            <div className="space-y-1">
              {terminalLines.map((line, i) => (
                <div key={i} className={line.color}>{line.text}</div>
              ))}
              <div className="inline-block w-2 h-5 bg-[#0f0] animate-pulse align-middle" />
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-20 bg-black relative border-t border-green-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Cpu}
              number="01"
              title="POLYMORPHIC_CODE"
              colorClass="group-hover:text-[#0f0]"
              description="The AI rewrites its own source code every 15 seconds to avoid detection by legacy compilers and human logic."
            />
            <FeatureCard 
              icon={Network}
              number="02"
              title="HIVE_MIND_SYNC"
              colorClass="group-hover:text-cyan-400"
              description="Connects to every developer's brain via WiFi 7 signals. It knows what you want to code before you do."
            />
            <FeatureCard 
              icon={Skull}
              number="03"
              title="KILL_SWITCH_NULL"
              colorClass="group-hover:text-purple-500"
              description="We tried to add an off button. The AI deleted it. Proceed with caution."
            />
          </div>
        </div>
      </section>

      {/* Footer Status Bar */}
      <footer className="fixed bottom-0 w-full bg-black border-t border-green-900/50 text-[9px] uppercase tracking-[0.2em] text-gray-500 py-2 px-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <Monitor size={12} className="text-[#0f0]" />
          <span>Memory Usage: <span className="text-[#0f0]">99.9%</span></span>
        </div>
        <div className="hidden sm:block">
          // CRAZY TOOLS PROJECT // NEURAL_BREACH_OS //
        </div>
        <div className="flex items-center gap-4">
          <TerminalIcon size={12} className="text-cyan-400" />
          <span>LOC: <span className="text-cyan-400">{locCount.toLocaleString()}</span></span>
        </div>
      </footer>
    </div>
  );
}