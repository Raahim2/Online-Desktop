// lib/getProjectFolders.js
import fs from 'fs';
import path from 'path';

export function getProjectFolders() {
  const projectsPath = path.join(process.cwd(), 'app/projects');
  const items = fs.readdirSync(projectsPath, { withFileTypes: true });

  return items
    .filter((item) => item.isDirectory())
    .map((dir) => dir.name);
}
