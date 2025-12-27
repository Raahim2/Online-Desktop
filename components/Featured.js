import React, { useMemo } from 'react';
import Link from 'next/link';

const Featured = ({ tools }) => {
  const featuredTool = useMemo(() => {
    if (!tools || tools.length === 0) return null;

    const today = new Date();
    const seed = today.getFullYear() + today.getMonth() + today.getDate();
    const index = seed % tools.length;
    
    return tools[index];
  }, [tools]);

  if (!featuredTool) return null;

  let imageSrc = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2670&auto=format&fit=crop";

  try {
    // Dynamic require can be tricky in some Next.js configs, 
    // ensure this path logic matches your project structure
    const image = require(`../Tools/${featuredTool.category}/${featuredTool.folderName}/preview.png`);
    imageSrc = image.default || image;
  } catch (err) {
    console.log("No preview image for:", featuredTool.title);
  }

  const toolLink = featuredTool.category 
    ? `/${featuredTool.category}/${featuredTool.slug || featuredTool.id}`
    : '#';

  return (
    <section className="group relative mb-10 overflow-hidden rounded-2xl border border-white/10 bg-gray-800 transition-all duration-300 hover:border-purple-500/30">
      <Link href={toolLink} className="block relative w-full h-full">
        
        {/* Aspect Ratio Container: 4:5 on mobile, 21:9 on desktop */}
        <div className="relative aspect-[4/5] sm:aspect-video md:aspect-[21/9] w-full overflow-hidden">
          
          {/* Background Image */}
          <img 
            src={imageSrc.src || imageSrc} 
            alt={featuredTool.title} 
            className="h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-40"
          />
          
          {/* Dark Overlay Gradient - Stronger on mobile for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e1a] via-[#0f0e1a]/70 to-transparent md:via-[#0f0e1a]/40"></div>
          
          {/* Content Container */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-12 lg:p-16">
            
            {/* Badges */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded bg-[#6d28d9] px-2 py-1 text-[10px] font-bold tracking-wider text-white shadow-lg shadow-purple-900/50 md:text-xs">
                    FEATURED TODAY
                </span>
                {featuredTool.category && (
                    <span className="rounded border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md md:text-xs">
                        {featuredTool.category.toUpperCase()}
                    </span>
                )}
            </div>

            {/* Title: Dynamic sizing for screen widths */}
            <h1 className="mb-2 text-2xl font-extrabold capitalize text-white drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl">
                {featuredTool.title || 'Amazing Tool'}
            </h1>
            
            {/* Description: Hidden/Limited on very small screens, full on large */}
            <p className="mb-6 max-w-2xl text-sm text-gray-200 line-clamp-2 drop-shadow-md sm:text-base md:text-lg md:line-clamp-3">
              {featuredTool.description || "Check out this amazing tool selected just for today. Enhance your workflow with our latest addition."}
            </p>
            
            {/* Button */}
            <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#6d28d9] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-900/50 transition-all group-hover:bg-[#7c3aed] group-hover:scale-105 md:px-8 md:py-3 md:text-lg">
                    <i className="fa-solid fa-rocket text-xs md:text-base"></i>
                    <span>Launch Tool</span>
                </div>
            </div>

          </div>
        </div>
      </Link>
    </section>
  );
};

export default Featured;