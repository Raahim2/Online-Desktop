import fs from 'fs';
import path from 'path';

// Helper to format "MisinfoDetector" -> "Misinfo Detector"
function formatTitle(folderName) {
  // If the folder already has spaces, just return it
  if (folderName.includes(' ')) return folderName;
  // Otherwise, split CamelCase
  return folderName.replace(/([A-Z])/g, ' $1').trim();
}

const stockImages = [
  "https://images.unsplash.com/photo-1552422535-c45813c61732?w=500&q=80",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&q=80",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500&q=80",
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80",
  "https://images.unsplash.com/photo-1595079676339-1534801fafde?w=500&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80"
];

export function getToolsFromFolder() {
  const toolsDirectory = path.join(process.cwd(), 'Tools');
  
  if (!fs.existsSync(toolsDirectory)) return [];

  const categories = fs.readdirSync(toolsDirectory);
  let allTools = [];
  let idCounter = 1;

  categories.forEach(category => {
    const categoryPath = path.join(toolsDirectory, category);
    
    if (fs.statSync(categoryPath).isDirectory()) {
      const toolFolders = fs.readdirSync(categoryPath);

      toolFolders.forEach((folderName) => {
        const toolPath = path.join(categoryPath, folderName);
        
        if (fs.statSync(toolPath).isDirectory()) {
            const hasMain = fs.existsSync(path.join(toolPath, 'main.jsx')) || fs.existsSync(path.join(toolPath, 'main.js'));
            
            if (hasMain) {
                allTools.push({
                    id: idCounter++,
                    title: formatTitle(folderName), 
                    category: category,
                    slug: folderName.trim().replace(/\s+/g, '-'), 
                    folderName: folderName, // Keep original folder name if needed
                    image: stockImages[idCounter % stockImages.length] 
                });
            }
        }
      });
    }
  });

  return allTools;
}