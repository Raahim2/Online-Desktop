import React from 'react';
import Link from 'next/link';

const ContributeSection = () => {
  return (
    <section className="mb-16 px-4 md:px-0">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a192d] to-[#0f0e1a] border border-white/5 p-8 md:p-12 lg:p-16">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[#6d28d9] opacity-20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600 opacity-10 blur-[100px] rounded-full"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#a78bfa] text-xs font-bold tracking-widest uppercase mb-4">
              <i className="fa-solid fa-code-branch"></i>
              Open for Submissions
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
              Have an amazing <span className="text-[#6d28d9]">tool</span> in mind?
            </h2>
            
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
              Help us grow the directory! Whether it s your own creation or a hidden gem you found, 
              share it with the community and help others discover great resources.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link href="/contribute">
              <button className="group relative flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <span>Submit a Tool</span>
                <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
              </button>
            </Link>
          </div>
          
        </div>

        {/* Subtle Bottom Accent */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#6d28d9]/50 to-transparent"></div>
      </div>
    </section>
  );
};

export default ContributeSection;