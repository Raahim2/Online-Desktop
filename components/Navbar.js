import React from 'react';

const Navbar = ({ onMenuClick }) => {
  return (
    <header className="h-16 bg-[#131118]/95 backdrop-blur border-b border-white/5 sticky top-0 z-40 px-4 flex items-center justify-between gap-4">
      {/* Mobile Toggle */}
      <button onClick={onMenuClick} className="md:hidden text-white p-2">
        <i className="fa-solid fa-bars text-xl"></i>
      </button>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl relative hidden md:block">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className="fa-solid fa-magnifying-glass text-gray-500"></i>
        </div>
        <input 
          type="text" 
          placeholder="Search for games..." 
          className="w-full bg-[#252433] text-white text-sm rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#6d28d9] border border-transparent focus:border-transparent transition-all placeholder-gray-500"
        />
      </div>

      {/* Mobile Search Icon */}
      <button className="md:hidden text-white p-2 ml-auto">
        <i className="fa-solid fa-magnifying-glass"></i>
      </button>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button className="hidden sm:flex items-center gap-2 bg-[#6d28d9] hover:bg-[#7c3aed] text-white px-4 py-1.5 rounded-full font-semibold text-sm transition-colors">
          <i className="fa-regular fa-user"></i> Login
        </button>
        <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <i className="fa-solid fa-ellipsis-vertical text-white"></i>
        </button>
      </div>
    </header>
  );
};

export default Navbar;