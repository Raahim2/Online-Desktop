import React, { useMemo } from 'react';
import Link from 'next/link';

const Featured = ({ tools }) => {
  // Logic to get a "Daily" random tool
  const featuredTool = useMemo(() => {
    if (!tools || tools.length === 0) return null;

    // Create a seed based on the current date (Year + Month + Date)
    const today = new Date();
    const seed = today.getFullYear() + today.getMonth() + today.getDate();
    
    // Use modulo to pick an index that is consistent for the whole day
    const index = seed % tools.length;
    
    return tools[index];
  }, [tools]);

  console.log('Featured Tool:', featuredTool);
  let imageSrc = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2670&auto=format&fit=crop";


  if (!featuredTool) return null;

  const toolLink = featuredTool.category 
    ? `/${featuredTool.category}/${featuredTool.slug || featuredTool.id}`
    : '#';

  try {
    imageSrc = require(`../Tools/${featuredTool.category}/${featuredTool.folderName}/preview.png`).default;
  } catch (err) {
    console.log("No preview image for:", featuredTool.title);
  }

  return (
    <section className="mb-10 relative rounded-2xl overflow-hidden aspect-[21/9] md:aspect-[3/1] bg-gray-800 group cursor-pointer border border-white/10">
      
      {/* Background Image - Using a generic tech/abstract image if tool has no image */}
      <img 
        src={imageSrc.src || imageSrc} // Handle Next.js Import object or String URL
        alt={featuredTool.title} 
        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e1a] via-[#0f0e1a]/50 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-2/3">
        
        {/* Badge */}
        <div className="flex items-center gap-3 mb-3">
            <span className="inline-block bg-[#6d28d9] text-white text-xs font-bold px-2 py-1 rounded shadow-lg shadow-purple-900/50">
                FEATURED TODAY
            </span>
            {featuredTool.category && (
                <span className="inline-block bg-white/10 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded border border-white/10">
                    {featuredTool.category.toUpperCase()}
                </span>
            )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg capitalize">
            {featuredTool.title || 'Amazing Tool'}
        </h1>
        
        {/* Description */}
        <p className="text-gray-200 mb-6 line-clamp-2 md:line-clamp-none drop-shadow-md text-lg">
          {featuredTool.description || "Check out this amazing tool selected just for today. Enhance your workflow with our latest addition."}
        </p>
        
        {/* Launch Button */}
        <Link href={toolLink}>
            <button className="bg-[#6d28d9] hover:bg-[#7c3aed] text-white px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-purple-900/50">
            <i className="fa-solid fa-rocket"></i> Launch Tool
            </button>
        </Link>
      </div>
    </section>
  );
};

export default Featured;