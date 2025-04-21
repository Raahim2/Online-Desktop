// app/api/projects/route.js
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rootParam = searchParams.get('root') || ''; 

  const dirPath = path.join(process.cwd(), 'public/projects', rootParam);

  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    const data = {
      folders: items.filter((i) => i.isDirectory()).map((d) => d.name),
      files: items.filter((i) => i.isFile()).map((f) => f.name),
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Folder not found', details: err.message }),
      { status: 404 }
    );
  }
}
