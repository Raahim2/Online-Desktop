import React from 'react';
import Link from 'next/link';

const Sidebar = ({ isOpen, onClose }) => {
  
  // Helper to close sidebar on mobile when a link is clicked
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1c1b29] transform transition-transform duration-300 flex flex-col border-r border-white/5 
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/" onClick={handleLinkClick} className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-[#6d28d9] rounded flex items-center justify-center">
              <i className="fa-solid fa-toolbox text-white text-sm"></i>
            </div>
            <span>CrazyTools</span>
          </Link>
          <button onClick={onClose} className="md:hidden ml-auto text-gray-400 hover:text-white">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          
          <Link 
            href="/" 
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#6d28d9]/10 text-[#6d28d9] font-bold hover:bg-[#6d28d9]/20 transition-colors"
          >
            <i className="fa-solid fa-house w-5 text-center"></i> Home
          </Link>
          
          <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Categories</div>

          {/* GAME */}
          <Link 
            href="/Game" 
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#c6c6c6] hover:bg-white/5 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-gamepad w-5 text-center text-green-400"></i> Game
          </Link>

          {/* TEMPLATES */}
          <Link 
            href="/templates" 
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#c6c6c6] hover:bg-white/5 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-layer-group w-5 text-center text-yellow-400"></i> Templates
          </Link>

          {/* CREATIVITY */}
          <Link 
            href="/creativity" 
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#c6c6c6] hover:bg-white/5 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-palette w-5 text-center text-pink-400"></i> Creativity
          </Link>

          {/* AGENTIC */}
          <Link 
            href="/agentic" 
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#c6c6c6] hover:bg-white/5 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-robot w-5 text-center text-blue-400"></i> Agentic
          </Link>

          <div className="h-20"></div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
        ></div>
      )}
    </>
  );
};

export default Sidebar;