"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function KaleidoscopeCanvas() {
  // --- Refs ---
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // We use refs for drawing parameters to avoid stale closures in event listeners
  // without needing to re-bind listeners on every state change.
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  
  // --- State ---
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [symmetryAxes, setSymmetryAxes] = useState(6);
  const [showGrid, setShowGrid] = useState(false);

  // Keep refs synchronized with state for the canvas logic
  const brushSizeRef = useRef(brushSize);
  const brushColorRef = useRef(brushColor);
  const symmetryAxesRef = useRef(symmetryAxes);
  const showGridRef = useRef(showGrid);

  useEffect(() => { brushSizeRef.current = brushSize; }, [brushSize]);
  useEffect(() => { brushColorRef.current = brushColor; }, [brushColor]);
  useEffect(() => { symmetryAxesRef.current = symmetryAxes; }, [symmetryAxes]);
  useEffect(() => { showGridRef.current = showGrid; }, [showGrid]);

  // --- Canvas Logic ---

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const drawSegment = (ctx, x1, y1, x2, y2) => {
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const axes = symmetryAxesRef.current;
    const angleIncrement = (Math.PI * 2) / axes;

    ctx.lineWidth = brushSizeRef.current;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColorRef.current;

    for (let i = 0; i < axes; i++) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(i * angleIncrement);

      // Draw original segment
      ctx.beginPath();
      ctx.moveTo(x1 - centerX, y1 - centerY);
      ctx.lineTo(x2 - centerX, y2 - centerY);
      ctx.stroke();

      // Draw mirrored segment
      if (axes > 1) {
        ctx.scale(1, -1);
        ctx.beginPath();
        ctx.moveTo(x1 - centerX, -(y1 - centerY));
        ctx.lineTo(x2 - centerX, -(y2 - centerY));
        ctx.stroke();
      }

      ctx.restore();
    }
  };

  const drawGrid = (ctx) => {
    if (!showGridRef.current) return;
    
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const axes = symmetryAxesRef.current;
    const angleIncrement = (Math.PI * 2) / axes;
    const radius = Math.max(centerX, centerY);

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);

    // Radial lines
    for (let i = 0; i < axes; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      const x = centerX + radius * Math.cos(i * angleIncrement);
      const y = centerY + radius * Math.sin(i * angleIncrement);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Boundary for drawing segment
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)';
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const endX = centerX + radius * Math.cos(angleIncrement);
    const endY = centerY + radius * Math.sin(angleIncrement);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.restore();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);
  };

  // --- Handlers ---

  const startDrawing = (e) => {
    isDrawing.current = true;
    const { x, y } = getCoordinates(e);
    lastX.current = x;
    lastY.current = y;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    
    // Prevent scrolling on touch
    if (e.type === 'touchmove') {
        e.preventDefault(); 
    }

    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    
    drawSegment(ctx, lastX.current, lastY.current, x, y);
    
    lastX.current = x;
    lastY.current = y;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Fill white background
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw original canvas
    tempCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = 'kaleidoscope-canvas.png';
    link.href = tempCanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    link.click();
    link.remove();
  };

  const handleResize = () => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    // Calculate size logic from original
    const style = window.getComputedStyle(container);
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    
    const containerWidth = container.clientWidth - paddingX;
    const containerHeight = container.clientHeight - paddingY;
    
    const size = Math.floor(Math.min(containerWidth, containerHeight) * 0.98);

    if (canvasRef.current.width !== size || canvasRef.current.height !== size) {
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        clearCanvas(); // Resize clears canvas in original logic
    }
  };

  // --- Effects ---

  // Attach non-passive event listeners for touch (required to prevent scrolling)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e) => startDrawing(e);
    const onTouchMove = (e) => draw(e);
    const onTouchEnd = () => stopDrawing();

    // { passive: false } is crucial for e.preventDefault() to work in touchmove
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);

    return () => {
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchend', onTouchEnd);
        canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  // Handle Resize
  useEffect(() => {
    handleResize();
    let resizeTimer;
    const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 100);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Handle Grid/Symmetry changes (Resets canvas as per original logic)
  useEffect(() => {
    clearCanvas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGrid, symmetryAxes]);


  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans bg-gray-100 text-[#1f2937]">
      {/* Global styles to match original specific overrides */}
      <style jsx global>{`
        body { overscroll-behavior: none; }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #2563eb;
          border-radius: 50%;
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #2563eb;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>

      {/* Controls Sidebar */}
      <aside className="w-full md:w-64 lg:w-72 bg-white p-4 shadow-lg md:shadow-md md:h-screen md:overflow-y-auto flex flex-col space-y-4 border-b md:border-b-0 md:border-r border-gray-200 shrink-0">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left">Kaleidoscope Canvas</h1>

        {/* Brush Size */}
        <div>
          <label htmlFor="brushSize" className="block text-sm font-medium text-gray-700 mb-1">
            Brush Size: <span className="font-semibold">{brushSize}</span>px
          </label>
          <input 
            type="range" 
            id="brushSize" 
            min="1" 
            max="50" 
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Brush Color */}
        <div>
          <label htmlFor="brushColor" className="block text-sm font-medium text-gray-700 mb-1">Brush Color</label>
          <input 
            type="color" 
            id="brushColor" 
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer p-1"
          />
        </div>

        {/* Symmetry Axes */}
        <div>
          <label htmlFor="symmetryAxes" className="block text-sm font-medium text-gray-700 mb-1">Symmetry Segments</label>
          <select 
            id="symmetryAxes" 
            value={symmetryAxes}
            onChange={(e) => setSymmetryAxes(parseInt(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="6">6</option>
            <option value="8">8</option>
            <option value="10">10</option>
            <option value="12">12</option>
            <option value="16">16</option>
            <option value="20">20</option>
            <option value="24">24</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <button 
            onClick={() => setShowGrid(!showGrid)}
            className={`w-full font-semibold py-2 px-4 rounded transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 
              ${showGrid 
                ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500' 
                : 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-400'}`}
          >
            {showGrid ? 'Hide Grid' : 'Show Grid'}
          </button>
          
          <button 
            onClick={clearCanvas}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Clear Canvas
          </button>
          
          <button 
            onClick={handleDownload}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Download Image
          </button>
        </div>

        {/* Footer/Info */}
        <div className="mt-auto text-center text-xs text-gray-500 pt-4">
          Draw in one segment, see the magic multiply!
        </div>
      </aside>

      {/* Canvas Area */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-gray-200 to-gray-300 md:h-screen overflow-hidden">
        <div ref={containerRef} className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
          <canvas 
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            className="bg-white shadow-lg rounded-md border border-gray-300 cursor-crosshair touch-none block"
            style={{ touchAction: 'none' }}
          >
            Your browser does not support the canvas element.
          </canvas>
        </div>
      </main>
    </div>
  );
}