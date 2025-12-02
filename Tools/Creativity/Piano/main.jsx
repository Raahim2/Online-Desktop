import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Activity, Zap, Radio, Sliders, Music, Mic, Headphones, ArrowRight, Star } from 'lucide-react';

const Project = () => {
  // --- Audio State & Refs ---
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const oscillatorsRef = useRef(new Map()); // Tracks active notes for polyphony
  
  // --- UI State ---
  const [volume, setVolume] = useState(0.5);
  const [waveform, setWaveform] = useState('sine'); // sine, square, sawtooth, triangle
  const [activeNotes, setActiveNotes] = useState(new Set()); // For visual feedback
  const [isAudioInit, setIsAudioInit] = useState(false);

  // --- Piano Data Configuration ---
  const keys = [
    { note: 'C4', key: 'a', type: 'white', freq: 261.63 },
    { note: 'C#4', key: 'w', type: 'black', freq: 277.18, offset: '14.5%' },
    { note: 'D4', key: 's', type: 'white', freq: 293.66 },
    { note: 'D#4', key: 'e', type: 'black', freq: 311.13, offset: '27%' },
    { note: 'E4', key: 'd', type: 'white', freq: 329.63 },
    { note: 'F4', key: 'f', type: 'white', freq: 349.23 },
    { note: 'F#4', key: 't', type: 'black', freq: 369.99, offset: '52%' },
    { note: 'G4', key: 'g', type: 'white', freq: 392.00 },
    { note: 'G#4', key: 'y', type: 'black', freq: 415.30, offset: '64.5%' },
    { note: 'A4', key: 'h', type: 'white', freq: 440.00 },
    { note: 'A#4', key: 'u', type: 'black', freq: 466.16, offset: '77%' },
    { note: 'B4', key: 'j', type: 'white', freq: 493.88 },
    { note: 'C5', key: 'k', type: 'white', freq: 523.25 },
  ];

  // Map for O(1) lookup during keyboard events
  const keyMap = useRef(keys.reduce((acc, k) => ({ ...acc, [k.key]: k }), {}));

  // --- Audio Engine ---

  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      
      audioContextRef.current = ctx;
      masterGainRef.current = masterGain;
      setIsAudioInit(true);
    }
    
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      // Smooth volume transition
      masterGainRef.current.gain.setTargetAtTime(volume, audioContextRef.current.currentTime, 0.02);
    }
  }, [volume]);

  const startNote = (note, freq) => {
    initAudio();
    if (oscillatorsRef.current.has(note)) return; // Note already playing

    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Envelope: Attack (remove clicking)
    noteGain.gain.setValueAtTime(0, ctx.currentTime);
    noteGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);

    osc.connect(noteGain);
    noteGain.connect(masterGainRef.current);
    
    osc.start();

    // Store reference to stop it later
    oscillatorsRef.current.set(note, { osc, noteGain });
    
    // Update UI
    setActiveNotes(prev => new Set(prev).add(note));
  };

  const stopNote = (note) => {
    if (!oscillatorsRef.current.has(note)) return;

    const { osc, noteGain } = oscillatorsRef.current.get(note);
    const ctx = audioContextRef.current;

    // Envelope: Release (smooth fade out)
    const releaseTime = 0.1;
    noteGain.gain.cancelScheduledValues(ctx.currentTime);
    noteGain.gain.setValueAtTime(noteGain.gain.value, ctx.currentTime);
    noteGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + releaseTime);
    
    osc.stop(ctx.currentTime + releaseTime);
    
    // Cleanup after release
    setTimeout(() => {
        osc.disconnect();
        noteGain.disconnect();
    }, releaseTime * 1000);

    oscillatorsRef.current.delete(note);
    
    // Update UI
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  };

  // --- Event Listeners (Keyboard) ---

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat || e.ctrlKey || e.metaKey) return;
      const keyData = keyMap.current[e.key.toLowerCase()];
      if (keyData) {
        startNote(keyData.note, keyData.freq);
      }
    };

    const handleKeyUp = (e) => {
      const keyData = keyMap.current[e.key.toLowerCase()];
      if (keyData) {
        stopNote(keyData.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [waveform, volume]); // Depend on waveform to update tone instantly

  // --- Render Helpers ---

  const WaveformBtn = ({ type, label, icon: Icon }) => (
    <button
      onClick={() => setWaveform(type)}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 border ${
        waveform === type 
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' 
          : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
      }`}
    >
      <Icon size={16} />
      <span className="capitalize">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-indigo-500 selection:text-white">
     

      {/* Main Synthesizer Section */}
      <section className="py-12 md:py-20 px-4 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] -z-10"></div>

        

        {/* THE SYNTH UI */}
        <div className="w-full max-w-4xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden relative ring-1 ring-white/10">
          
          {/* Top Control Panel (Brushed Metal Look) */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 border-b border-gray-700 flex flex-col md:flex-row gap-8 justify-between items-center">
            
            {/* Waveform Selectors */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Activity size={14} /> Oscillator Shape
              </label>
              <div className="flex flex-wrap gap-2">
                <WaveformBtn type="sine" label="Sine" icon={Activity} />
                <WaveformBtn type="square" label="Square" icon={Zap} />
                <WaveformBtn type="sawtooth" label="Saw" icon={Activity} />
                <WaveformBtn type="triangle" label="Tri" icon={Radio} />
              </div>
            </div>

            {/* Volume / Master */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Volume2 size={14} /> Master Gain
              </label>
              <div className="flex items-center gap-4 bg-gray-950/50 p-3 rounded-lg border border-gray-800">
                <input 
                  type="range" 
                  min="0" 
                  max="0.8" 
                  step="0.01" 
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="font-mono text-indigo-400 text-sm w-12 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>

            {/* Status LED */}
            <div className="hidden md:flex flex-col items-center justify-center bg-gray-950 rounded-lg p-3 border border-gray-800 shadow-inner">
               <div className={`w-3 h-3 rounded-full mb-1 ${activeNotes.size > 0 ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-red-900'}`}></div>
               <span className="text-[10px] text-gray-500 font-mono uppercase">Gate</span>
            </div>
          </div>

          {/* Piano Bed */}
          <div className="relative h-64 md:h-80 bg-gray-950 p-1 select-none overflow-hidden">
            <div className="flex h-full w-full relative">
              {/* Render White Keys */}
              {keys.filter(k => k.type === 'white').map((k) => (
                <div
                  key={k.note}
                  onMouseDown={() => startNote(k.note, k.freq)}
                  onMouseUp={() => stopNote(k.note)}
                  onMouseLeave={() => stopNote(k.note)}
                  className={`
                    flex-1 relative z-0 border border-gray-300 rounded-b-md cursor-pointer
                    flex flex-col justify-end items-center pb-4 transition-all duration-75
                    ${activeNotes.has(k.note) 
                      ? 'bg-gradient-to-b from-gray-200 to-indigo-300 shadow-[inset_0_-5px_10px_rgba(0,0,0,0.2)]' 
                      : 'bg-white hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="font-bold text-gray-400 text-sm mb-1">{k.key.toUpperCase()}</span>
                  <span className="text-[10px] text-gray-300 font-mono">{k.note}</span>
                </div>
              ))}
            </div>

            {/* Render Black Keys (Absolute Overlay) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none pl-[calc(100%/16)] pr-[calc(100%/16)]">
               {keys.filter(k => k.type === 'black').map((k) => (
                 <div
                   key={k.note}
                   style={{ left: k.offset }}
                   className="absolute top-0 h-[60%] w-[6%] pointer-events-auto"
                 >
                   <div
                    onMouseDown={() => startNote(k.note, k.freq)}
                    onMouseUp={() => stopNote(k.note)}
                    onMouseLeave={() => stopNote(k.note)}
                    className={`
                      w-full h-full rounded-b-md cursor-pointer border-x border-b border-black transition-transform duration-75
                      flex flex-col justify-end items-center pb-3 shadow-lg
                      ${activeNotes.has(k.note)
                        ? 'bg-indigo-600 scale-[0.98] shadow-none'
                        : 'bg-gray-900 from-gray-800 to-black bg-gradient-to-b hover:bg-gray-800'
                      }
                    `}
                   >
                     <span className="font-bold text-gray-500 text-xs">{k.key.toUpperCase()}</span>
                   </div>
                 </div>
               ))}
            </div>
            
            {/* Red Felt Strip decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-red-900/80 shadow-md pointer-events-none z-20"></div>
          </div>
        </div>

        {/* Keyboard Instructions */}
        <div className="mt-8 flex gap-8 text-sm text-gray-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="bg-gray-800 px-2 py-1 rounded text-gray-300 border border-gray-700">A</span>
            <span>to</span>
            <span className="bg-gray-800 px-2 py-1 rounded text-gray-300 border border-gray-700">K</span>
            <span>White Keys</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-gray-800 px-2 py-1 rounded text-gray-300 border border-gray-700">W</span>
            <span className="bg-gray-800 px-2 py-1 rounded text-gray-300 border border-gray-700">E</span>
            <span>etc... Black Keys</span>
          </div>
        </div>
      </section>

      {/* Featured Gear Section (Context) */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
             <h2 className="text-3xl font-bold text-gray-900">Premium Instruments</h2>
             <a href="#" className="text-indigo-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">View Shop <ArrowRight size={18} /></a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Prophet Rev2", type: "Analog Synth", price: "$1,999", color: "bg-yellow-500" },
              { name: "Moog Sub 37", type: "Paraphonic Synth", price: "$1,899", color: "bg-gray-800" },
              { name: "Korg Minilogue", type: "Polyphonic Synth", price: "$549", color: "bg-gray-400" },
              { name: "Nord Stage 3", type: "Stage Piano", price: "$4,499", color: "bg-red-600" }
            ].map((item, i) => (
              <div key={i} className="group bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition duration-300">
                <div className={`h-48 ${item.color} flex items-center justify-center relative`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
                  <Music className="text-white opacity-80" size={64} />
                  <div className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full">
                    <Star size={14} className="fill-orange-400 text-orange-400" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs font-bold text-indigo-600 uppercase mb-1">{item.type}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">{item.price}</span>
                    <button className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-900 hover:text-white transition">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    
    </div>
  );
};

export default Project;