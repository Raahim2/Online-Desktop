import React, { useState, useEffect, useRef } from 'react';
import { 
  Code, 
  Toolbox, 
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
  Braces,
  Menu,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

const Project = () => {
  const [input, setInput] = useState(`{\n  "id": 101,\n  "username": "dev_guru",\n  "isActive": true,\n  "roles": ["admin", "editor"],\n  "settings": {\n    "theme": "dark",\n    "notifications": null\n  }\n}`);
  const [output, setOutput] = useState('');
  const [currentTab, setCurrentTab] = useState('ts');
  const [isValid, setIsValid] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [uuid, setUuid] = useState('Click to generate');
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000));
  const [copyFeedback, setCopyFeedback] = useState(false);

  const inputRef = useRef(null);
  const highlightRef = useRef(null);

  // --- Core Logic ---

  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    processJson(input, currentTab);
  }, [input, currentTab]);

  const handleScroll = (e) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop;
      highlightRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const processJson = (code, tab) => {
    try {
      const jsonObj = JSON.parse(code);
      setIsValid(true);
      if (tab === 'ts') setOutput(generateTypeScript(jsonObj));
      if (tab === 'zod') setOutput(generateZod(jsonObj));
      if (tab === 'sql') setOutput(generateSQL(jsonObj));
    } catch (e) {
      if (code.trim() !== '') setIsValid(false);
    }
  };

  // --- Generators ---

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const generateTypeScript = (obj, rootName = 'RootInterface') => {
    const interfaces = [];
    const traverse = (currentObj, name) => {
      let output = `export interface ${name} {\n`;
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
        output += `  ${key}: ${tsType};\n`;
      }
      output += `}\n`;
      interfaces.push(output);
    };
    traverse(obj, rootName);
    return interfaces.reverse().join('\n');
  };

  const generateZod = (obj, rootName = 'Schema') => {
    const schemas = [];
    const traverse = (currentObj, name) => {
      let output = `const ${name} = z.object({\n`;
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
        output += `  ${key}: ${zodType},\n`;
      }
      output += `});\n`;
      schemas.push(output);
    };
    traverse(obj, rootName);
    return `import { z } from 'zod';\n\n` + schemas.reverse().join('\n');
  };

  const generateSQL = (obj, tableName = 'my_table') => {
    let target = Array.isArray(obj) ? obj[0] : obj;
    let output = `CREATE TABLE ${tableName} (\n  id SERIAL PRIMARY KEY,\n`;
    for (const key in target) {
      const value = target[key];
      let sqlType = 'TEXT';
      if (typeof value === 'number') sqlType = Number.isInteger(value) ? 'INT' : 'DECIMAL';
      else if (typeof value === 'boolean') sqlType = 'BOOLEAN';
      else if (typeof value === 'object') sqlType = 'JSONB';
      output += `  ${key} ${sqlType},\n`;
    }
    return output.slice(0, -2) + '\n);';
  };

  // --- Syntax Highlighting ---

  const syntaxHighlight = (json) => {
    if (!json) return '';
    const safeJson = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
    
    const parts = safeJson.split(regex);
    // Simple implementation for React: use dangerousSetInnerHTML or map
    return safeJson.replace(regex, (match) => {
      let cls = 'text-[#b5cea8]'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) cls = 'text-[#9cdcfe]'; // key
        else cls = 'text-[#ce9178]'; // string
      } else if (/true|false/.test(match)) cls = 'text-[#569cd6]'; // bool
      else if (/null/.test(match)) cls = 'text-[#569cd6]'; // null
      return `<span class="${cls}">${match}</span>`;
    });
  };

  // --- Actions ---

  const formatJSON = () => {
    try {
      const obj = JSON.parse(input);
      setInput(JSON.stringify(obj, null, 2));
    } catch (e) { alert('Invalid JSON'); }
  };

  const minifyJSON = () => {
    try {
      const obj = JSON.parse(input);
      setInput(JSON.stringify(obj));
    } catch (e) { alert('Invalid JSON'); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const generateUUID = () => {
    const newUuid = crypto.randomUUID();
    setUuid(newUuid);
    navigator.clipboard.writeText(newUuid);
  };

  const handleBase64 = (mode) => {
    try {
      setBase64Output(mode === 'enc' ? btoa(base64Input) : atob(base64Input));
    } catch (e) { setBase64Output('Error'); }
  };

  return (
    <div className="h-screen overflow-y-auto bg-[#1e1e1e] text-[#d4d4d4] font-sans flex flex-col md:flex-row">
      
      {/* Activity Bar (Desktop) */}
      <aside className="hidden md:flex w-12 bg-[#333333] flex-col items-center py-4 gap-4 shrink-0 border-r border-[#3e3e42]">
        <Code className="text-[#007acc] cursor-pointer" size={24} />
        <Toolbox className="text-gray-500 hover:text-white cursor-pointer" size={24} onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="mt-auto">
          <Settings className="text-gray-500 hover:text-white cursor-pointer" size={24} />
        </div>
      </aside>

      {/* Sidebar / Quick Tools */}
      <aside className={`${isSidebarOpen ? 'w-full md:w-64' : 'w-0'} bg-[#252526] border-r border-[#3e3e42] flex flex-col transition-all duration-300 overflow-hidden shrink-0`}>
        <div className="p-3 text-xs font-bold uppercase tracking-wider text-gray-400 flex justify-between items-center">
          <span>Quick Tools</span>
          <X className="md:hidden cursor-pointer" size={16} onClick={() => setIsSidebarOpen(false)} />
        </div>
        
        <div className="px-2 space-y-4 overflow-y-auto flex-1 pb-4">
          {/* UUID */}
          <div className="p-2 hover:bg-white/5 rounded cursor-pointer group" onClick={generateUUID}>
            <div className="flex items-center gap-2 text-gray-300 group-hover:text-white">
              <Fingerprint className="text-blue-400" size={16} /> UUID Generator
            </div>
            <div className="text-[10px] text-gray-500 mt-1 truncate">{uuid}</div>
          </div>

          {/* Base64 */}
          <div className="p-2 hover:bg-white/5 rounded">
            <div className="flex items-center gap-2 text-gray-300 mb-2">
              <RefreshCw className="text-green-400" size={16} /> Base64
            </div>
            <input 
              type="text" 
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
              placeholder="Input..." 
              className="w-full bg-black/30 border border-[#3e3e42] rounded px-2 py-1 text-xs text-white mb-2 focus:outline-none focus:border-[#007acc]"
            />
            <div className="flex gap-1 mb-2">
              <button onClick={() => handleBase64('enc')} className="flex-1 bg-[#007acc]/20 hover:bg-[#007acc]/40 text-[10px] py-1 rounded text-[#007acc] border border-[#007acc]/30">Encode</button>
              <button onClick={() => handleBase64('dec')} className="flex-1 bg-[#007acc]/20 hover:bg-[#007acc]/40 text-[10px] py-1 rounded text-[#007acc] border border-[#007acc]/30">Decode</button>
            </div>
            {base64Output && (
              <div 
                onClick={() => copyToClipboard(base64Output)}
                className="text-[10px] bg-black/20 p-1 rounded break-all cursor-pointer hover:text-white border border-transparent hover:border-white/10"
              >
                {base64Output}
              </div>
            )}
          </div>

          {/* Unix Timestamp */}
          <div className="p-2 hover:bg-white/5 rounded">
            <div className="flex items-center gap-2 text-gray-300 mb-2">
              <Clock className="text-orange-400" size={16} /> Unix Timestamp
            </div>
            <div 
              onClick={() => copyToClipboard(timestamp.toString())}
              className="text-xs font-mono bg-black/30 p-2 rounded text-center cursor-pointer hover:bg-black/50 hover:text-[#007acc]"
            >
              {timestamp}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Editor Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        
        {/* Header */}
        <header className="h-12 md:h-10 bg-[#1e1e1e] border-b border-[#3e3e42] flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Menu className="md:hidden cursor-pointer" size={20} onClick={() => setIsSidebarOpen(true)} />
            <div className="flex items-center gap-2 text-gray-400">
              <FileCode className="text-yellow-400" size={16} />
              <span className="text-xs font-medium">input.json</span>
              {!isValid && (
                <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertCircle size={10} /> Invalid JSON
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={formatJSON} className="text-[11px] bg-white/5 hover:bg-white/10 px-2 md:px-3 py-1 rounded text-gray-300 flex items-center gap-1.5 transition border border-white/5">
              <AlignLeft size={14} /> <span className="hidden sm:inline">Format</span>
            </button>
            <button onClick={minifyJSON} className="text-[11px] bg-white/5 hover:bg-white/10 px-2 md:px-3 py-1 rounded text-gray-300 flex items-center gap-1.5 transition border border-white/5">
              <Compress size={14} /> <span className="hidden sm:inline">Minify</span>
            </button>
          </div>
        </header>

        {/* Content Splitter */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Input Side */}
          <section className="flex-1 md:w-1/2 border-b md:border-b-0 md:border-r border-[#3e3e42] relative flex flex-col min-h-[300px] md:min-h-0">
            <div className="absolute inset-0 overflow-auto scrollbar-custom">
              {/* Syntax Highlighting Layer */}
              <pre 
                ref={highlightRef}
                className="absolute top-0 left-0 w-full min-h-full p-4 m-0 font-mono text-[13px] leading-relaxed whitespace-pre pointer-events-none z-0"
                dangerouslySetInnerHTML={{ __html: syntaxHighlight(input) }}
              />
              {/* Invisible Textarea */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onScroll={handleScroll}
                spellCheck="false"
                className="absolute top-0 left-0 w-full h-full p-4 m-0 bg-transparent text-transparent caret-white font-mono text-[13px] leading-relaxed resize-none outline-none z-10 whitespace-pre overflow-auto"
                placeholder="// Paste JSON here..."
              />
            </div>
          </section>

          {/* Output Side */}
          <section className="flex-1 md:w-1/2 flex flex-col bg-[#1e1e1e] min-h-[300px] md:min-h-0">
            {/* Tabs */}
            <div className="flex h-9 bg-[#252526] border-b border-[#3e3e42]">
              {[
                { id: 'ts', label: 'TypeScript', icon: <Braces size={14} className="text-blue-400" /> },
                { id: 'zod', label: 'Zod Schema', icon: <ShieldCheck size={14} className="text-purple-400" /> },
                { id: 'sql', label: 'SQL', icon: <Database size={14} className="text-green-400" /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`px-4 flex items-center gap-2 text-xs border-r border-[#3e3e42] transition-colors ${
                    currentTab === tab.id ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]' : 'text-gray-500 hover:bg-[#1e1e1e]'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Output Editor */}
            <div className="flex-1 relative overflow-hidden">
              <textarea 
                readOnly 
                value={output}
                className="w-full h-full bg-[#1e1e1e] text-gray-300 font-mono text-[13px] p-4 resize-none outline-none selection:bg-[#007acc]/30"
                spellCheck="false"
              />
              <button 
                onClick={() => copyToClipboard(output)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded shadow-xl backdrop-blur-md text-[11px] flex items-center gap-2 transition-all border border-white/10"
              >
                {copyFeedback ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copyFeedback ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="h-6 bg-[#007acc] text-white text-[10px] flex items-center px-3 justify-between shrink-0">
          <div className="flex gap-4">
            <span className="flex items-center gap-1 opacity-90"><Code size={10} /> main</span>
            <span className="opacity-90">{input.length} characters</span>
          </div>
          <div className="flex gap-3">
            <span>UTF-8</span>
            <span className="hidden sm:inline">JSON to {currentTab.toUpperCase()}</span>
          </div>
        </footer>
      </main>

      <style jsx>{`
        .scrollbar-custom::-webkit-scrollbar { width: 10px; height: 10px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: #1e1e1e; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: #424242; border-radius: 5px; }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: #4f4f4f; }
        textarea { tab-size: 2; }
      `}</style>
    </div>
  );
};

export default Project;