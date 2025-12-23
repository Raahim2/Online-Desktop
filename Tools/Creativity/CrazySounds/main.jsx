"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Circle, 
  Square, 
  Play, 
  Trash2, 
  Bomb, 
  Megaphone, 
  Star, 
  Music, 
  Skull, 
  HeartCrack, 
  IceCream, 
  Gamepad2, 
  Bolt, 
  X as CloseIcon, 
  Check, 
  HelpCircle, 
  HandsPraying, 
  UserSearch, 
  Rocket,
  Menu,
  Volume2
} from 'lucide-react';

const SOUND_BANK = [
  { id: 0, key: '1', name: 'VINE BOOM', color: 'bg-slate-700', icon: <Bomb />, type: 'boom' },
  { id: 1, key: '2', name: 'AIR HORN', color: 'bg-red-500', icon: <Megaphone />, type: 'horn' },
  { id: 2, key: '3', name: 'BRUH', color: 'bg-blue-500', icon: <Volume2 />, type: 'voice', word: 'Bruh' },
  { id: 3, key: '4', name: 'WOW', color: 'bg-green-500', icon: <Star />, type: 'voice', word: 'Wow' },
  { id: 4, key: 'Q', name: 'SUSPENSE', color: 'bg-purple-600', icon: <Music />, type: 'synth', freq: 100, wave: 'sawtooth', slide: -10 },
  { id: 5, key: 'W', name: 'OOF', color: 'bg-yellow-500', icon: <Skull />, type: 'voice', word: 'Oof' },
  { id: 6, key: 'E', name: 'DAMAGE', color: 'bg-orange-600', icon: <HeartCrack />, type: 'voice', word: 'Emotional Damage' },
  { id: 7, key: 'R', name: 'SHEESH', color: 'bg-cyan-500', icon: <IceCream />, type: 'voice', word: 'Sheeeeeesh' },
  { id: 8, key: 'A', name: '8-BIT JUMP', color: 'bg-pink-500', icon: <Gamepad2 />, type: 'synth', freq: 150, wave: 'square', slide: 300 },
  { id: 9, key: 'S', name: 'LASER', color: 'bg-indigo-500', icon: <Bolt />, type: 'synth', freq: 800, wave: 'sawtooth', slide: -600 },
  { id: 10, key: 'D', name: 'WRONG', color: 'bg-red-700', icon: <CloseIcon />, type: 'synth', freq: 150, wave: 'sawtooth', slide: -20 },
  { id: 11, key: 'F', name: 'CORRECT', color: 'bg-green-600', icon: <Check />, type: 'synth', freq: 600, wave: 'sine', slide: 200 },
  { id: 12, key: 'Z', name: 'WHAT', color: 'bg-gray-600', icon: <HelpCircle />, type: 'voice', word: 'What the hell' },
  { id: 13, key: 'X', name: 'OMG', color: 'bg-rose-500', icon: <HandsPraying />, type: 'voice', word: 'Oh my god' },
  { id: 14, key: 'C', name: 'FBI', color: 'bg-blue-800', icon: <UserSearch />, type: 'voice', word: 'FBI Open Up' },
  { id: 15, key: 'V', name: 'YEET', color: 'bg-orange-500', icon: <Rocket />, type: 'voice', word: 'Yeet' },
];

export default function Project() {
  const [mounted, setMounted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [status, setStatus] = useState('IDLE');
  const [timer, setTimer] = useState('00:00');
  const [recordedEvents, setRecordedEvents] = useState([]);
  const [activePads, setActivePads] = useState({});

  // Audio Refs
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const mainGainRef = useRef(null);
  const canvasRef = useRef(null);
  const recordingStartRef = useRef(0);
  const playbackTimeoutsRef = useRef([]);

  useEffect(() => {
    setMounted(true);
    initAudio();
    const handleKeyDown = (e) => {
      const sound = SOUND_BANK.find(s => s.key === e.key.toUpperCase());
      if (sound) playSound(sound.id);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopPlayback();
    };
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      const gain = ctx.createGain();
      
      analyser.fftSize = 256;
      gain.connect(ctx.destination);
      gain.connect(analyser);
      gain.gain.value = 0.5;

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      mainGainRef.current = gain;
      drawVisualizer();
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      requestAnimationFrame(render);
      analyserRef.current.getByteFrequencyData(dataArray);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        ctx.fillStyle = `hsl(${280 + (i * 2)}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    render();
  };

  const playSound = (id) => {
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    const sound = SOUND_BANK.find(s => s.id === id);
    if (!sound) return;

    // Trigger Pad Animation
    setActivePads(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setActivePads(prev => ({ ...prev, [id]: false })), 150);

    // Recording logic
    if (isRecording) {
      const offset = Date.now() - recordingStartRef.current;
      setRecordedEvents(prev => [...prev, { id, time: offset }]);
    }

    const ctx = audioCtxRef.current;
    const mainGain = mainGainRef.current;

    // Audio Engine
    if (sound.type === 'voice') {
      const utt = new SpeechSynthesisUtterance(sound.word);
      utt.rate = 1.1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utt);
    } else if (sound.type === 'boom') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4);
      g.gain.setValueAtTime(0.8, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(g).connect(mainGain);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } else if (sound.type === 'horn') {
      [350, 355].forEach(f => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(f - 50, ctx.currentTime + 0.3);
        g.gain.setValueAtTime(0.3, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(g).connect(mainGain);
        osc.start(); osc.stop(ctx.currentTime + 0.5);
      });
    } else if (sound.type === 'synth') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = sound.wave;
      osc.frequency.setValueAtTime(sound.freq, ctx.currentTime);
      if (sound.slide) osc.frequency.linearRampToValueAtTime(sound.freq + sound.slide, ctx.currentTime + 0.2);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(g).connect(mainGain);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setStatus('SAVED');
    } else {
      stopPlayback();
      setRecordedEvents([]);
      setIsRecording(true);
      recordingStartRef.current = Date.now();
      setStatus('RECORDING');
      startTimer();
    }
  };

  const startTimer = () => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (!isRecording) {
        clearInterval(interval);
        return;
      }
      const diff = Date.now() - startTime;
      const secs = Math.floor(diff / 1000).toString().padStart(2, '0');
      const ms = Math.floor((diff % 1000) / 10).toString().padStart(2, '0');
      setTimer(`${secs}:${ms}`);
    }, 50);
  };

  const playRecording = () => {
    if (recordedEvents.length === 0) return;
    stopPlayback();
    setIsPlaying(true);
    setStatus('PLAYING');

    const duration = Math.max(...recordedEvents.map(e => e.time)) + 500;

    const runSequence = () => {
      recordedEvents.forEach(evt => {
        const t = setTimeout(() => playSound(evt.id), evt.time);
        playbackTimeoutsRef.current.push(t);
      });

      const endT = setTimeout(() => {
        if (isLooping) runSequence();
        else {
          setIsPlaying(false);
          setStatus('IDLE');
        }
      }, duration);
      playbackTimeoutsRef.current.push(endT);
    };

    runSequence();
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    playbackTimeoutsRef.current.forEach(clearTimeout);
    playbackTimeoutsRef.current = [];
    setStatus('IDLE');
  };

  if (!mounted) return <div className="h-screen bg-[#0f172a]" />;

  return (
    <div className="h-screen overflow-y-auto bg-[#0f172a] text-white flex flex-col items-center selection:bg-crazy-pink/30 relative">
      {/* CRT Scanline Effect */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Header */}
      <header className="w-full max-w-4xl mt-8 px-4 flex flex-col items-center z-10 shrink-0">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] via-purple-500 to-[#00ffff] drop-shadow-[0_0_15px_rgba(56,189,248,0.5)] animate-pulse mb-2">
          CRAZY SOUNDS
        </h1>
        <p className="text-slate-400 text-xs font-mono border border-slate-700 px-4 py-1 rounded-full bg-slate-900/80 mb-6">
          <span className={isRecording ? "text-red-500 animate-ping mr-2" : "text-green-400 mr-2"}>●</span> 
          SYSTEM READY // V2.0_REACT
        </p>
        
        <div className="w-full h-20 bg-slate-900 rounded-xl border-2 border-slate-700 shadow-2xl relative overflow-hidden group">
          <canvas ref={canvasRef} width={800} height={100} className="w-full h-full opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-600 font-mono text-[10px] uppercase tracking-[0.2em]">
            Visualizer Output
          </div>
        </div>
      </header>

      {/* Control Bar */}
      <div className="w-full max-w-4xl px-4 mt-6 z-10 shrink-0">
        <div className="bg-slate-800/50 backdrop-blur-xl p-4 rounded-2xl border border-slate-700 flex flex-wrap gap-4 items-center justify-between shadow-2xl">
          
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-colors ${
              isRecording ? 'bg-red-500 text-red-500' : isPlaying ? 'bg-green-400 text-green-400' : 'bg-slate-500 text-slate-500'
            }`} />
            <span className="font-mono text-sm font-bold w-20 tracking-tighter">{status}</span>
            <span className={`font-mono text-sm text-cyan-400 transition-opacity ${isRecording ? 'opacity-100' : 'opacity-0'}`}>
              {timer}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={toggleRecording}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                isRecording ? 'bg-red-600 border-red-900' : 'bg-slate-700 border-slate-900 hover:bg-slate-600'
              }`}
            >
              <Circle size={14} fill={isRecording ? 'white' : 'currentColor'} className={isRecording ? 'animate-pulse' : ''} />
              REC
            </button>
            
            <button 
              onClick={stopPlayback}
              className="flex items-center gap-2 px-5 py-2 bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 rounded-lg font-bold transition-all"
            >
              <Square size={14} fill="currentColor" /> STOP
            </button>

            <button 
              onClick={playRecording}
              disabled={recordedEvents.length === 0}
              className="flex items-center gap-2 px-5 py-2 bg-[#007acc] hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 rounded-lg font-bold transition-all"
            >
              <Play size={14} fill="currentColor" /> PLAY
            </button>
            
            <button 
              onClick={() => { setRecordedEvents([]); setStatus('CLEARED'); }}
              className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-slate-700"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center cursor-pointer group">
              <span className="mr-3 text-xs font-bold text-slate-400 group-hover:text-white transition-colors">LOOP</span>
              <div className="relative" onClick={() => setIsLooping(!isLooping)}>
                <div className={`block w-10 h-6 rounded-full border transition-colors ${isLooping ? 'bg-cyan-500/20 border-cyan-500' : 'bg-slate-900 border-slate-600'}`} />
                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-200 ${isLooping ? 'translate-x-4 bg-cyan-400' : 'bg-slate-500'}`} />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="w-full max-w-4xl p-4 z-10 mb-20 flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 select-none">
          {SOUND_BANK.map((sound) => (
            <button
              key={sound.id}
              onMouseDown={() => playSound(sound.id)}
              className={`
                group relative h-28 md:h-36 rounded-2xl flex flex-col items-center justify-center gap-2 
                transition-all duration-75 border-b-8 border-black/40 active:border-b-0 active:translate-y-2
                ${sound.color} shadow-xl overflow-hidden
                ${activePads[sound.id] ? 'brightness-150 scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]' : 'hover:brightness-110'}
              `}
            >
              {/* Key Label */}
              <span className="absolute top-3 left-3 px-1.5 py-0.5 rounded border border-white/20 text-[10px] font-mono opacity-50">
                {sound.key}
              </span>
              
              {/* Icon */}
              <div className="text-3xl md:text-4xl drop-shadow-2xl transition-transform group-hover:scale-110">
                {sound.icon}
              </div>
              
              {/* Name */}
              <span className="text-[10px] md:text-xs font-black tracking-widest uppercase opacity-90">
                {sound.name}
              </span>

              {/* Ripple effect overlay */}
              <div className={`absolute inset-0 bg-white/20 transition-opacity duration-300 ${activePads[sound.id] ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </div>
        
        <div className="mt-12 text-center text-slate-500">
          <div className="flex justify-center gap-4 mb-4">
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-md border border-slate-700">
               <Menu size={12} /> <span className="text-[10px] font-mono">1-4, Q-R, A-F, Z-V Shortcuts</span>
            </div>
          </div>
          <p className="text-[10px] font-mono tracking-widest opacity-50">EST. 2025 // CRAZYTOOLS CORE</p>
        </div>
      </main>

      <style jsx>{`
        body { background-color: #0f172a; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

