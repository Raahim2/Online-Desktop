"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- Constants ---

const SPONSORS = ['PEPSI', 'STARBUCKS', 'SHELL'];
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const ROMAN_VALUES = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
const PERIODIC_TABLE = [
  'He', 'Li', 'Be', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'Cl', 'Ar', 'Ca', 'Sc', 'Ti', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'
];
const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
const COUNTRIES = [
  { name: 'france', display: '🇫🇷 France' },
  { name: 'japan', display: '🇯🇵 Japan' },
  { name: 'brazil', display: '🇧🇷 Brazil' },
  { name: 'canada', display: '🇨🇦 Canada' },
  { name: 'egypt', display: '🇪🇬 Egypt' },
  { name: 'australia', display: '🇦🇺 Australia' },
];

// --- Helper Functions ---

const sumDigits = (str) => {
  return str.split('').reduce((acc, char) => {
    return acc + (/\d/.test(char) ? parseInt(char, 10) : 0);
  }, 0);
};

const getRomanSum = (str) => {
  const romans = str.match(/[IVXLCDM]/g) || [];
  if (romans.length === 0) return 0;
  // Limit to avoid overflow/massive numbers crashing UI
  const sum = romans.reduce((acc, char) => acc + ROMAN_VALUES[char], 0);
  return sum;
};

const hasMonth = (str) => MONTHS.some(m => str.toUpperCase().includes(m));
const hasSponsor = (str) => SPONSORS.some(s => str.toUpperCase().includes(s));
const hasPeriodicSymbol = (str) => {
  // Check for 2-letter elements specifically to avoid easy matches like 'I' or 'P'
  for (let el of PERIODIC_TABLE) {
    if (str.includes(el)) return true;
  }
  return false;
};

// --- Main Component ---

export default function Project() {
  const [password, setPassword] = useState("");
  const [captchaStr, setCaptchaStr] = useState("");
  const [targetCountry, setTargetCountry] = useState(COUNTRIES[0]);
  
  // Game State
  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState(0); 
  const [gameOver, setGameOver] = useState(false);
  const [paulBorn, setPaulBorn] = useState(false); // New state to prevent instant death

  const textareaRef = useRef(null);

  // --- Initialization ---
  useEffect(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let res = "";
    for(let i=0; i<5; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaStr(res);
    setTargetCountry(COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)]);
  }, []);

  // --- Auto-Resize Textarea ---
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [password]);

  // --- Paul Logic (Fixed) ---
  useEffect(() => {
    const hasEgg = password.includes('🥚');
    const paulRuleIndex = 15; // Index 15 = Rule 16

    // 1. If we haven't unlocked Paul yet, do nothing.
    if (maxUnlockedIndex < paulRuleIndex) return;

    // 2. If the user successfully adds the egg, mark Paul as "Born"
    if (hasEgg && !paulBorn) {
      setPaulBorn(true);
    }

    // 3. If Paul was born (user added egg), but now egg is gone, GAME OVER.
    if (paulBorn && !hasEgg && !gameOver) {
      setGameOver(true);
    }
  }, [password, maxUnlockedIndex, paulBorn, gameOver]);

  // --- Rules Definition ---
  const rules = useMemo(() => [
    {
      id: 1,
      text: "Your password must be at least 5 characters.",
      valid: (pw) => pw.length >= 5
    },
    {
      id: 2,
      text: "Your password must include a number.",
      valid: (pw) => /\d/.test(pw)
    },
    {
      id: 3,
      text: "Your password must include an uppercase letter.",
      valid: (pw) => /[A-Z]/.test(pw)
    },
    {
      id: 4,
      text: "Your password must include a special character.",
      valid: (pw) => /[^A-Za-z0-9\s]/.test(pw)
    },
    {
      id: 5,
      text: "The digits in your password must add up to 25.",
      valid: (pw) => sumDigits(pw) === 25,
      curr: (pw) => `Current sum: ${sumDigits(pw)}`
    },
    {
      id: 6,
      text: "Your password must include a month of the year.",
      valid: (pw) => hasMonth(pw)
    },
    {
      id: 7,
      text: "Your password must include a Roman numeral.",
      valid: (pw) => /[IVXLCDM]/.test(pw)
    },
    {
      id: 8,
      text: "Your password must include one of our sponsors.",
      valid: (pw) => hasSponsor(pw),
      extra: (
        <div className="flex flex-wrap gap-2 mt-2">
          {SPONSORS.map(s => (
            <span key={s} className="text-[10px] bg-neutral-200 text-neutral-600 px-2 py-1 rounded font-bold tracking-wider">{s}</span>
          ))}
        </div>
      )
    },
    {
      id: 9,
      text: "The Roman numerals in your password should add upto 35.",
      valid: (pw) => getRomanSum(pw) === 35,
      curr: (pw) => `Current sum: ${getRomanSum(pw)}`
    },
    {
      id: 10,
      text: "Your password must include this CAPTCHA.",
      valid: (pw) => pw.includes(captchaStr),
      extra: (
        <div className="mt-3 bg-white border border-neutral-300 p-3 rounded-md inline-block relative overflow-hidden">
          <div className="absolute inset-0 bg-neutral-100 opacity-20" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '5px 5px'}}></div>
          <div className="font-mono text-2xl tracking-[0.2em] font-black text-neutral-800 line-through decoration-wavy decoration-red-400/50 select-none">
            {captchaStr}
          </div>
        </div>
      )
    },
    {
      id: 11,
      text: "Your password must include today's Wordle answer.",
      valid: (pw) => pw.toUpperCase().includes("PEACH"),
      extra: <div className="mt-1 text-xs text-neutral-400 italic">Hint: A soft, fuzzy fruit.</div>
    },
    {
      id: 12,
      text: "Your password must include a two-letter symbol from the periodic table.",
      valid: (pw) => hasPeriodicSymbol(pw),
      extra: <div className="mt-1 text-xs text-neutral-400">Example: He, Li, Fe (Case sensitive)</div>
    },
    {
      id: 13,
      text: "Your password must include the current phase of the moon as an emoji.",
      valid: (pw) => pw.includes(MOON_PHASES[4]), // Hardcoded Full Moon
      extra: <div className="mt-2 text-4xl animate-pulse filter drop-shadow-lg">{MOON_PHASES[4]}</div>
    },
    {
      id: 14,
      text: `Your password must include the name of this country.`,
      valid: (pw) => pw.toLowerCase().includes(targetCountry.name),
      extra: <div className="mt-3 bg-neutral-100 border border-neutral-200 p-4 rounded-lg text-center font-bold text-xl text-neutral-800 shadow-sm">{targetCountry.display}</div>
    },
    {
      id: 15,
      text: "Your password must include a leap year.",
      valid: (pw) => {
        const nums = pw.match(/\d+/g);
        if (!nums) return false;
        return nums.some(n => {
            const y = parseInt(n);
            return y > 0 && ((y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0));
        });
      }
    },
    {
      id: 16,
      text: gameOver 
            ? "Paul has been slain. You cannot recover from this." 
            : "🥚 This is Paul. He hasn't hatched yet. Put him in your password and keep him safe.",
      valid: (pw) => {
        if (gameOver) return false; 
        return pw.includes('🥚');
      },
      extra: gameOver 
        ? <div className="mt-2 text-5xl text-center">🪦</div> 
        : <div className="mt-2 text-sm text-neutral-500 font-mono select-all cursor-pointer bg-white border border-neutral-200 p-2 inline-block rounded hover:bg-neutral-50 transition-colors shadow-sm">🥚</div>
    }
  ], [captchaStr, targetCountry, gameOver]);

  // --- Dynamic Rule Evaluation ---
  
  const firstFailedIndex = useMemo(() => {
    for (let i = 0; i < rules.length; i++) {
      if (!rules[i].valid(password)) {
        return i;
      }
    }
    return rules.length;
  }, [password, rules]);

  // Unlock rules progressively
  useEffect(() => {
    if (!gameOver && firstFailedIndex > maxUnlockedIndex) {
      setMaxUnlockedIndex(firstFailedIndex);
    }
  }, [firstFailedIndex, maxUnlockedIndex, gameOver]);

  const resetGame = () => {
     window.location.reload(); // Simplest full reset
  };

  return (
    <div className="overflow-y-scroll overflow-x-hidden h-screen bg-[#f3f4f6] text-neutral-900 font-sans selection:bg-blue-200 selection:text-blue-900 pb-40">
      
      {/* Header Title */}
      <div className="pt-12 pb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-neutral-800 tracking-tighter mb-2">
          * The Password Game
        </h1>
        <p className="text-neutral-500 font-medium">Please choose a password</p>
      </div>

      <div className="max-w-xl mx-auto px-4 flex flex-col items-center gap-6">
        
        {/* Sticky Input Area */}
        <div className="w-full sticky top-6 z-50">
          <div className={`
            relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] 
            border transition-all duration-300 overflow-hidden
            ${gameOver ? 'border-red-500 ring-4 ring-red-500/20' : 'border-white/50 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-400'}
          `}>
            <div className="relative p-1">
                <textarea 
                  ref={textareaRef}
                  value={password}
                  onChange={(e) => !gameOver && setPassword(e.target.value)}
                  readOnly={gameOver}
                  spellCheck="false"
                  placeholder="Type here..."
                  className="w-full p-6 text-xl md:text-2xl font-mono outline-none resize-none bg-transparent text-neutral-800 placeholder:text-neutral-300 min-h-[80px]"
                />
                
                {/* Character Count */}
                <div className={`
                  absolute bottom-4 right-6 text-xs font-bold px-2 py-1 rounded-md border pointer-events-none transition-colors
                  ${password.length > 0 ? 'bg-neutral-100 text-neutral-500 border-neutral-200' : 'opacity-0'}
                `}>
                  {password.length}
                </div>
            </div>
          </div>

          {/* Game Over Banner */}
          {gameOver && (
            <div className="mt-4 animate-[slideUp_0.3s_ease-out]">
              <div className="bg-red-600 text-white p-4 rounded-xl shadow-xl flex items-center justify-between">
                <div className="font-bold">
                  <div className="text-lg">GAME OVER</div>
                  <div className="text-red-100 text-sm font-normal">Paul has passed away.</div>
                </div>
                <button 
                  onClick={resetGame}
                  className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors text-sm shadow-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rules Stack */}
        <div className="w-full flex flex-col-reverse gap-4 pb-20 mt-4 transition-all">
          {rules.slice(0, maxUnlockedIndex + 1).map((rule) => {
            const isPassed = rule.valid(password);
            
            return (
              <div 
                key={rule.id}
                className={`
                  relative w-full rounded-xl border transition-all duration-500 ease-in-out
                  ${isPassed 
                    ? 'bg-gradient-to-br from-green-50 to-white border-green-200 opacity-60 hover:opacity-100 scale-[0.98]' 
                    : 'bg-white border-red-200 shadow-[0_4px_20px_-2px_rgba(239,68,68,0.15)] scale-100 z-10 animate-[shake_0.5s_ease-in-out_once]'
                  }
                `}
              >
                {/* Rule Header */}
                <div className={`
                  px-5 py-3 flex justify-between items-center rounded-t-xl border-b
                  ${isPassed ? 'bg-green-100/50 border-green-100' : 'bg-red-50 border-red-100'}
                `}>
                  <span className={`text-xs font-bold uppercase tracking-widest ${isPassed ? 'text-green-700' : 'text-red-600'}`}>
                    Rule {rule.id}
                  </span>
                  <div className={`
                    w-5 h-5 rounded-full flex items-center justify-center text-[10px]
                    ${isPassed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                  `}>
                    {isPassed ? '✓' : '!'}
                  </div>
                </div>

                {/* Rule Content */}
                <div className="p-6">
                  <p className={`
                    text-lg font-medium leading-snug transition-colors
                    ${isPassed ? 'text-neutral-500' : 'text-neutral-800'}
                  `}>
                    {rule.text}
                  </p>

                  {/* Dynamic Value Feedback (e.g. Sum of digits) */}
                  {!isPassed && rule.curr && (
                     <div className="mt-2 text-sm font-mono text-red-500 font-bold">
                       {rule.curr(password)}
                     </div>
                  )}
                  
                  {/* Extra Content */}
                  {rule.extra && (
                    <div className={`transition-all duration-300 ${isPassed ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                      {rule.extra}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Tailwind Animation Config Injection (No external CSS file needed) */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}