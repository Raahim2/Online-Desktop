"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Code, 
  Briefcase, // Changed from Toolbox
  Settings, 
  FileCode, 
  AlignLeft, 
  Compress, 
  Copy, 
  Fingerprint, 
  RefreshCw, 
  Clock, 
  ShieldCheck, 
  Database, 
  Code2,      // Changed from Braces for better compatibility
  Menu,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

const Project = () => {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState(`{\n  "id": 101,\n  "username": "dev_guru",\n  "isActive": true,\n  "roles": ["admin", "editor"],\n  "settings": {\n    "theme": "dark",\n    "notifications": null\n  }\n}`);
  const [output, setOutput] = useState('');
  const [currentTab, setCurrentTab] = useState('ts');
  const [isValid, setIsValid] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [uuid, setUuid] = useState('Click to generate');
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [timestamp, setTimestamp] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const inputRef = useRef(null);
  const highlightRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setTimestamp(Math.floor(Date.now() / 1000));
    const timer = setInterval(() => {
      setTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    try {
      const jsonObj = JSON.parse(input);
      setIsValid(true);
      if (currentTab === 'ts') setOutput(generateTypeScript(jsonObj));
      if (currentTab === 'zod') setOutput(generateZod(jsonObj));
      if (currentTab === 'sql') setOutput(generateSQL(jsonObj));
    } catch (e) {
      if (input.trim() !== '') setIsValid(false);
    }
  }, [input, currentTab, mounted]);

  const handleScroll = (e) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop;
      highlightRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const generateTypeScript = (obj, rootName = 'RootInterface') => {
    const interfaces = [];
    const traverse = (currentObj, name) => {
      let res = `export interface ${name} {\n`;
      for (const key in currentObj) {
        const value = currentObj[key];
        let tsType = typeof value;
        if (value === null) tsType = 'null';
        else if (Array.isArray(value)) {
          if (value.length > 0) {
            const firstItem = value[0];
            if (typeof firstItem === 'object' && firstItem !== null) {
              const subName = capitalize(key) + 'Item';
              traverse(firstItem, subName);
              tsType = `${subName}[]`;
            } else tsType = `${typeof firstItem}[]`;
          } else tsType = 'any[]';
        } else if (tsType === 'object') {
          const subName = capitalize(key);
          traverse(value, subName);
          tsType = subName;
        }
        res += `  ${key}: ${tsType};\n`;
      }
      res += `}\n`;
      interfaces.push(res);
    };
    traverse(obj, rootName);
    return interfaces.reverse().join('\n');
  };

  const generateZod = (obj, rootName = 'Schema') => {
    const schemas = [];
    const traverse = (currentObj, name) => {
      let res = `const ${name} = z.object({\n`;
      for (const key in currentObj) {
        const value = currentObj[key];
        let zodType = 'z.any()';
        if (value === null) zodType = 'z.nullable()';
        else if (typeof value === 'string') zodType = 'z.string()';
        else if (typeof value === 'number') zodType = 'z.number()';
        else if (typeof value === 'boolean') zodType = 'z.boolean()';
        else if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] === 'object') {
            const subName = capitalize(key) + 'Schema';
            traverse(value[0], subName);
            zodType = `z.array(${subName})`;
          } else if (value.length > 0) {
            zodType = `z.array(z.${typeof value[0]}())`;
          } else zodType = `z.array(z.any())`;
        } else if (typeof value === 'object') {
          const subName = capitalize(key) + 'Schema';
          traverse(value, subName);
          zodType = subName;
        }
        res += `  ${key}: ${zodType},\n`;
      }
      res += `});\n`;
      schemas.push(res);
    };
    traverse(obj, rootName);
    return `import { z } from 'zod';\n\n` + schemas.reverse().join('\n');
  };

  const generateSQL = (obj, tableName = 'my_table') => {
    let target = Array.isArray(obj) ? obj[0] : obj;
    if (!target || typeof target !== 'object') return "-- Invalid input for SQL generation";
    let res = `CREATE TABLE ${tableName} (\n  id SERIAL PRIMARY KEY,\n`;
    for (const key in target) {
      const value = target[key];
      let sqlType = 'TEXT';
      if (typeof value === 'number') sqlType = Number.isInteger(value) ? 'INT' : 'DECIMAL';
      else if (typeof value === 'boolean') sqlType = 'BOOLEAN';
      else if (typeof value === 'object') sqlType = 'JSONB';
      res += `  ${key} ${sqlType},\n`;
    }
    return res.slice(0, -2) + '\n);';
  };

  const syntaxHighlight = (json) => {
    if (!json) return '';
    const safeJson = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
    return safeJson.replace(regex, (match) => {
      let cls = 'text-[#b5cea8]'; 
      if (/^"/.test(match)) {
        if (/:$/.test(match)) cls = 'text-[#9cdcfe]'; 
        else cls = 'text-[#ce9178]'; 
      } else if (/true|false/.test(match)) cls = 'text-[#569cd6]';
      else if (/null/.test(match)) cls = 'text-[#569cd6]';
      return `<span class="${cls}">${match}</span>`;
    });
  };

  const generateUUID = () => {
    // Safety check for randomUUID
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15);
    setUuid(newId);
    navigator.clipboard.writeText(newId);
  };

  if (!mounted) return <div className="h-screen bg-[#1e1e1e]" />;

  return (
    <div className="h-screen overflow-hidden bg-[#1e1e1e] text-[#d4d4d4] font-sans flex flex-col md:flex-row">
      <style>{`
        .scrollbar-custom::-webkit-scrollbar { width: 8px; height: 8px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: #1e1e1e; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: #424242; border-radius: 4px; }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: #4f4f4f; }
        textarea { tab-size: 2; }
      `}</style>

      {/* Activity Bar */}
      <aside className="hidden md:flex w-12 bg-[#333333] flex-col items-center py-4 gap-4 shrink-0 border-r border-[#3e3e42]">
        <Code className="text-[#007acc]" size={22} />
        <Briefcase className="text-gray-500 hover:text-white cursor-pointer" size={22} onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="mt-auto">
          <Settings className="text-gray-500 hover:text-white cursor-pointer" size={22} />
        </div>
      </aside>

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-full md:w-64' : 'w-0'} bg-[#252526] border-r border-[#3e3e42] flex flex-col transition-all duration-300 overflow-hidden shrink-0`}>
        <div className="p-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 flex justify-between items-center">
          <span>Utilities</span>
          <X className="md:hidden cursor-pointer" size={16} onClick={() => setIsSidebarOpen(false)} />
        </div>
        
        <div className="px-3 space-y-4 overflow-y-auto flex-1 pb-4 scrollbar-custom">
          <div className="p-2 hover:bg-white/5 rounded cursor-pointer group border border-transparent hover:border-white/5" onClick={generateUUID}>
            <div className="flex items-center gap-2 text-gray-300 group-hover:text-white text-xs">
              <Fingerprint className="text-blue-400" size={14} /> UUID Generator
            </div>
            <div className="text-[10px] text-gray-500 mt-1 truncate font-mono">{uuid}</div>
          </div>

          <div className="p-2 bg-white/5 rounded border border-white/5">
            <div className="flex items-center gap-2 text-gray-300 mb-2 text-xs">
              <RefreshCw className="text-green-400" size={14} /> Base64
            </div>
            <input 
              type="text" 
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
              placeholder="Text..." 
              className="w-full bg-black/30 border border-[#3e3e42] rounded px-2 py-1 text-[11px] text-white mb-2 focus:outline-none focus:border-[#007acc]"
            />
            <div className="flex gap-1">
              <button onClick={() => { try { setBase64Output(btoa(base64Input)) } catch(e) {setBase64Output('Error')} }} className="flex-1 bg-[#007acc]/20 hover:bg-[#007acc]/40 text-[10px] py-1 rounded text-[#007acc]">Encode</button>
              <button onClick={() => { try { setBase64Output(atob(base64Input)) } catch(e) {setBase64Output('Error')} }} className="flex-1 bg-[#007acc]/20 hover:bg-[#007acc]/40 text-[10px] py-1 rounded text-[#007acc]">Decode</button>
            </div>
            {base64Output && <div className="mt-2 text-[10px] font-mono break-all text-gray-400 p-1 bg-black/20 rounded">{base64Output}</div>}
          </div>

          <div className="p-2 hover:bg-white/5 rounded border border-transparent hover:border-white/5">
            <div className="flex items-center gap-2 text-gray-300 mb-2 text-xs">
              <Clock className="text-orange-400" size={14} /> Unix Epoch
            </div>
            <div onClick={() => copyToClipboard(timestamp.toString())} className="text-xs font-mono bg-black/30 p-2 rounded text-center cursor-pointer hover:text-[#007acc]">
              {timestamp}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-10 bg-[#1e1e1e] border-b border-[#3e3e42] flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Menu className="md:hidden cursor-pointer" size={18} onClick={() => setIsSidebarOpen(true)} />
            <div className="flex items-center gap-2 text-gray-400">
              <FileCode className="text-yellow-400" size={14} />
              <span className="text-xs">input.json</span>
              {!isValid && <span className="text-[10px] text-red-400 bg-red-400/10 px-2 rounded flex items-center gap-1"><AlertCircle size={10}/> Invalid</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { try { setInput(JSON.stringify(JSON.parse(input), null, 2)); } catch(e) { alert('Invalid JSON'); } }} className="text-[11px] hover:bg-white/10 px-2 py-1 rounded flex items-center gap-1.5 transition"><AlignLeft size={12}/> Format</button>
            <button onClick={() => { try { setInput(JSON.stringify(JSON.parse(input))); } catch(e) { alert('Invalid JSON'); } }} className="text-[11px] hover:bg-white/10 px-2 py-1 rounded flex items-center gap-1.5 transition"><Compress size={12}/> Minify</button>
          </div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <section className="flex-1 border-b md:border-b-0 md:border-r border-[#3e3e42] relative group overflow-hidden">
            <div className="absolute inset-0 overflow-auto scrollbar-custom">
              <pre 
                ref={highlightRef}
                className="absolute top-0 left-0 w-full min-h-full p-4 m-0 font-mono text-[13px] leading-relaxed whitespace-pre pointer-events-none z-0"
                dangerouslySetInnerHTML={{ __html: syntaxHighlight(input) }}
              />
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onScroll={handleScroll}
                spellCheck="false"
                className="absolute top-0 left-0 w-full h-full p-4 m-0 bg-transparent text-transparent caret-white font-mono text-[13px] leading-relaxed resize-none outline-none z-10 whitespace-pre"
              />
            </div>
          </section>

          <section className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
            <div className="flex h-9 bg-[#252526] border-b border-[#3e3e42]">
              {[
                { id: 'ts', label: 'TypeScript', icon: <Code2 size={12} className="text-blue-400" /> },
                { id: 'zod', label: 'Zod Schema', icon: <ShieldCheck size={12} className="text-purple-400" /> },
                { id: 'sql', label: 'SQL', icon: <Database size={12} className="text-green-400" /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`px-4 flex items-center gap-2 text-[11px] border-r border-[#3e3e42] transition-colors ${
                    currentTab === tab.id ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 relative overflow-hidden">
              <textarea 
                readOnly 
                value={output}
                className="w-full h-full bg-[#1e1e1e] text-gray-400 font-mono text-[13px] p-4 resize-none outline-none scrollbar-custom"
                spellCheck="false"
              />
              <button 
                onClick={() => copyToClipboard(output)}
                className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded border border-white/10 text-[11px] flex items-center gap-2"
              >
                {copyFeedback ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copyFeedback ? 'Copied' : 'Copy'}
              </button>
            </div>
          </section>
        </div>

        <footer className="h-6 bg-[#007acc] text-white text-[10px] flex items-center px-3 justify-between shrink-0">
          <div className="flex gap-4">
            <span className="opacity-80 flex items-center gap-1"><Code size={10} /> main</span>
            <span className="opacity-80">{input.length} characters</span>
          </div>
          <div className="hidden sm:block opacity-80 uppercase tracking-tighter">
            Powered by DevForge Engine
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Project;