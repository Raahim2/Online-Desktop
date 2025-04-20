import Desktop from '../components/Desktop';
import fs from 'fs';
import path from 'path';

export function getProjectFolders() {
  const projectsPath = path.join(process.cwd(), 'app/projects');
  const items = fs.readdirSync(projectsPath, { withFileTypes: true });

  return items
    .filter((item) => item.isDirectory())
    .map((dir) => dir.name);
}


export default function Home() {
    const projectFolders = getProjectFolders();
    console.log('Project folders:', projectFolders);
    return (
        <div>
            <Desktop folders={projectFolders}/>
        </div>
    );
}