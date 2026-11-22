import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

/**
 * Lightweight Zero-Dependency Markdown & Code Block Renderer
 * Formats headings, code blocks with syntax styling, copy-code button,
 * inline code, tables, blockquotes, bold/italic, and lists.
 */
export default function MarkdownRenderer({ content = '', className = '' }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content) return null;

  // Split content into code blocks vs text blocks
  const parts = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'code',
      code: match[2].trimEnd()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  return (
    <div className={`space-y-3 leading-relaxed text-slate-100 ${className}`}>
      {parts.map((part, pIdx) => {
        if (part.type === 'code') {
          return (
            <div 
              key={pIdx} 
              className="my-3 rounded-2xl overflow-hidden border border-cyan-500/25 bg-[#030712] shadow-xl text-left"
            >
              {/* Code Block Header */}
              <div className="px-4 py-2 bg-[#081224] border-b border-cyan-500/15 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Terminal className="w-3.5 h-3.5" />
                  <span className="uppercase text-[11px] font-bold tracking-wider">{part.lang}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(part.code, pIdx)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 text-slate-300 hover:text-white border border-slate-700/60 hover:border-cyan-400/50 transition-all cursor-pointer text-[11px]"
                >
                  {copiedIndex === pIdx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Pre Container */}
              <pre className="p-4 overflow-x-auto text-xs sm:text-[13px] font-mono text-cyan-100 bg-[#030712] leading-relaxed">
                <code>{part.code}</code>
              </pre>
            </div>
          );
        }

        // Parse regular text (Headings, Tables, Lists, Bold, Inline code)
        return (
          <div key={pIdx} className="space-y-2">
            {renderFormattedText(part.content)}
          </div>
        );
      })}
    </div>
  );
}

function renderFormattedText(text) {
  // Split into lines or paragraphs
  const lines = text.split('\n');
  const elements = [];
  let inTable = false;
  let tableRows = [];

  const flushTable = (key) => {
    if (tableRows.length > 0) {
      elements.push(
        <div key={key} className="overflow-x-auto my-3">
          <table className="w-full text-xs font-mono border-collapse border border-cyan-500/20 rounded-xl overflow-hidden bg-[#071325]/80">
            {tableRows.map((row, rIdx) => {
              const isHeader = rIdx === 0;
              const isSeparator = row.every(c => c.trim().match(/^[:\- ]+$/));
              if (isSeparator) return null;

              return (
                <tr 
                  key={rIdx} 
                  className={isHeader ? 'bg-[#091830] text-cyan-300 font-bold border-b border-cyan-500/30' : 'border-b border-slate-800 hover:bg-cyan-500/5'}
                >
                  {row.map((cell, cIdx) => (
                    isHeader ? (
                      <th key={cIdx} className="px-3.5 py-2 text-left">{parseInline(cell.trim())}</th>
                    ) : (
                      <td key={cIdx} className="px-3.5 py-2 text-slate-200">{parseInline(cell.trim())}</td>
                    )
                  ))}
                </tr>
              );
            })}
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check if table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      const cells = trimmed.split('|').slice(1, -1);
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(`tbl-${idx}`);
    }

    if (!trimmed) {
      elements.push(<div key={idx} className="h-1" />);
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={idx} className="text-sm font-bold text-cyan-300 mt-3 mb-1">
          {parseInline(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={idx} className="text-base font-bold text-white mt-4 mb-1">
          {parseInline(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={idx} className="text-lg font-black text-white mt-4 mb-2">
          {parseInline(trimmed.slice(2))}
        </h2>
      );
    } else if (trimmed.startsWith('> ')) {
      // Blockquote
      elements.push(
        <blockquote key={idx} className="border-l-2 border-cyan-400 pl-3 py-1 my-2 bg-cyan-950/20 rounded-r-lg text-slate-300 italic text-xs">
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      // Unordered list
      elements.push(
        <li key={idx} className="list-disc list-inside text-xs text-slate-200 ml-2">
          {parseInline(trimmed.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      // Ordered list
      const numMatch = trimmed.match(/^(\d+\.)\s(.*)/);
      elements.push(
        <li key={idx} className="list-decimal list-inside text-xs text-slate-200 ml-2">
          {numMatch ? parseInline(numMatch[2]) : parseInline(trimmed)}
        </li>
      );
    } else {
      // Standard paragraph
      elements.push(
        <p key={idx} className="text-xs sm:text-[13px] text-slate-200">
          {parseInline(trimmed)}
        </p>
      );
    }
  });

  if (inTable) {
    flushTable('tbl-end');
  }

  return elements;
}

/**
 * Parses inline formatting: **bold**, *italic*, `inline code`
 */
function parseInline(text) {
  if (!text) return '';

  // Tokenize inline code first: `code`
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((cPart, cIdx) => {
    if (cPart.startsWith('`') && cPart.endsWith('`') && cPart.length > 2) {
      return (
        <code 
          key={cIdx} 
          className="px-1.5 py-0.5 rounded-md bg-[#09152b] text-cyan-300 font-mono text-[11px] border border-cyan-500/25 mx-0.5"
        >
          {cPart.slice(1, -1)}
        </code>
      );
    }

    // Bold formatting: **bold**
    const boldParts = cPart.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
        return (
          <strong key={`${cIdx}-${bIdx}`} className="font-bold text-white">
            {bPart.slice(2, -2)}
          </strong>
        );
      }

      // Italic formatting: *italic*
      const italicParts = bPart.split(/(\*[^*]+\*)/g);
      return italicParts.map((iPart, iIdx) => {
        if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length > 2) {
          return (
            <em key={`${cIdx}-${bIdx}-${iIdx}`} className="italic text-cyan-200">
              {iPart.slice(1, -1)}
            </em>
          );
        }
        return iPart;
      });
    });
  });
}
