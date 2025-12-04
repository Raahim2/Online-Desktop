"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Featured from './Featured'; 
import ToolSection from './ToolSection';
import Footer from './Footer';

export default function HomeClient({ tools }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col md:ml-64 h-full relative">
        
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            
            {/* Pass tools to Featured section for daily selection */}
            <Featured tools={tools} />
            
            {/* Show message if no tools found */}
            {tools.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                    No tools found in /Tools folder yet.
                </div>
            )}

            <ToolSection 
                title="All Tools" 
                tools={tools}
                limit={20}
            />
            
             <ToolSection 
                title="Game" 
                iconClass="fa-solid fa-gamepad"
                iconColor="text-green-500"
                tools={tools.filter(t => t.category === 'Game')}
                limit={5}
            />

             <ToolSection 
                title="Templates" 
                iconClass="fa-solid fa-layer-group"
                iconColor="text-yellow-500"
                tools={tools.filter(t => t.category === 'Templates')}
                limit={5}
            />

             <ToolSection 
                title="Creativity" 
                iconClass="fa-solid fa-palette"
                iconColor="text-pink-500"
                tools={tools.filter(t => t.category === 'Creativity')}
                limit={5}
            />

             <ToolSection 
                title="Agentic" 
                iconClass="fa-solid fa-robot"
                iconColor="text-blue-500"
                tools={tools.filter(t => t.category === 'Agentic')}
                limit={5}
            />

            <Footer />
        </main>
      </div>
    </div>
  );
}