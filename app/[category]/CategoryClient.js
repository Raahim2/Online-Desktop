"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar'; // Adjust path as needed
import Navbar from '../../components/Navbar';   // Adjust path as needed
import ToolCard from '../../components/ToolCard'; // Adjust path as needed
import Footer from '../../components/Footer';   // Adjust path as needed

// Helper to capitalize first letter
const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);

export default function CategoryClient({ tools, category }) {
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
            
            <div className="mb-6">
                <Link href="/" className="text-gray-500 hover:text-white mb-4 inline-flex items-center gap-2 transition-colors">
                   <i className="fa-solid fa-arrow-left"></i> Back to Home
                </Link>
                <h1 className="text-3xl font-bold text-white mt-2">
                  {capitalize(category)} Tools
                </h1>
                <p className="text-gray-400 mt-1">
                  Showing {tools.length} result{tools.length !== 1 ? 's' : ''}
                </p>
            </div>

            {tools.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {tools.map((tool, idx) => (
                        <ToolCard key={`${tool.id}-${idx}`} tool={tool} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <i className="fa-solid fa-box-open text-4xl mb-4"></i>
                    <p>No tools found in this category.</p>
                </div>
            )}

            <Footer />
        </main>
      </div>
    </div>
  );
}