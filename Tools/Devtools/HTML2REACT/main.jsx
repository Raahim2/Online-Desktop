"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Code2, 
  Eye, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  RotateCcw,
  FileCode,
  Globe
} from 'lucide-react';

const HTMLToJSXConverter = () => {
  // --- State ---
  const [inputHtml, setInputHtml] = useState('');
  const [outputJsx, setOutputJsx] = useState('');
  const [compName, setCompName] = useState('MyComponent');
  const [useClass, setUseClass] = useState(false);
  const [wrapComp, setWrapComp] = useState(true);
  const [activeTab, setActiveTab] = useState('jsx');
  const [showToast, setShowToast] = useState(false);

  const previewFrameRef = useRef(null);

  // --- Core Conversion Logic ---
  const mapAttributeName = (attr) => {
    if (attr === 'class') return 'className';
    if (attr === 'for') return 'htmlFor';
    if (attr.startsWith('aria-') || attr.startsWith('data-')) return attr;
    
    const map = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'autocomplete': 'autoComplete',
      'maxlength': 'maxLength',
      'minlength': 'minLength',
      'autofocus': 'autoFocus',
      'enctype': 'encType',
      'crossorigin': 'crossOrigin',
      'stroke-width': 'strokeWidth',
      'fill-opacity': 'fillOpacity',
      'viewbox': 'viewBox',
      'onclick': 'onClick',
      'onchange': 'onChange'
    };
    return map[attr] || attr;
  };

  const isBooleanAttr = (attr) => {
    return ['checked', 'disabled', 'readOnly', 'required', 'selected', 'hidden', 'loop', 'autoPlay', 'controls'].includes(attr);
  };

  const styleStringToObject = (styleString) => {
    if (!styleString) return '{}';
    const styles = styleString.split(';').reduce((acc, style) => {
      const colonPos = style.indexOf(':');
      if (colonPos !== -1) {
        const prop = style.substring(0, colonPos).trim();
        const val = style.substring(colonPos + 1).trim();
        if (prop && val) {
          const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          acc.push(`${camelProp}: '${val.replace(/'/g, "\\'")}'`);
        }
      }
      return acc;
    }, []);
    return `{ ${styles.join(', ')} }`;
  };

  const processNode = (node, indentLevel) => {
    const indent = '  '.repeat(indentLevel);

    if (node.nodeType === 3) { // TEXT_NODE
      const text = node.textContent;
      if (!text.trim()) return '';
      return `${indent}${text.replace(/{/g, "{'{'}").replace(/}/g, "{'}'}")}`;
    }

    if (node.nodeType === 8) { // COMMENT_NODE
      return `${indent}{/* ${node.textContent.trim()} */}`;
    }

    if (node.nodeType === 1) { // ELEMENT_NODE
      const tagName = node.tagName.toLowerCase();
      let props = '';

      Array.from(node.attributes).forEach(attr => {
        const name = mapAttributeName(attr.name);
        let value = attr.value;

        if (name === 'style') {
          value = styleStringToObject(value);
          props += ` ${name}={${value}}`;
        } else if (value === '' && isBooleanAttr(name)) {
          props += ` ${name}`;
        } else {
          props += ` ${name}="${value}"`;
        }
      });

      const selfClosing = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
      
      if (selfClosing.includes(tagName)) {
        return `${indent}<${tagName}${props} />`;
      }

      const children = Array.from(node.childNodes)
        .map(child => processNode(child, indentLevel + 1))
        .filter(s => s !== '');

      if (children.length === 0) {
        return `${indent}<${tagName}${props}></${tagName}>`;
      }

      return `${indent}<${tagName}${props}>\n${children.join('\n')}\n${indent}</${tagName}>`;
    }
    return '';
  };

  const performConversion = () => {
    if (!inputHtml.trim()) {
      setOutputJsx('');
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${inputHtml}</body>`, 'text/html');
    const nodes = doc.body.childNodes;
    
    let convertedNodes = [];
    nodes.forEach(node => {
      const result = processNode(node, 1);
      if (result) convertedNodes.push(result);
    });
    
    let bodyContent = convertedNodes.join('\n');
    let jsx = '';

    if (wrapComp) {
      if (useClass) {
        jsx = `import React, { Component } from 'react';\n\nclass ${compName} extends Component {\n  render() {\n    return (\n${bodyContent}\n    );\n  }\n}\n\nexport default ${compName};`;
      } else {
        jsx = `import React from 'react';\n\nconst ${compName} = () => {\n  return (\n${bodyContent}\n  );\n};\n\nexport default ${compName};`;
      }
    } else {
      jsx = convertedNodes.length > 1 ? `<>\n${bodyContent}\n</>` : bodyContent.trim();
    }

    setOutputJsx(jsx);

    // Update Preview
    if (previewFrameRef.current) {
      const frameDoc = previewFrameRef.current.contentDocument;
      frameDoc.open();
      frameDoc.write(`<style>body { font-family: sans-serif; padding: 20px; }</style>${inputHtml}`);
      frameDoc.close();
    }
  };

  useEffect(() => {
    performConversion();
  }, [inputHtml, compName, useClass, wrapComp]);

  // --- Handlers ---
  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputJsx);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const clearAll = () => {
    setInputHtml('');
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#c9d1d9] font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <RotateCcw className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight text-sm md:text-base">HTML TO JSX</h1>
            <p className="text-[10px] text-gray-500 font-mono">DEVELOPER TOOLS</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="hidden md:flex items-center gap-4 bg-[#010409] px-4 py-1.5 rounded-lg border border-[#30363d]">
          <div className="flex items-center gap-2 border-r border-[#30363d] pr-4">
            <span className="text-[10px] text-gray-500 font-mono">NAME:</span>
            <input 
              type="text" 
              value={compName} 
              onChange={(e) => setCompName(e.target.value)}
              className="bg-transparent text-xs text-cyan-400 font-mono focus:outline-none w-32"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-[10px] font-semibold text-gray-400 hover:text-white">
              <input 
                type="checkbox" 
                checked={useClass} 
                onChange={(e) => setUseClass(e.target.checked)}
                className="accent-cyan-500" 
              />
              Use Class
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[10px] font-semibold text-gray-400 hover:text-white">
              <input 
                type="checkbox" 
                checked={wrapComp} 
                onChange={(e) => setWrapComp(e.target.checked)}
                className="accent-cyan-500" 
              />
              Wrap Component
            </label>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={copyToClipboard}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-[10px] font-bold transition-colors flex items-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" /> COPY
          </button>
          <button 
            onClick={clearAll}
            className="text-red-400 hover:text-red-300 px-2 py-1.5 text-[10px] font-bold transition-colors"
          >
            CLEAR
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left: HTML Input */}
        <section className="w-full md:w-1/2 flex flex-col border-r border-[#30363d] min-w-[300px]">
          <div className="h-9 bg-[#161b22] border-b border-[#30363d] flex items-center px-4 justify-between">
            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-2">
              <Globe className="w-3 h-3 text-orange-500" /> HTML INPUT
            </span>
            <span className="text-[10px] text-gray-600">PASTE CODE HERE</span>
          </div>
          <div className="flex-1 relative bg-[#010409]">
            <textarea 
              value={inputHtml}
              onChange={(e) => setInputHtml(e.target.value)}
              className="w-full h-full bg-transparent text-gray-300 font-mono text-xs p-4 leading-relaxed outline-none resize-none"
              placeholder="<!-- Paste your raw HTML here -->
<div class='card' style='background-color: #333'>
    <h1>Hello World</h1>
    <input type='text' readonly>
</div>"
            />
          </div>
        </section>

        {/* Right: Output & Preview */}
        <section className="w-full md:w-1/2 flex flex-col bg-[#161b22]">
          <div className="h-9 border-b border-[#30363d] flex items-center px-2 bg-[#161b22]">
            <button 
              onClick={() => setActiveTab('jsx')}
              className={`h-full px-4 text-[10px] font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'jsx' ? 'border-cyan-400 text-white' : 'border-transparent text-gray-500'
              }`}
            >
              <FileCode className={`w-3.5 h-3.5 ${activeTab === 'jsx' ? 'text-cyan-400' : ''}`} /> JSX CODE
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`h-full px-4 text-[10px] font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'preview' ? 'border-green-400 text-white' : 'border-transparent text-gray-500'
              }`}
            >
              <Eye className={`w-3.5 h-3.5 ${activeTab === 'preview' ? 'text-green-400' : ''}`} /> PREVIEW
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            {/* JSX View */}
            <div className={`absolute inset-0 flex flex-col ${activeTab !== 'jsx' ? 'hidden' : ''}`}>
              <textarea 
                value={outputJsx}
                readOnly
                className="w-full h-full bg-[#0d1117] text-[#a5d6ff] font-mono text-xs p-4 leading-relaxed outline-none resize-none selection:bg-cyan-500/30"
              />
              
              {/* Toast */}
              <div className={`absolute bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg text-[10px] font-bold transition-all duration-300 flex items-center gap-2 ${
                showToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> COPIED TO CLIPBOARD
              </div>
            </div>

            {/* Preview View */}
            <div className={`absolute inset-0 bg-white ${activeTab !== 'preview' ? 'hidden' : ''}`}>
              <iframe 
                ref={previewFrameRef}
                title="Preview"
                className="w-full h-full border-none"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gray-100 border-t border-gray-300 px-3 py-1 text-[9px] text-gray-500 flex justify-between">
                <span>RENDER PREVIEW (Raw HTML)</span>
                <span>Viewport: 100%</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0d1117; 
        }
        ::-webkit-scrollbar-thumb {
          background: #30363d; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #484f58; 
        }
      `}</style>
    </div>
  );
};

export default HTMLToJSXConverter;