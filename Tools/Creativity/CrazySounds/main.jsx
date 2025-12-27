"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Circle, 
  Square, 
  Play, 
  Trash2, 
  Bomb, 
  Megaphone, 
  Frown, 
  Star, 
  Music, 
  Skull, 
  HeartCrack, 
  IceCream, 
  Gamepad2, 
  Zap, 
  X, 
  Check, 
  HelpCircle, 
  Pin, 
  UserSearch, 
  Rocket 
} from 'lucide-react';

// --- Sound Configuration ---
const SOUND_BANK = [
  { id: 0, key: '1', name: 'VINE BOOM', color: 'bg-slate-700', text: 'text-white', type: 'boom', icon: Bomb },
  { id: 1, key: '2', name: 'AIR HORN', color: 'bg-red-500', text: 'text-white', type: 'horn', icon: Megaphone },
  { id: 2, key: '3', name: 'BRUH', color: 'bg-blue-500', text: 'text-white', type: 'voice', word: 'Bruh', icon: Frown },
  { id: 3, key: '4', name: 'WOW', color: 'bg-green-500', text: 'text-white', type: 'voice', word: 'Wow', icon: Star },
  { id: 4, key: 'Q', name: 'SUSPENSE', color: 'bg-purple-600', text: 'text-white', type: 'synth', freq: 100, wave: 'sawtooth', slide: -10, icon: Music },
  { id: 5, key: 'W', name: 'OOF', color: 'bg-yellow-500', text: 'text-black', type: 'voice', word: 'Oof', icon: Skull },
  { id: 6, key: 'E', name: 'DAMAGE', color: 'bg-orange-600', text: 'text-white', type: 'voice', word: 'Emotional Damage', icon: HeartCrack },
  { id: 7, key: 'R', name: 'SHEESH', color: 'bg-cyan-500', text: 'text-black', type: 'voice', word: 'Sheeeeeesh', icon: IceCream },
  { id: 8, key: 'A', name: '8-BIT JUMP', color: 'bg-pink-500', text: 'text-white', type: 'synth', freq: 150, wave: 'square', slide: 300, icon: Gamepad2 },
  { id: 9, key: 'S', name: 'LASER', color: 'bg-indigo-500', text: 'text-white', type: 'synth', freq: 800, wave: 'sawtooth', slide: -600, icon: Zap },
  { id: 10, key: 'D', name: 'WRONG', color: 'bg-red-700', text: 'text-white', type: 'synth', freq: 150, wave: 'sawtooth', slide: -20, icon: X },
  { id: 11, key: 'F', name: 'CORRECT', color: 'bg-green-600', text: 'text-white', type: 'synth', freq: 600, wave: 'sine', slide: 200, icon: Check },
  { id: 12, key: 'Z', name: 'WHAT', color: 'bg-gray-600', text: 'text-white', type: 'voice', word: 'What the hell', icon: HelpCircle },
  { id: 13, key: 'X', name: 'OMG', color: 'bg-rose-500', text: 'text-white', type: 'voice', word: 'Oh my god', icon: Pin },
  { id: 14, key: 'C', name: 'FBI', color: 'bg-blue-800', text: 'text-white', type: 'voice', word: 'FBI Open Up', icon: UserSearch },
  { id: 15, key: 'V', name: 'YEET', color: 'bg-orange-500', text: 'text-black', type: 'voice', word: 'Yeet', icon: Rocket },
];

export default function CrazySoundBoard() {
  // Audio Engine Refs
  const audioCtx = useRef(null);
  const mainGain = useRef(null);
  const analyser = useRef(null);
  const canvasRef = useRef(null);
  
  // App State
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedEvents, setRecordedEvents] = useState([]);
  const [recordingStartTime, setRecordingStartTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [status, setStatus] = useState("IDLE");
  const [timerDisplay, setTimerDisplay] = useState("00:00");
  const [activePads, setActivePads] = useState({});
  
  const playTimeouts = useRef([]);

  // --- Initialize Audio Context (Browser requirement: must happen on user click) ---
  const initAudio = useCallback(() => {
    if (!audioCtx.current) {
      const Context = window.AudioContext || window.webkitAudioContext;
      audioCtx.current = new Context();
      mainGain.current = audioCtx.current.createGain();
      analyser.current = audioCtx.current.createAnalyser();
      
      mainGain.current.gain.value = 0.5;
      analyser.current.fftSize = 256;
      
      mainGain.current.connect(analyser.current);
      analyser.current.connect(audioCtx.current.destination);
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  }, []);

  // --- Visualizer Drawing Loop ---
  useEffect(() => {
    let animationFrame;
    const draw = () => {
      if (!canvasRef.current || !analyser.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const bufferLength = analyser.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      analyser.current.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#ff00ff'); // Crazy Pink
        gradient.addColorStop(1, '#00ffff'); // Crazy Cyan
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
      animationFrame = requestAnimationFrame(draw);
    };
    
    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // --- Play Sound Synthesis Logic ---
  const playSound = useCallback((soundId, isAuto = false) => {
    initAudio();
    const sound = SOUND_BANK.find(s => s.id === soundId);
    if (!sound || !audioCtx.current || !mainGain.current) return;

    // Trigger visual button press
    setActivePads(prev => ({ ...prev, [soundId]: true }));
    setTimeout(() => setActivePads(prev => ({ ...prev, [soundId]: false })), 150);

    // If recording, log the time and sound ID
    if (isRecording && !isAuto) {
      const time = Date.now() - recordingStartTime;
      setRecordedEvents(prev => [...prev, { id: soundId, time }]);
    }

    const ctx = audioCtx.current;
    const time = ctx.currentTime;

    if (sound.type === 'voice') {
      const utterance = new SpeechSynthesisUtterance(sound.word);
      utterance.rate = 1 + (Math.random() * 0.4 - 0.2);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      
      // Send a dummy blip to the analyzer so the visualizer reacts to voices
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(mainGain.current);
      g.gain.value = 0.001;
      osc.start(); osc.stop(time + 0.1);

    } else if (sound.type === 'horn') {
      [350, 355].forEach(f => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, time);
        osc.frequency.linearRampToValueAtTime(f - 50, time + 0.3);
        g.gain.setValueAtTime(0.3, time);
        g.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        osc.connect(g); g.connect(mainGain.current);
        osc.start(); osc.stop(time + 0.5);
      });
    } else if (sound.type === 'boom') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.setValueAtTime(80, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.4);
      g.gain.setValueAtTime(0.8, time);
      g.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
      osc.connect(g); g.connect(mainGain.current);
      osc.start(); osc.stop(time + 0.5);
    } else if (sound.type === 'synth') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = sound.wave || 'sine';
      osc.frequency.setValueAtTime(sound.freq || 440, time);
      if (sound.slide) osc.frequency.linearRampToValueAtTime((sound.freq || 440) + sound.slide, time + 0.2);
      g.gain.setValueAtTime(0.3, time);
      g.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
      osc.connect(g); g.connect(mainGain.current);
      osc.start(); osc.stop(time + 0.3);
    }
  }, [isRecording, recordingStartTime, initAudio]);

  // --- Playback Controls ---
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    playTimeouts.current.forEach(clearTimeout);
    playTimeouts.current = [];
    if (!isRecording) setStatus("IDLE");
  }, [isRecording]);

  const toggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setStatus("SAVED");
      setDuration(Date.now() - recordingStartTime);
    } else {
      stopPlayback();
      setRecordedEvents([]);
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      setStatus("RECORDING");
    }
  };

  const playRecording = useCallback(() => {
    if (recordedEvents.length === 0) return;
    stopPlayback();
    setIsPlaying(true);
    setStatus("PLAYING");

    const runSequence = () => {
      recordedEvents.forEach(evt => {
        const t = setTimeout(() => playSound(evt.id, true), evt.time);
        playTimeouts.current.push(t);
      });

      const endT = setTimeout(() => {
        if (isLooping) runSequence();
        else stopPlayback();
      }, duration + 500);
      playTimeouts.current.push(endT);
    };

    runSequence();
  }, [recordedEvents, duration, isLooping, playSound, stopPlayback]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      const sound = SOUND_BANK.find(s => s.key === e.key.toUpperCase());
      if (sound) playSound(sound.id);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playSound]);

  // Timer Effect for Recording
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      const diff = Date.now() - recordingStartTime;
      const secs = Math.floor(diff / 1000).toString().padStart(2, '0');
      const ms = Math.floor((diff % 1000) / 10).toString().padStart(2, '0');
      setTimerDisplay(`${secs}:${ms}`);
    }, 50);
    return () => clearInterval(interval);
  }, [isRecording, recordingStartTime]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center p-4 selection:bg-cyan-500/30">
      {/* CRT Scanline Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>

      <header className="w-full max-w-4xl mt-6 flex flex-col items-center z-10">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] mb-2 animate-pulse">
          CRAZY SOUNDS
        </h1>
        <p className="text-slate-400 text-sm mb-6 font-mono border border-slate-700 px-3 py-1 rounded-full bg-slate-900/80">
          <span className={status === "RECORDING" ? "text-red-500 animate-pulse" : "text-green-400"}>●</span> SYSTEM READY // V 2.0
        </p>
        
        {/* Visualizer Canvas */}
        <div className="w-full h-24 bg-slate-900 rounded-lg border-2 border-slate-700 shadow-lg relative overflow-hidden group">
          <canvas ref={canvasRef} width={800} height={100} className="w-full h-full opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
            <span className="text-slate-600 font-mono text-xs">AUDIO VISUALIZER OUTPUT</span>
          </div>
        </div>
      </header>

      {/* Control Dashboard */}
      <div className="w-full max-w-4xl mt-6 z-10">
        <div className="bg-slate-800/50 backdrop-blur-md p-4 rounded-xl border border-slate-700 flex flex-wrap gap-4 items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full transition-colors ${
              status === "RECORDING" ? "bg-red-500 animate-pulse" : 
              status === "PLAYING" ? "bg-green-400 shadow-[0_0_10px_#4ade80]" : "bg-slate-500"
            }`} />
            <span className="font-mono text-sm text-slate-300 w-24">{status}</span>
            <span className={`font-mono text-sm text-cyan-400 ml-2 transition-opacity ${isRecording ? 'opacity-100' : 'opacity-0'}`}>
              {timerDisplay}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={toggleRecord} 
              className={`flex items-center px-6 py-2 rounded-lg font-bold transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                isRecording ? 'bg-red-600 border-red-900 animate-pulse' : 'bg-slate-700 border-slate-900 hover:bg-red-500'
              }`}
            >
              <Circle className={`w-3 h-3 mr-2 fill-current ${isRecording ? 'text-white' : 'text-red-500'}`} />
              REC
            </button>
            
            <button onClick={stopPlayback} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-all border-b-4 border-slate-900 active:border-b-0 active:translate-y-1">
              <Square className="w-3 h-3 mr-2 fill-current" /> STOP
            </button>

            <button 
              onClick={playRecording} 
              disabled={recordedEvents.length === 0}
              className="px-6 py-2 bg-slate-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition-all border-b-4 border-slate-900 hover:border-green-900 active:border-b-0 active:translate-y-1"
            >
              <Play className="w-3 h-3 mr-2 fill-current" /> PLAY
            </button>
            
            <button 
              onClick={() => { stopPlayback(); setRecordedEvents([]); setStatus("CLEARED"); }} 
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center cursor-pointer group">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={isLooping} onChange={() => setIsLooping(!isLooping)} />
                <div className="block bg-slate-900 w-10 h-6 rounded-full border border-slate-600 group-hover:border-slate-400 transition-colors" />
                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-200 ${isLooping ? 'translate-x-4 bg-cyan-400' : 'bg-white'}`} />
              </div>
              <div className="ml-3 text-sm font-medium text-slate-300">LOOP</div>
            </label>
          </div>
        </div>
      </div>

      {/* The Sound Grid */}
      <main className="w-full max-w-4xl p-4 z-10 mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 select-none">
          {SOUND_BANK.map((sound) => {
            const Icon = sound.icon;
            return (
              <button
                key={sound.id}
                onMouseDown={() => playSound(sound.id)}
                className={`
                  relative h-24 md:h-32 rounded-xl flex flex-col items-center justify-center gap-2 shadow-lg 
                  hover:brightness-110 border-b-4 border-black/30 active:border-b-0 transition-all
                  ${sound.color} ${sound.text}
                  ${activePads[sound.id] ? 'scale-95 translate-y-1 brightness-125' : ''}
                `}
              >
                <span className="text-[10px] font-mono opacity-60 absolute top-2 left-3 border border-white/20 px-1 rounded">
                  {sound.key}
                </span>
                <Icon className="w-6 h-6 md:w-8 md:h-8 drop-shadow-md" />
                <span className="text-xs md:text-sm font-bold tracking-wider uppercase drop-shadow-md">
                  {sound.name}
                </span>
                {/* Active ripple effect */}
                {activePads[sound.id] && (
                  <div className="absolute inset-0 bg-white/20 animate-ping rounded-xl pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
        
        <div className="mt-8 text-center text-slate-500 text-[10px] md:text-xs font-mono space-y-1 uppercase tracking-widest">
          <p>Keyboard Shortcuts: 1-4, Q-R, A-F, Z-V</p>
          <p>Built for CrazyTools Project</p>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700;900&display=swap');
        
        body {
          font-family: 'Space Grotesk', sans-serif;
          background-image: radial-gradient(circle at 50% 50%, #1e293b 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Custom scrollbar for a cleaner look */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0f172a;
        }
        ::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}