"use client";

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const Project = () => {
    const [speed, setSpeed] = useState("0.0");
    const [ping, setPing] = useState("--");
    const [jitter, setJitter] = useState("--");
    const [stability, setStability] = useState("--");
    const [isTesting, setIsTesting] = useState(false);
    const [provider, setProvider] = useState("System Ready");
    const [history, setHistory] = useState([]);
    const [dashOffset, setDashOffset] = useState(126);

    const TEST_URL = "https://speed.cloudflare.com/__down?bytes=20000000"; // 20MB
    const PING_URL = "https://1.1.1.1/cdn-cgi/trace";

    useEffect(() => {
        // Init logic
        const fetchProvider = async () => {
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                setProvider(`${data.org} • ${data.city}`);
            } catch (e) {
                console.log("Provider fetch failed");
            }
        };

        const savedHistory = JSON.parse(localStorage.getItem('speed_history_lite') || '[]');
        setHistory(savedHistory);
        fetchProvider();
    }, []);

    const updateGauge = (val) => {
        setSpeed(val);
        const limit = 100; // max Mbps for gauge scale
        const percentage = Math.min(val / limit, 1);
        const offset = 126 - (percentage * 126);
        setDashOffset(offset);
    };

    const saveRecord = (finalSpeed, finalPing) => {
        const newRecord = { 
            speed: finalSpeed, 
            ping: finalPing, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
        const updatedHistory = [newRecord, ...history].slice(0, 5);
        setHistory(updatedHistory);
        localStorage.setItem('speed_history_lite', JSON.stringify(updatedHistory));
    };

    const startTest = async () => {
        if (isTesting) return;
        setIsTesting(true);

        // 1. Ping Test
        const pings = [];
        for (let i = 0; i < 4; i++) {
            const start = performance.now();
            await fetch(PING_URL, { mode: 'no-cors', cache: 'no-store' });
            pings.push(performance.now() - start);
        }
        const avgPing = Math.round(pings.reduce((a, b) => a + b) / pings.length);
        const currentJitter = Math.round(Math.max(...pings) - Math.min(...pings));
        
        setPing(avgPing);
        setJitter(currentJitter);
        setStability(100 - Math.min(currentJitter, 100));

        // 2. Download Test
        try {
            const startDownload = performance.now();
            const response = await fetch(TEST_URL + "&cb=" + startDownload);
            const reader = response.body.getReader();
            let received = 0;
            let lastSpeed = "0.0";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                received += value.length;

                const duration = (performance.now() - startDownload) / 1000;
                const mbps = ((received * 8) / (1024 * 1024) / duration).toFixed(1);
                lastSpeed = mbps;
                updateGauge(mbps);
            }

            saveRecord(lastSpeed, avgPing);
        } catch (error) {
            console.error("Test failed", error);
        }

        setIsTesting(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-[#080808] text-white font-['Bricolage_Grotesque',_sans-serif]">
            <Head>
                <title>LiteSpeed | Ultra-Minimal Speed Test</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,500;12..96,800&display=swap');
                    
                    :root {
                        --accent: #0066FF;
                        --bg: #080808;
                        --card: #121212;
                        --border: rgba(255, 255, 255, 0.08);
                    }

                    .hero-glow {
                        background: radial-gradient(circle at 50% 50%, rgba(0, 102, 255, 0.15) 0%, transparent 70%);
                    }

                    .gauge-container {
                        position: relative;
                        width: 320px;
                        height: 180px;
                    }

                    #progress-arc {
                        transition: stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1);
                        stroke-linecap: round;
                    }

                    .stat-card {
                        background: var(--card);
                        border: 1px solid var(--border);
                        transition: all 0.3s ease;
                    }

                    .stat-card:hover {
                        border-color: rgba(0, 102, 255, 0.4);
                        background: #161616;
                    }

                    .speed-val {
                        font-variant-numeric: tabular-nums;
                        letter-spacing: -0.05em;
                    }

                    @keyframes wave {
                        0% { transform: scaleY(0.5); }
                        50% { transform: scaleY(1.2); }
                        100% { transform: scaleY(0.5); }
                    }
                    .wave-bar {
                        width: 3px;
                        background: var(--accent);
                        margin: 0 2px;
                        border-radius: 4px;
                        opacity: 0;
                        transition: opacity 0.3s;
                    }
                    .is-testing .wave-bar {
                        opacity: 1;
                        animation: wave 1s ease-in-out infinite;
                    }

                    .history-item {
                        border-bottom: 1px solid var(--border);
                    }
                `}</style>
            </Head>

            {/* Navbar */}
            <nav className="w-full max-w-5xl h-24 flex items-center justify-between px-6 z-10">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="font-extrabold text-xl tracking-tighter">LITE<span className="text-blue-600">SPEED</span></span>
                </div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 bg-zinc-900 px-4 py-2 rounded-full border border-white/5">
                    {provider}
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center px-6 relative">
                <div className="hero-glow absolute inset-0 -z-10"></div>

                {/* Testing Visualizer */}
                <div className={`flex flex-col items-center ${isTesting ? 'is-testing' : ''}`}>
                    
                    <div className="gauge-container mb-4">
                        <svg viewBox="0 0 100 55" className="w-full h-full">
                            {/* Track */}
                            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1a1a1a" strokeWidth="6" />
                            {/* Progress */}
                            <path 
                                id="progress-arc" 
                                d="M 10 50 A 40 40 0 0 1 90 50" 
                                fill="none" 
                                stroke="#0066FF" 
                                strokeWidth="6" 
                                strokeDasharray="126" 
                                strokeDashoffset={dashOffset} 
                            />
                        </svg>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                            <div className="speed-val text-8xl font-extrabold leading-none">{speed}</div>
                            <div className="text-zinc-500 text-sm font-medium uppercase tracking-[0.2em] mt-2">Mbps</div>
                        </div>
                    </div>

                    {/* Waveform visualizer */}
                    <div className="h-8 flex items-end mb-12">
                        <div className="wave-bar" style={{ height: '60%', animationDelay: '0.1s' }}></div>
                        <div className="wave-bar" style={{ height: '100%', animationDelay: '0.2s' }}></div>
                        <div className="wave-bar" style={{ height: '70%', animationDelay: '0.3s' }}></div>
                        <div className="wave-bar" style={{ height: '90%', animationDelay: '0.4s' }}></div>
                        <div className="wave-bar" style={{ height: '50%', animationDelay: '0.5s' }}></div>
                    </div>

                    <button 
                        onClick={startTest} 
                        className={`group relative px-12 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:pr-16 active:scale-95 ${isTesting ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <span className="relative z-10">{isTesting ? 'MEASURING...' : 'START TEST'}</span>
                        <i className="fas fa-arrow-right absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all"></i>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-20">
                    <div className="stat-card rounded-2xl p-6">
                        <div className="text-zinc-500 text-xs font-bold uppercase mb-4 tracking-widest">Ping</div>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-3xl font-extrabold">{ping}</span>
                            <span className="text-zinc-500 text-xs">ms</span>
                        </div>
                    </div>
                    <div className="stat-card rounded-2xl p-6">
                        <div className="text-zinc-500 text-xs font-bold uppercase mb-4 tracking-widest">Jitter</div>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-3xl font-extrabold">{jitter}</span>
                            <span className="text-zinc-500 text-xs">ms</span>
                        </div>
                    </div>
                    <div className="stat-card rounded-2xl p-6">
                        <div className="text-zinc-500 text-xs font-bold uppercase mb-4 tracking-widest">Stability</div>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-3xl font-extrabold">{stability}</span>
                            <span className="text-zinc-500 text-xs">%</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* History Bar */}
            <div className="w-full max-w-5xl mt-12 mb-20 px-6">
                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-6">Recent Records</h3>
                <div className="space-y-0">
                    {history.map((item, index) => (
                        <div key={index} className="history-item flex items-center justify-between py-5 transition-all hover:bg-white/[0.02] px-2">
                            <div className="flex items-center space-x-6">
                                <span className="text-zinc-600 text-[10px] font-bold">{item.time}</span>
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-xl font-extrabold">{item.speed}</span>
                                    <span className="text-zinc-600 text-[10px] uppercase font-bold">Mbps</span>
                                </div>
                            </div>
                            <div className="text-blue-600 text-xs font-bold">{item.ping} ms</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Project;