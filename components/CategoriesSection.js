import React from 'react';
import Link from 'next/link';

const CategoriesSection = () => {
  const categories = [
    {
      name: 'Game',
      icon: 'fa-gamepad',
      color: 'text-emerald-400',
      bgColor: 'group-hover:bg-emerald-400/10',
      slug: 'game'
    },
    {
      name: 'Templates',
      icon: 'fa-layer-group',
      color: 'text-blue-400',
      bgColor: 'group-hover:bg-blue-400/10',
      slug: 'templates'
    },
    {
      name: 'Creativity',
      icon: 'fa-palette',
      color: 'text-pink-400',
      bgColor: 'group-hover:bg-pink-400/10',
      slug: 'creativity'
    },
    {
      name: 'Agentic',
      icon: 'fa-robot',
      color: 'text-orange-400',
      bgColor: 'group-hover:bg-orange-400/10',
      slug: 'agentic'
    },
    {
      name: 'Devtools',
      icon: 'fa-code',
      color: 'text-purple-400',
      bgColor: 'group-hover:bg-purple-400/10',
      slug: 'devtools'
    }
  ];

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <i className="fa-solid fa-grip-vertical text-[#6d28d9]"></i>
          Browse Categories
        </h2>
      </div>

      {/* Responsive Grid: 2 columns on mobile, 3 on tablet, 5 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Link key={cat.slug} href={`/${cat.slug}`} className="group">
            <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gray-900/50 border border-white/5 transition-all duration-300 group-hover:border-[#6d28d9]/50 group-hover:-translate-y-1">
              
              {/* Glow Effect on Hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl -z-10 ${cat.bgColor}`}></div>

              {/* Icon Container */}
              <div className={`w-12 h-12 mb-3 rounded-xl flex items-center justify-center bg-white/5 transition-colors duration-300 ${cat.bgColor}`}>
                <i className={`fa-solid ${cat.icon} ${cat.color} text-xl`}></i>
              </div>

              {/* Name */}
              <span className="text-gray-200 font-bold group-hover:text-white transition-colors">
                {cat.name}
              </span>
              
              {/* Subtext (Optional) */}
              <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                Explore
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;