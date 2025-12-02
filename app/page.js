import { getToolsFromFolder } from '../lib/toolUtils';
import HomeClient from '../components/HomeClient';

export default function Home() {
  // This runs on the server during build or request
  const tools = getToolsFromFolder();

  return (
    <HomeClient tools={tools} />
  );
}