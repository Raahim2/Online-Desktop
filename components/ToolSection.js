import React from 'react';
import ToolCard from './ToolCard';

const ToolSection = ({ title, iconClass, iconColor, tools, limit = 10 }) => {
  const displayTools = [...tools].sort(() => 0.5 - Math.random()).slice(0, limit);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {iconClass && <i className={`${iconClass} ${iconColor} text-lg`}></i>}
            {title}
        </h2>
        <a href={`/${title}`} className="text-sm text-[#6d28d9] hover:text-white font-semibold transition-colors">View all</a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayTools.map((tool, idx) => (
            <ToolCard key={`${tool.id}-${idx}`} tool={tool} />
        ))}
      </div>
    </section>
  );
};

export default ToolSection;