"use client";

import React, { useState, useRef, useEffect } from 'react';

export default function Project() {
  // --- State ---
  const [url, setUrl] = useState("https://www.bbc.com/news/technology-67300000");
  const [browserUrl, setBrowserUrl] = useState("about:blank");
  const [logs, setLogs] = useState([{ text: "System initialized" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [verdict, setVerdict] = useState(null);
  
  // Ref for auto-scrolling logs
  const logContainerRef = useRef(null);

  // --- Effects ---
  
  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // --- Helpers ---
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const addLog = (text, subtext = null) => {
    setLogs((prev) => [...prev, { text, subtext }]);
  };

  const handleAnalyze = async () => {
    if (!url) return;

    // Reset State
    setIsLoading(true);
    setScrapedData(null);
    setVerdict(null);
    setLogs([]); // Clear previous logs
    
    addLog("Initializing Agent Process", "Mode: Auto-Intervention");

    // 1. Scrape Simulation
    setBrowserUrl(url);
    await delay(800);
    addLog(`Visiting Target URL`, url);

    try {
      // Using Microlink API as per original HTML
      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&palette=true`);
      const json = await response.json();
      const data = json.data;

      // 2. Render Page
      setScrapedData(data);
      setIsLoading(false);

      // 3. Analysis Simulation Steps
      await delay(1000);
      addLog("Parsing DOM Structure", "Found 42 paragraphs, 3 images");

      await delay(1200);
      const titleSnippet = data.title ? data.title.substring(0, 15) : "Unknown";
      addLog("Extracting Claims", `Identified entity: "${titleSnippet}..."`);

      await delay(1000);
      addLog("Querying Knowledge Base", "Cross-referencing 3 trusted nodes...");

      await delay(1000);
      addLog("Running Sentiment Analysis", "Detecting emotional charge...");

      await delay(800);
      addLog("Finalizing Verdict", "Generating JSON report...");

      // 4. Calculate Verdict
      calculateVerdict(data, url);

    } catch (e) {
      addLog("Error", "Connection Refused / Scraper Blocked");
      setIsLoading(false);
    }
  };

  const calculateVerdict = (data, currentUrl) => {
    // Simple mock logic from original HTML
    const isReliable = ['bbc', 'reuters', 'wikipedia', 'techcrunch'].some((d) => 
      currentUrl.toLowerCase().includes(d)
    );

    const color = isReliable ? '#22c55e' : '#ef4444'; // Green vs Red

    setVerdict({
      score: isReliable ? 94 : 42,
      color: color,
      text: isReliable ? "High Credibility" : "Suspected Misinfo",
      factScore: isReliable ? 90 : 30,
      biasScore: isReliable ? 20 : 85, // Low bias is good, high bias is visually represented
      repScore: isReliable ? 95 : 15,
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0f0f0f] text-[#a3a3a3] font-mono overflow-hidden text-[13px]">
      {/* Styles for fonts and scrollbars specifically for this component */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap');
        
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #0f0f0f; border-left: 1px solid #2a2a2a; }
        ::-webkit-scrollbar-thumb { background: #333; border: 2px solid #0f0f0f; border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .cursor-blink::after {
            content: '▋';
            animation: blink 1s step-end infinite;
            margin-left: 2px;
            color: #3b82f6;
        }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>

      {/* --- Header --- */}
      <header className="h-10 shrink-0 border-b border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-between px-4 text-xs select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#ededed] font-semibold">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span>Veritas Agent</span>
          </div>
          <div className="flex gap-4 text-[#a3a3a3] ml-4">
            <span className="hover:text-[#ededed] cursor-pointer">Editor</span>
            <span className="hover:text-[#ededed] cursor-pointer">File</span>
            <span className="hover:text-[#ededed] cursor-pointer">View</span>
            <span className="hover:text-[#ededed] cursor-pointer">Run</span>
            <span className="hover:text-[#ededed] cursor-pointer">Terminal</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[#a3a3a3]">
          <span>Nov 27 20:58</span>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </div>
      </header>

      {/* --- Main Workspace --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-64 border-r border-[#2a2a2a] flex flex-col bg-[#0f0f0f] shrink-0">
          <div className="p-3 border-b border-[#2a2a2a]">
            <input 
              type="text" 
              placeholder="Search Agents" 
              className="w-full bg-[#171717] border border-[#2a2a2a] rounded px-3 py-1.5 text-xs text-[#ededed] focus:outline-none focus:border-[#2a2a2a] placeholder:text-[#a3a3a3]/50" 
            />
          </div>
          
          <div className="p-3">
            <button className="w-full border border-[#2a2a2a] rounded py-1.5 text-xs text-[#a3a3a3] hover:bg-[#171717] hover:text-[#ededed] transition-colors mb-4">
              New Agent
            </button>
            
            <div className="text-[10px] uppercase font-bold text-[#a3a3a3]/50 tracking-wider mb-2 px-1">IN PROGRESS</div>
            
            <div className="space-y-0.5">
              <div className="bg-[#262626] text-[#ededed] border-l-2 border-[#3b82f6] px-3 py-2 rounded text-xs flex flex-col gap-0.5 cursor-pointer">
                <span className="font-medium">Fact Check: Senate Bill</span>
                <span className="text-[10px] text-[#3b82f6] animate-pulse">● Running analysis</span>
              </div>
              <div className="px-3 py-2 rounded text-xs flex flex-col gap-0.5 opacity-60 hover:bg-[#262626] hover:text-[#ededed] cursor-pointer">
                <span className="font-medium">Verify: TechCrunch AI</span>
                <span className="text-[10px]">Completed 2h ago</span>
              </div>
              <div className="px-3 py-2 rounded text-xs flex flex-col gap-0.5 opacity-60 hover:bg-[#262626] hover:text-[#ededed] cursor-pointer">
                <span className="font-medium">Scan: Twitter Thread</span>
                <span className="text-[10px]">Flagged as Misinfo</span>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER: Browser/Input */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0f0f0f]">
          <div className="p-6 pb-2">
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-lg text-[#ededed] font-medium">Investigate Source URL</h2>
              <span className="text-xs bg-[#171717] border border-[#2a2a2a] px-2 py-0.5 rounded text-[#a3a3a3]">Now · Auto</span>
            </div>
            
            <div className="relative group">
              <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                className="w-full bg-[#171717] border border-[#2a2a2a] rounded-lg p-3 pr-24 text-sm text-[#ededed] focus:outline-none focus:border-[#3b82f6]/50 transition-colors font-mono"
                placeholder="Paste suspicious URL here..."
              />
              <button 
                onClick={handleAnalyze}
                disabled={isLoading}
                className="absolute right-2 top-2 bottom-2 bg-[#262626] hover:bg-[#2a2a2a] border border-[#2a2a2a] px-3 rounded text-xs text-[#ededed] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span>Analyze</span>
                <span className="text-[10px] text-[#a3a3a3]">↵</span>
              </button>
            </div>
          </div>

          {/* Browser Viewport */}
          <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
            <div className="flex-1 border border-[#2a2a2a] rounded-lg bg-[#0a0a0a] overflow-hidden relative flex flex-col">
              
              {/* Browser Header */}
              <div className="h-8 bg-[#171717] border-b border-[#2a2a2a] flex items-center px-3 gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                </div>
                <div className="h-5 px-3 bg-[#0f0f0f] rounded text-[10px] text-[#a3a3a3] flex items-center border border-[#2a2a2a] font-mono w-64 truncate opacity-60">
                  🔒 <span className="ml-2">{browserUrl}</span>
                </div>
                <div className="flex-1"></div>
                <div className="text-[10px] text-[#a3a3a3]">HTML View</div>
              </div>

              {/* Browser Content */}
              <div className="flex-1 overflow-y-auto p-8 relative">
                {/* Empty State / Initial */}
                {!scrapedData && !isLoading && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-[#a3a3a3]/30">
                     <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                     </svg>
                     <span className="text-xs font-mono">WAITING FOR TARGET</span>
                   </div>
                )}

                {/* Scraped Content */}
                {scrapedData && !isLoading && (
                  <div className="max-w-3xl mx-auto">
                    <div className="text-[10px] text-[#3b82f6] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1 h-1 bg-[#3b82f6] rounded-full"></span>
                        {scrapedData.publisher || 'WEB SOURCE'}
                        <span className="text-[#2a2a2a]">|</span>
                        {scrapedData.date ? new Date(scrapedData.date).toLocaleDateString() : "Unknown Date"}
                    </div>
                    <h1 className="text-2xl text-[#ededed] font-semibold mb-4 leading-tight">{scrapedData.title || "Untitled Page"}</h1>
                    {scrapedData.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                            src={scrapedData.image.url} 
                            alt="Scraped" 
                            className="rounded border border-[#333] mb-5 w-full"
                        />
                    )}
                    <p className="mb-4 leading-relaxed text-[#d4d4d4] text-sm">{scrapedData.description || "No description content available."}</p>
                    <p className="opacity-50 mb-4 leading-relaxed text-[#d4d4d4] text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    <p className="opacity-50 mb-4 leading-relaxed text-[#d4d4d4] text-sm">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
                  </div>
                )}

                {/* Loader Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-[#0f0f0f]/90 z-20 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-xs text-[#3b82f6] font-mono animate-pulse">ESTABLISHING CONNECTION...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input */}
            <div className="mt-4 flex gap-2">
                <div className="flex-1 relative">
                    <input type="text" placeholder="Add a follow-up..." className="w-full bg-[#171717] border border-[#2a2a2a] rounded-md py-2 px-3 text-xs text-[#a3a3a3] focus:outline-none focus:border-[#2a2a2a]" />
                </div>
                <div className="bg-[#171717] border border-[#2a2a2a] rounded-md px-3 py-2 text-xs text-[#a3a3a3] cursor-pointer hover:text-[#ededed] flex items-center gap-1">
                    Agent <span className="text-[#3b82f6]">Auto</span> ▾
                </div>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: Logs & Verdict */}
        <aside className="w-96 border-l border-[#2a2a2a] flex flex-col bg-[#0f0f0f] shrink-0">
            
            {/* Logs */}
            <div className="h-1/2 flex flex-col border-b border-[#2a2a2a]">
                <div className="h-9 border-b border-[#2a2a2a] flex items-center px-4 justify-between bg-[#171717]/30">
                    <span className="text-xs font-medium text-[#ededed]">Execution Log</span>
                    <span className="text-[10px] text-[#a3a3a3]">Terminal</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 font-mono text-xs scroll-smooth" ref={logContainerRef}>
                    {logs.map((log, i) => (
                        <div key={i} className="flex flex-col gap-1 mb-4 animate-pulse-slow">
                            <div className="flex items-center gap-2 text-[#ededed]">
                                <span className="text-[#3b82f6] text-[10px]">●</span>
                                <span>{log.text}</span>
                            </div>
                            {log.subtext && (
                                <div className="flex gap-3 ml-1.5 h-full">
                                    <div className="w-[1px] bg-[#2a2a2a]"></div>
                                    <div className="text-[#a3a3a3] py-1">{log.subtext}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Verdict */}
            <div className="flex-1 flex flex-col bg-[#171717]/10">
                <div className="h-9 border-b border-[#2a2a2a] flex items-center px-4 justify-between bg-[#171717]/30">
                    <span className="text-xs font-medium text-[#ededed]">Analysis Verdict</span>
                    <span className="text-[10px] text-[#a3a3a3]">JSON Output</span>
                </div>
                
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    
                    {!verdict ? (
                        <div className="text-[#a3a3a3]/40 text-xs">
                            No analysis data available.<br/>Run an agent to generate report.
                        </div>
                    ) : (
                        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-700">
                             {/* Score */}
                            <div className="flex flex-col items-center">
                                <div 
                                    className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold mb-2 transition-all duration-1000"
                                    style={{ borderColor: verdict.color, color: verdict.color }}
                                >
                                    {verdict.score}
                                </div>
                                <div className="text-lg font-bold tracking-wide" style={{ color: verdict.color }}>
                                    {verdict.text}
                                </div>
                                <div className="text-[10px] text-[#a3a3a3] uppercase tracking-widest mt-1">Trust Score</div>
                            </div>

                            {/* Bars */}
                            <div className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded p-3 text-left space-y-3">
                                <div>
                                    <div className="flex justify-between text-[10px] text-[#a3a3a3] mb-1">FACTUALITY</div>
                                    <div className="h-1 w-full bg-[#2a2a2a] rounded overflow-hidden">
                                        <div className="h-full transition-all duration-1000" style={{ width: `${verdict.factScore}%`, backgroundColor: verdict.color }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] text-[#a3a3a3] mb-1">SENTIMENT BIAS</div>
                                    <div className="h-1 w-full bg-[#2a2a2a] rounded overflow-hidden">
                                        <div 
                                            className="h-full transition-all duration-1000" 
                                            style={{ 
                                                width: `${verdict.biasScore}%`, 
                                                backgroundColor: verdict.biasScore > 50 ? '#ef4444' : '#22c55e' 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] text-[#a3a3a3] mb-1">SOURCE REPUTATION</div>
                                    <div className="h-1 w-full bg-[#2a2a2a] rounded overflow-hidden">
                                        <div className="h-full transition-all duration-1000" style={{ width: `${verdict.repScore}%`, backgroundColor: verdict.color }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </aside>

      </div>
    </div>
  );
}