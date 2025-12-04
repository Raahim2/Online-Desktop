import { getToolsFromFolder } from '../../lib/toolUtils'; // Adjust path
import CategoryClient from './CategoryClient';

export default async function CategoryPage({ params }) {
  // 1. Await params (Required in Next.js 15, good practice in 14)
  const resolvedParams = await params;
  const { category } = resolvedParams;

  // 2. Fetch all tools
  const allTools = getToolsFromFolder();
  
  const categoryTools = allTools.filter(
    (t) => t.category && t.category.toLowerCase() === category.toLowerCase()
  );

  return (
    <CategoryClient tools={categoryTools} category={category} />
  );
}