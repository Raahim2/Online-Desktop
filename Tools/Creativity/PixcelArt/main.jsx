"use client";

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const Project = () => {
    // --- Constants ---
    const RESOLUTION = 64;
    const PALETTE_COLORS = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#8b4513', '#4b0082', '#555555'];

    // --- State ---
    const [tool, setTool] = useState('pencil');
    const [color, setColor] = useState('#000000');
    const [size, setSize] = useState(1);
    const [layers, setLayers] = useState([{ id: 0, name: 'Background', visible: true }]);
    const [activeLayerIdx, setActiveLayerIdx] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState(null);
    const [showGrid, setShowGrid] = useState(true);
    const [history, setHistory] = useState([]);

    // --- Refs ---
    const wrapperRef = useRef(null);
    const viewportRef = useRef(null);
    const ghostCanvasRef = useRef(null);
    const gridCanvasRef = useRef(null);
    const layerRefs = useRef([]); // Stores actual canvas DOM elements

    // --- Initialization ---
    useEffect(() => {
        // Setup Grid & Ghost
        const gCtx = gridCanvasRef.current.getContext('2d');
        const ghostCtx = ghostCanvasRef.current.getContext('2d');
        [gridCanvasRef.current, ghostCanvasRef.current].forEach(c => {
            c.width = RESOLUTION;
            c.height = RESOLUTION;
        });
        drawGrid(gCtx);
        saveHistory();

        // Zoom/Pan handler
        const viewport = viewportRef.current;
        const handleWheel = (e) => {
            e.preventDefault();
            setZoom(prev => Math.min(Math.max(0.5, prev + e.deltaY * -0.001), 20));
        };
        viewport.addEventListener('wheel', handleWheel, { passive: false });
        return () => viewport.removeEventListener('wheel', handleWheel);
    }, []);

    // --- Drawing Logic ---
    const getCoords = (e) => {
        const rect = wrapperRef.current.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / (rect.width / RESOLUTION));
        const y = Math.floor((e.clientY - rect.top) / (rect.height / RESOLUTION));
        return { x, y };
    };

    const drawGrid = (ctx) => {
        ctx.clearRect(0, 0, RESOLUTION, RESOLUTION);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 0.1;
        for (let i = 0; i <= RESOLUTION; i++) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, RESOLUTION); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(RESOLUTION, i); ctx.stroke();
        }
    };

    const handleMouseDown = (e) => {
        const pos = getCoords(e);
        setIsDrawing(true);
        setStartPos(pos);
        performDrawAction(pos, true);
    };

    const handleMouseMove = (e) => {
        if (!wrapperRef.current) return;
        const pos = getCoords(e);
        setCoords(pos);
        if (isDrawing) performDrawAction(pos, false);
    };

    const handleMouseUp = (e) => {
        if (!isDrawing) return;
        commitGhost(getCoords(e));
        setIsDrawing(false);
        saveHistory();
    };

    const performDrawAction = (pos, isStart) => {
        const ctx = layerRefs.current[activeLayerIdx]?.getContext('2d', { willReadFrequently: true });
        const ghostCtx = ghostCanvasRef.current.getContext('2d');
        if (!ctx || !ghostCtx) return;

        ghostCtx.clearRect(0, 0, RESOLUTION, RESOLUTION);

        if (tool === 'pencil') {
            ctx.fillStyle = color;
            ctx.fillRect(pos.x, pos.y, size, size);
        } else if (tool === 'eraser') {
            ctx.clearRect(pos.x, pos.y, size, size);
        } else if (tool === 'line' && !isStart) {
            drawBresenham(ghostCtx, startPos.x, startPos.y, pos.x, pos.y, color);
        } else if (tool === 'rect' && !isStart) {
            ghostCtx.strokeStyle = color;
            ghostCtx.strokeRect(startPos.x + 0.5, startPos.y + 0.5, pos.x - startPos.x, pos.y - startPos.y);
        } else if (tool === 'circle' && !isStart) {
            const r = Math.hypot(pos.x - startPos.x, pos.y - startPos.y);
            ghostCtx.strokeStyle = color;
            ghostCtx.beginPath(); ghostCtx.arc(startPos.x, startPos.y, r, 0, Math.PI * 2); ghostCtx.stroke();
        } else if (tool === 'picker') {
            const data = ctx.getImageData(pos.x, pos.y, 1, 1).data;
            if (data[3] > 0) setColor(rgbToHex(data[0], data[1], data[2]));
        }
    };

    const commitGhost = (pos) => {
        const ctx = layerRefs.current[activeLayerIdx]?.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = ctx.strokeStyle = color;

        if (tool === 'line') drawBresenham(ctx, startPos.x, startPos.y, pos.x, pos.y, color);
        if (tool === 'rect') ctx.strokeRect(startPos.x + 0.5, startPos.y + 0.5, pos.x - startPos.x, pos.y - startPos.y);
        if (tool === 'circle') {
            const r = Math.hypot(pos.x - startPos.x, pos.y - startPos.y);
            ctx.beginPath(); ctx.arc(startPos.x, startPos.y, r, 0, Math.PI * 2); ctx.stroke();
        }
        if (tool === 'bucket') floodFill(ctx, pos.x, pos.y, color);

        ghostCanvasRef.current.getContext('2d').clearRect(0, 0, RESOLUTION, RESOLUTION);
    };

    // --- Algorithms ---
    const drawBresenham = (context, x0, y0, x1, y1, drawColor) => {
        context.fillStyle = drawColor;
        let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;
        while (true) {
            context.fillRect(x0, y0, size, size);
            if (x0 === x1 && y0 === y1) break;
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
    };

    const floodFill = (ctx, x, y, fillHex) => {
        const imgData = ctx.getImageData(0, 0, RESOLUTION, RESOLUTION);
        const target = getPixel(imgData, x, y);
        const fill = hexToRgb(fillHex);
        if (colorsMatch(target, [fill.r, fill.g, fill.b, 255])) return;

        const queue = [[x, y]];
        while (queue.length) {
            const [cx, cy] = queue.shift();
            if (cx < 0 || cy < 0 || cx >= RESOLUTION || cy >= RESOLUTION) continue;
            if (colorsMatch(getPixel(imgData, cx, cy), target)) {
                setPixel(imgData, cx, cy, fill);
                queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
            }
        }
        ctx.putImageData(imgData, 0, 0);
    };

    // --- Helpers ---
    const getPixel = (data, x, y) => { const i = (y * RESOLUTION + x) * 4; return [data.data[i], data.data[i + 1], data.data[i + 2], data.data[i + 3]]; };
    const setPixel = (data, x, y, rgb) => { const i = (y * RESOLUTION + x) * 4; data.data[i] = rgb.r; data.data[i + 1] = rgb.g; data.data[i + 2] = rgb.b; data.data[i + 3] = 255; };
    const colorsMatch = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    const hexToRgb = (hex) => ({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) });
    const rgbToHex = (r, g, b) => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

    const saveHistory = () => {
        const snapshots = layers.map((l, i) => layerRefs.current[i]?.toDataURL());
        setHistory(prev => [...prev.slice(-49), snapshots]);
    };

    const undo = () => {
        if (history.length < 2) return;
        const newHistory = [...history];
        newHistory.pop();
        const prevSnap = newHistory[newHistory.length - 1];
        prevSnap.forEach((data, i) => {
            const img = new Image();
            img.src = data;
            img.onload = () => {
                const ctx = layerRefs.current[i].getContext('2d');
                ctx.clearRect(0, 0, RESOLUTION, RESOLUTION);
                ctx.drawImage(img, 0, 0);
            };
        });
        setHistory(newHistory);
    };

    const addLayer = () => {
        const newId = layers.length;
        setLayers([...layers, { id: newId, name: `Layer ${newId + 1}`, visible: true }]);
        setActiveLayerIdx(newId);
    };

    const toggleLayerVisibility = (idx, e) => {
        e.stopPropagation();
        setLayers(layers.map((l, i) => i === idx ? { ...l, visible: !l.visible } : l));
    };

    const downloadPNG = () => {
        const out = document.createElement('canvas');
        out.width = out.height = RESOLUTION;
        const oCtx = out.getContext('2d');
        layers.forEach((l, i) => {
            if (l.visible && layerRefs.current[i]) oCtx.drawImage(layerRefs.current[i], 0, 0);
        });
        const a = document.createElement('a');
        a.download = 'pixelart.png'; a.href = out.toDataURL(); a.click();
    };

    return (
        <div className="h-screen flex flex-col bg-[#0b0b0b] text-[#ccc] font-['Inter',_sans-serif] overflow-hidden">
            <Head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <style>{`
                    :root { --panel: #151515; --bg: #0b0b0b; --border: #2a2a2a; }
                    .ui-panel { background: var(--panel); border-color: var(--border); }
                    .checkerboard {
                        background-image: 
                            linear-gradient(45deg, #ccc 25%, transparent 25%), 
                            linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #ccc 75%), 
                            linear-gradient(-45deg, transparent 75%, #ccc 75%);
                        background-size: 20px 20px;
                        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                        background-color: #fff;
                    }
                    #canvas-wrapper { 
                        position: relative; 
                        box-shadow: 0 0 50px rgba(0,0,0,0.8);
                        image-rendering: pixelated;
                    }
                    canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; image-rendering: pixelated; }
                    #grid-overlay { pointer-events: none; opacity: 0.2; }
                    #ghost-canvas { pointer-events: none; opacity: 0.7; }
                    .tool-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s; color: #a1a1aa; }
                    .tool-btn:hover { background: #27272a; }
                    .tool-btn.active { background: #2563eb; color: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
                    .layer-item.active { background: rgba(37, 99, 235, 0.2); border-left: 4px solid #3b82f6; }
                    ::-webkit-scrollbar { width: 4px; }
                    ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                `}</style>
            </Head>

            {/* Top Header */}
            <header className="h-12 ui-panel border-b flex items-center justify-between px-4 z-50">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-[10px] font-bold text-white">P</div>
                        <span className="font-bold text-white tracking-tight">Pixilart <span className="text-blue-500"> MAX </span></span>
                    </div>
                    <div className="flex space-x-4 text-[11px] font-medium text-zinc-500">
                        <button onClick={undo} className="hover:text-white transition-colors">Undo (Ctrl+Z)</button>
                        <button className="hover:text-white transition-colors">Redo</button>
                        <button onClick={() => { if(confirm("Clear everything?")) { layers.forEach((_, i) => layerRefs.current[i]?.getContext('2d').clearRect(0,0,RESOLUTION,RESOLUTION)); saveHistory(); }}} className="hover:text-red-400 transition-colors">Clear</button>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={downloadPNG} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-xs font-bold transition-all">Export PNG</button>
                </div>
            </header>

            {/* Sub-header */}
            <div className="h-10 ui-panel border-b flex items-center px-4 space-x-8 text-[11px]">
                <div className="flex items-center space-x-2">
                    <span className="text-zinc-500">Brush Size:</span>
                    <input type="range" min="1" max="10" value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="w-24 accent-blue-600" />
                    <span className="font-bold text-blue-500">{size}px</span>
                </div>
                <div className="flex items-center space-x-4 border-l border-zinc-800 pl-8">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
                        <span>Show Grid</span>
                    </label>
                </div>
                <div className="flex-1"></div>
                <div className="text-zinc-500 font-mono">X: {coords.x}, Y: {coords.y}</div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Toolset */}
                <aside className="w-14 ui-panel border-r flex flex-col items-center py-4 space-y-2">
                    {['pencil', 'eraser', 'bucket', 'picker', 'line', 'rect', 'circle'].map((t) => (
                        <button 
                            key={t}
                            className={`tool-btn ${tool === t ? 'active' : ''}`} 
                            onClick={() => setTool(t)}
                        >
                            <i className={`fas ${t === 'pencil' ? 'fa-pencil' : t === 'eraser' ? 'fa-eraser' : t === 'bucket' ? 'fa-fill-drip' : t === 'picker' ? 'fa-eye-dropper' : t === 'line' ? 'fa-slash' : t === 'rect' ? 'fa-square' : 'fa-circle'}`}></i>
                        </button>
                    ))}
                </aside>

                {/* Viewport */}
                <main 
                    ref={viewportRef}
                    className="flex-1 bg-[#0b0b0b] relative flex items-center justify-center overflow-hidden"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    <div 
                        ref={wrapperRef}
                        id="canvas-wrapper" 
                        className="checkerboard" 
                        style={{ width: '512px', height: '512px', transform: `scale(${zoom})` }}
                        onMouseDown={handleMouseDown}
                    >
                        {layers.map((layer, idx) => (
                            <canvas
                                key={layer.id}
                                ref={el => layerRefs.current[idx] = el}
                                width={RESOLUTION}
                                height={RESOLUTION}
                                style={{ opacity: layer.visible ? 1 : 0, zIndex: idx }}
                            />
                        ))}
                        <canvas ref={ghostCanvasRef} id="ghost-canvas" style={{ zIndex: 100 }}></canvas>
                        <canvas ref={gridCanvasRef} id="grid-overlay" style={{ display: showGrid ? 'block' : 'none', zIndex: 101 }}></canvas>
                    </div>
                </main>

                {/* Sidebar */}
                <aside className="w-64 ui-panel border-l flex flex-col">
                    <div className="flex-1 flex flex-col p-4 overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold uppercase text-zinc-500">Layers</span>
                            <button onClick={addLayer} className="text-blue-500 text-[10px] font-bold">+ NEW LAYER</button>
                        </div>
                        <div className="space-y-1 overflow-y-auto pr-2">
                            {[...layers].reverse().map((layer, i) => {
                                const idx = layers.length - 1 - i;
                                return (
                                    <div key={layer.id} onClick={() => setActiveLayerIdx(idx)} className={`layer-item p-3 flex items-center space-x-3 cursor-pointer rounded ${idx === activeLayerIdx ? 'active' : ''}`}>
                                        <i className={`fas ${layer.visible ? 'fa-eye' : 'fa-eye-slash'} text-xs`} onClick={(e) => toggleLayerVisibility(idx, e)}></i>
                                        <span className="text-[11px] font-medium flex-1">{layer.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="p-4 border-t border-zinc-800 bg-[#0e0e0e]">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded border-2 border-white/20 shadow-inner" style={{ background: color }}></div>
                            <div className="flex-1">
                                <div className="text-[10px] text-zinc-500 font-bold uppercase">Active Color</div>
                                <input type="text" value={color.toUpperCase()} readOnly className="bg-transparent text-xs w-full focus:outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-6 gap-1">
                            {PALETTE_COLORS.map(c => (
                                <button key={c} className="w-full aspect-square rounded-sm" style={{ backgroundColor: c }} onClick={() => setColor(c)} />
                            ))}
                        </div>
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full mt-3 h-8 bg-zinc-800 border-none rounded cursor-pointer" />
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Project;