"use client";

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const Project = () => {
    // --- State ---
    const [config, setConfig] = useState({
        fullCode: "",
        rawSpeed: 150,
        demoTime: 8,
        startDelay: 2,
        endDelay: 2
    });
    const [isRunning, setIsRunning] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showSettings, setShowSettings] = useState(true);
    const [countdown, setCountdown] = useState(null);
    const [showDownload, setShowDownload] = useState(false);
    const [videoUrl, setVideoUrl] = useState("");

    // --- Refs ---
    const codeDisplayRef = useRef(null);
    const scrollBoxRef = useRef(null);
    const previewFrameRef = useRef(null);
    const previewContainerRef = useRef(null);
    const previewHeaderRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const charIndexRef = useRef(0);
    const currentTypedCodeRef = useRef("");
    const isRunningRef = useRef(false);

    // --- Initialization ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") stopProduction();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- Core Logic ---

    const updateIframeFull = (htmlContent) => {
        if (previewFrameRef.current) {
            previewFrameRef.current.srcDoc = htmlContent;
        }
    };

    const updateIframeStream = (htmlContent) => {
        const frame = previewFrameRef.current;
        if (!frame) return;
        const frameDoc = frame.contentDocument || frame.contentWindow.document;
        if (!frameDoc || !frameDoc.body) return;

        const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const contentToInject = bodyMatch ? bodyMatch[1] : htmlContent;

        frameDoc.body.innerHTML = contentToInject;
        frame.contentWindow.scrollTo({ top: frameDoc.body.scrollHeight, behavior: 'instant' });
    };

    const typeEngine = () => {
        if (!isRunningRef.current || charIndexRef.current >= config.fullCode.length) {
            updateIframeFull(config.fullCode);
            setTimeout(stopProduction, 1000);
            return;
        }

        let burst = 1;
        let delay = 101 - Math.min(config.rawSpeed, 100);
        if (config.rawSpeed > 100) {
            burst = Math.floor((config.rawSpeed - 80) / 4);
            delay = 0;
        }

        for (let i = 0; i < burst; i++) {
            if (charIndexRef.current < config.fullCode.length) {
                currentTypedCodeRef.current += config.fullCode[charIndexRef.current];
                charIndexRef.current++;
            }
        }

        if (window.Prism && codeDisplayRef.current) {
            codeDisplayRef.current.innerHTML = window.Prism.highlight(
                currentTypedCodeRef.current,
                window.Prism.languages.markup,
                'markup'
            );
        }
        
        if (scrollBoxRef.current) {
            scrollBoxRef.current.scrollTop = scrollBoxRef.current.scrollHeight;
        }

        if (charIndexRef.current % 3 === 0 || charIndexRef.current >= config.fullCode.length) {
            updateIframeStream(currentTypedCodeRef.current);
        }

        setTimeout(typeEngine, delay);
    };

    const runTeaserPhase = async () => {
        previewContainerRef.current.classList.add('preview-fullscreen');
        previewHeaderRef.current.style.display = 'none';
        
        updateIframeFull(config.fullCode); 

        await new Promise(r => setTimeout(r, config.startDelay * 1000));

        const duration = config.demoTime * 1000;
        const startTime = performance.now();
        
        await new Promise(resolve => {
            function scroll(time) {
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const frame = previewFrameRef.current;
                const doc = frame.contentDocument || frame.contentWindow.document;
                if (doc && doc.body) {
                    const maxScroll = doc.body.scrollHeight - frame.clientHeight;
                    frame.contentWindow.scrollTo(0, Math.max(0, maxScroll) * progress);
                }
                if (progress < 1) requestAnimationFrame(scroll);
                else resolve();
            }
            requestAnimationFrame(scroll);
        });

        await new Promise(r => setTimeout(r, config.endDelay * 1000));
        previewContainerRef.current.classList.remove('preview-fullscreen');
        previewHeaderRef.current.style.display = 'flex';
    };

    const startProduction = async () => {
        if (!config.fullCode) return alert("Please Initialize Production first!");
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ 
                video: { frameRate: 60, cursor: 'never' } 
            });
            
            // Countdown
            for (let i = 3; i > 0; i--) {
                setCountdown(i);
                await new Promise(r => setTimeout(r, 1000));
            }
            setCountdown(null);

            if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
            setIsRecording(true);

            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
            mediaRecorderRef.current = recorder;
            recordedChunksRef.current = [];
            
            recorder.ondataavailable = e => recordedChunksRef.current.push(e.data);
            recorder.onstop = handleBlob;
            recorder.start();

            await runTeaserPhase();

            isRunningRef.current = true;
            setIsRunning(true);
            charIndexRef.current = 0;
            currentTypedCodeRef.current = "";
            
            const headMatch = config.fullCode.match(/<head[^>]*>([\s\S]*)<\/head>/i);
            const headContent = headMatch ? headMatch[1] : '';
            previewFrameRef.current.srcDoc = `<!DOCTYPE html><html><head>${headContent}</head><body></body></html>`;
            
            setTimeout(typeEngine, 500);

        } catch (err) { console.error(err); }
    };

    const stopProduction = () => {
        isRunningRef.current = false;
        setIsRunning(false);
        setIsRecording(false);
        if (document.fullscreenElement) document.exitFullscreen();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        }
    };

    const handleBlob = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setShowDownload(true);
    };

    const saveAndInitialize = () => {
        const codeInput = document.getElementById('codeInput').value;
        if(!codeInput) return alert("Please paste some code.");
        
        const newConfig = {
            ...config,
            fullCode: codeInput,
            rawSpeed: parseInt(document.getElementById('speedRange').value),
            demoTime: parseInt(document.getElementById('demoTime').value) || 8,
            startDelay: parseInt(document.getElementById('startDelay').value) || 2,
            endDelay: parseInt(document.getElementById('endDelay').value) || 2,
        };
        setConfig(newConfig);
        setShowSettings(false);
        updateIframeFull(codeInput);
    };

    const handleResizer = (e) => {
        const onMove = (moveEvent) => {
            const width = window.innerWidth - moveEvent.clientX;
            if (previewContainerRef.current) {
                previewContainerRef.current.style.width = width + 'px';
            }
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', () => document.removeEventListener('mousemove', onMove), { once: true });
    };

    return (
        <div className={`flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc] font-['Segoe_UI',_sans-serif] overflow-hidden ${isRecording ? 'is-recording' : ''}`}>
            <Head>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js" strategy="beforeInteractive"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markup.min.js" strategy="beforeInteractive"></script>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Fira_Code:wght@400;500&display=swap');
                    .code-font { font-family: 'Fira Code', monospace; }
                    #scroll-box::-webkit-scrollbar { width: 10px; height: 10px; }
                    #scroll-box::-webkit-scrollbar-track { background: transparent; }
                    #scroll-box::-webkit-scrollbar-thumb { background: rgba(121, 121, 121, 0.2); border: 2px solid transparent; background-clip: content-box; }
                    #scroll-box::-webkit-scrollbar-thumb:hover { background: rgba(121, 121, 121, 0.4); }
                    .is-recording header { display: none !important; }
                    .is-recording .resizer { display: none !important; }
                    .resizer { width: 3px; cursor: col-resize; z-index: 10; background: #2b2b2b; }
                    .preview-fullscreen { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 500 !important; background: black; }
                    .cursor { display: inline-block; width: 2px; height: 1.1em; background: #aeafad; margin-left: 1px; vertical-align: text-bottom; animation: blink 1s step-end infinite; }
                    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                    iframe { background: white; border: none; }
                `}</style>
            </Head>

            {countdown && (
                <div className="fixed inset-0 bg-[#1e1e1e] z-[1000] flex items-center justify-center text-[8rem] font-black text-white">
                    {countdown}
                </div>
            )}

            <header className="h-9 border-b border-[#3c3c3c] bg-[#323233] flex items-center justify-between px-3 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Studio Production</span>
                </div>
                <div className="flex items-center gap-2">
                    {showDownload && (
                        <a href={videoUrl} download={`IDE_RECORDING_${Date.now()}.webm`} className="bg-[#2ea44f] hover:bg-[#2c974b] text-white px-3 py-0.5 rounded text-[10px] font-bold">
                            DOWNLOAD VIDEO
                        </a>
                    )}
                    <button onClick={() => setShowSettings(true)} className="text-gray-300 hover:bg-[#454545] px-2 py-0.5 rounded text-[10px]">SETTINGS</button>
                    <button onClick={startProduction} className="bg-[#007acc] hover:bg-[#118ad4] text-white px-4 py-0.5 rounded text-[10px] font-bold">START RECORDING</button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                <aside className="w-12 bg-[#333333] flex flex-col items-center py-4 gap-6 text-[#858585] shrink-0">
                    <i className="fa-solid fa-code text-lg text-white"></i>
                    <i className="fa-solid fa-layer-group text-lg"></i>
                    <i className="fa-solid fa-play text-lg"></i>
                </aside>

                <main className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                    <div className="h-9 bg-[#2d2d2d] flex items-center">
                        <div className="bg-[#1e1e1e] text-[#e1e1e1] text-[11px] h-full flex items-center px-4 border-t border-[#007acc]">
                            <i className="fa-brands fa-html5 text-orange-500 mr-2 text-xs"></i> index.html
                        </div>
                    </div>
                    <div ref={scrollBoxRef} id="scroll-box" className="flex-1 overflow-auto p-5 code-font text-[14px] leading-[1.6]">
                        <pre ref={codeDisplayRef} className="language-html !bg-transparent !m-0 !p-0 inline"></pre>
                        <span className="cursor"></span>
                    </div>
                </main>

                <div className="resizer" onMouseDown={handleResizer}></div>

                <section ref={previewContainerRef} className="w-[50%] bg-white flex flex-col border-l border-[#3c3c3c] shrink-0 relative">
                    <div ref={previewHeaderRef} className="h-9 bg-[#e1e1e1] border-b border-[#cccccc] flex items-center px-4 shrink-0">
                        <div className="text-[9px] text-gray-400 bg-white border border-gray-200 px-3 py-1 rounded w-full text-center">
                            https://localhost:3000
                        </div>
                    </div>
                    <iframe ref={previewFrameRef} className="flex-1 w-full"></iframe>
                </section>
            </div>

            {/* SETTINGS MODAL */}
            {showSettings && (
                <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 z-[600] backdrop-blur-[15px]">
                    <div className="bg-[#252526] border border-[#3c3c3c] w-full max-w-2xl rounded shadow-2xl">
                        <div className="p-3 border-b border-[#3c3c3c] bg-[#323233] text-[10px] font-bold text-gray-400 uppercase">Production Config</div>
                        <div className="p-6 space-y-4">
                            <textarea id="codeInput" defaultValue={config.fullCode} className="w-full h-64 bg-[#1e1e1e] border border-[#3c3c3c] rounded p-3 text-xs code-font text-blue-300 outline-none" placeholder="Paste Full HTML Code here..."></textarea>
                            
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-1">
                                    <label className="text-[9px] text-gray-500 font-bold mb-1 block uppercase">Typing Speed</label>
                                    <input type="range" id="speedRange" min="1" max="250" defaultValue={config.rawSpeed} className="w-full" />
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 font-bold mb-1 block uppercase">Start Wait (S)</label>
                                    <input type="number" id="startDelay" defaultValue={config.startDelay} className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded p-1.5 text-xs text-white" />
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 font-bold mb-1 block uppercase">Scroll Time (S)</label>
                                    <input type="number" id="demoTime" defaultValue={config.demoTime} className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded p-1.5 text-xs text-white" />
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 font-bold mb-1 block uppercase">End Wait (S)</label>
                                    <input type="number" id="endDelay" defaultValue={config.endDelay} className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded p-1.5 text-xs text-white" />
                                </div>
                            </div>

                            <button onClick={saveAndInitialize} className="w-full bg-[#007acc] hover:bg-[#118ad4] py-3 rounded text-xs font-bold transition-all uppercase">Initialize Production</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Project;