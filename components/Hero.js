import React from 'react';

const Hero = () => {
  return (
    <section className="mb-10 relative rounded-2xl overflow-hidden aspect-[21/9] md:aspect-[3/1] bg-gray-800 group cursor-pointer">
      <img 
        src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2670&auto=format&fit=crop" 
        alt="Hero Tool" 
        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e1a] via-transparent to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-2/3">
        <span className="inline-block bg-[#6d28d9] text-white text-xs font-bold px-2 py-1 rounded mb-2">NEW UPDATE</span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg">AI Misinfo Detector</h1>
        <p className="text-gray-300 mb-6 line-clamp-2 md:line-clamp-none drop-shadow-md">
          Analyze text instantly using our advanced AI models. Detect bias, check facts, and verify sources in seconds.
        </p>
        <button className="bg-[#6d28d9] hover:bg-[#7c3aed] text-white px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-purple-900/50">
          <i className="fa-solid fa-rocket"></i> Launch Tool
        </button>
      </div>
    </section>
  );
};

export default Hero;