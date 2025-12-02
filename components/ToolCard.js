"use client"; // This must be a client component for dynamic requires to work smoothly

import React from 'react';
import Link from 'next/link';

// Fallback image if preview.png is missing
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1552422535-c45813c61732?w=500&q=80";

const ToolCard = ({ tool }) => {
  const toolUrl = `/${tool.category}/${tool.slug}`;
  
  let imageSrc = FALLBACK_IMAGE;

  try {
    imageSrc = require(`../Tools/${tool.category}/${tool.folderName}/preview.png`).default;

  } catch (err) {
    console.log("No preview image for:", tool.title);
  }

  return (
    <Link href={toolUrl} className="block">
        <div className="game-card relative group cursor-pointer bg-[#252433] rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 hover:shadow-purple-500/20">
          <div className="aspect-[16/10] overflow-hidden relative">
            <img 
              src={imageSrc.src || imageSrc} // Handle Next.js Import object or String URL
              alt={tool.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <i className="fa-solid fa-arrow-up-right-from-square text-white text-3xl opacity-0 transform scale-50 transition-all duration-300 play-icon drop-shadow-lg"></i>
            </div>
            
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wide">
              {tool.category}
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-bold text-white text-sm truncate">{tool.title}</h3>
            <p className="text-xs text-[#c6c6c6] mt-1 truncate">Click to launch</p>
          </div>
        </div>
    </Link>
  );
};

export default ToolCard;