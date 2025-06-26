"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LiveMarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  disabled?: boolean;
}

export function LiveMarkdownEditor({ content, onChange, disabled }: LiveMarkdownEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState(content);
  const [rawContent, setRawContent] = useState(content);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [isHovering, setIsHovering] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lastTypedTime, setLastTypedTime] = useState<number>(0);
  const [isActivelyTyping, setIsActivelyTyping] = useState(false);

  // Sync content when external content changes
  useEffect(() => {
    setEditingContent(content);
    setRawContent(content);
  }, [content]);

  // Auto-render markdown after typing stops for a longer period
  useEffect(() => {
    if (isEditing && !isActivelyTyping) {
      const timer = setTimeout(() => {
        if (Date.now() - lastTypedTime >= 3000) { // 3 segundos para dar mais tempo
          setIsEditing(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastTypedTime, isEditing, isActivelyTyping]);

  // Track active typing
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        setIsActivelyTyping(false);
      }, 1500); // Considera parado após 1.5 segundos
      return () => clearTimeout(timer);
    }
  }, [lastTypedTime, isEditing]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    setIsEditing(true);
    setIsActivelyTyping(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(rawContent.length, rawContent.length);
      }
    }, 0);
  }, [rawContent, disabled]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditingContent(newContent);
    setRawContent(newContent);
    setCursorPosition(e.target.selectionStart);
    setLastTypedTime(Date.now());
    setIsActivelyTyping(true);
    onChange(newContent);
  }, [onChange]);

  const handleTextareaBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    // Only exit editing mode if not clicking within the editor area
    const relatedTarget = e.relatedTarget as HTMLElement;
    const isClickingWithinEditor = relatedTarget && (
      relatedTarget.closest('.editor-container') ||
      relatedTarget === textareaRef.current
    );
    
    if (!isClickingWithinEditor) {
      setTimeout(() => {
        setIsEditing(false);
        setIsActivelyTyping(false);
      }, 150);
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setLastTypedTime(Date.now());
    setIsActivelyTyping(true);

    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editingContent.substring(start, end);
    const beforeSelection = editingContent.substring(0, start);
    const afterSelection = editingContent.substring(end);

    // Helper function to insert text and maintain cursor position
    const insertText = (before: string, after: string = '', moveCaretBy: number = 0) => {
      e.preventDefault();
      const newText = beforeSelection + before + selectedText + after + afterSelection;
      const newCursorPos = selectedText ? end + after.length : start + before.length + moveCaretBy;
      
      setEditingContent(newText);
      setRawContent(newText);
      onChange(newText);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    };

    // Save and exit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
      setIsActivelyTyping(false);
      return;
    }

    // Exit on Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      setIsActivelyTyping(false);
      return;
    }

    // Markdown shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b': // Bold **text**
          insertText('**', '**');
          return;
          
        case 'i': // Italic *text*
          insertText('*', '*');
          return;
          
        case 'k': // Link [text](url)
          if (selectedText) {
            insertText('[', '](url)', -4);
          } else {
            insertText('[texto](', ')', -1);
          }
          return;
          
        case 'u': // Strikethrough ~~text~~
          insertText('~~', '~~');
          return;
          
        case '`': // Inline code `text`
        case 'e': // Alternative for inline code
          if (e.shiftKey) {
            insertText('`', '`');
            return;
          }
          break;
          
                 case '/': // Blockquote > text
           const currentLine = beforeSelection.split('\n').pop() || '';
           if (currentLine.trim() === '') {
             insertText('> ');
           } else {
             // Add blockquote to beginning of current line
             const lastLineStart = beforeSelection.lastIndexOf('\n') + 1;
             const newContent = editingContent.substring(0, lastLineStart) + '> ' + editingContent.substring(lastLineStart);
             setEditingContent(newContent);
             setRawContent(newContent);
             onChange(newContent);
             
             setTimeout(() => {
               if (textareaRef.current) {
                 textareaRef.current.setSelectionRange(start + 2, end + 2);
               }
             }, 0);
           }
           e.preventDefault();
           return;
          
        case 'l': // List
          if (e.shiftKey) {
            // Numbered list 1. item
            insertText('1. ');
          } else {
            // Bullet list - item
            insertText('- ');
          }
          return;
          
        case '1': // Header 1 #
        case '2': // Header 2 ##
        case '3': // Header 3 ###
        case '4': // Header 4 ####
        case '5': // Header 5 #####
        case '6': // Header 6 ######
          const headerLevel = parseInt(e.key);
          const hashes = '#'.repeat(headerLevel);
          const currentLineStart = beforeSelection.lastIndexOf('\n') + 1;
          const currentLineContent = editingContent.substring(currentLineStart, start);
          
          // Remove existing headers if any
          const cleanLine = currentLineContent.replace(/^#+\s*/, '');
          const newContent = editingContent.substring(0, currentLineStart) + hashes + ' ' + cleanLine + editingContent.substring(start);
          
          setEditingContent(newContent);
          setRawContent(newContent);
          onChange(newContent);
          
          setTimeout(() => {
            if (textareaRef.current) {
              const newPos = currentLineStart + hashes.length + 1 + cleanLine.length;
              textareaRef.current.setSelectionRange(newPos, newPos);
            }
          }, 0);
          e.preventDefault();
          return;
      }
    }

    // Handle Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const newContent = editingContent.substring(0, start) + '  ' + editingContent.substring(end);
      setEditingContent(newContent);
      setRawContent(newContent);
      onChange(newContent);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start + 2, start + 2);
        }
      }, 0);
      return;
    }

    // Enhanced Enter behavior
    if (e.key === 'Enter') {
      const currentLine = beforeSelection.split('\n').pop() || '';
      
             // Auto-continue lists
       const listMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s/);
       if (listMatch) {
         const indent = listMatch[1] || '';
         const marker = listMatch[2] || '';
         let newMarker = marker;
        
        // If it's a numbered list, increment the number
        if (/\d+\./.test(marker)) {
          const num = parseInt(marker) + 1;
          newMarker = `${num}.`;
        }
        
        insertText(`\n${indent}${newMarker} `);
        return;
      }
      
      // Auto-continue blockquotes
      if (currentLine.match(/^\s*>\s/)) {
        const indent = currentLine.match(/^(\s*)/)?.[1] || '';
        insertText(`\n${indent}> `);
        return;
      }
      
      // Regular enter - just add newline
      // Let default behavior handle this
    }

    // Shift+Enter for hard line break
    if (e.key === 'Enter' && e.shiftKey) {
      insertText('  \n'); // Two spaces + newline = hard break in markdown
      return;
    }
  }, [editingContent, onChange]);

  const handleManualRender = useCallback(() => {
    setIsEditing(false);
    setIsActivelyTyping(false);
  }, []);

  const MarkdownRenderer = ({ children }: { children: string }) => (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({children}) => (
            <h1 className="text-3xl font-bold mb-4 text-gray-900 border-b-2 border-gray-200 pb-2">
              {children}
            </h1>
          ),
          h2: ({children}) => (
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 mt-8">
              {children}
            </h2>
          ),
          h3: ({children}) => (
            <h3 className="text-xl font-semibold mb-3 text-gray-900 mt-6">
              {children}
            </h3>
          ),
          h4: ({children}) => (
            <h4 className="text-lg font-semibold mb-2 text-gray-900 mt-4">
              {children}
            </h4>
          ),
          h5: ({children}) => (
            <h5 className="text-base font-semibold mb-2 text-gray-900 mt-4">
              {children}
            </h5>
          ),
          h6: ({children}) => (
            <h6 className="text-sm font-semibold mb-2 text-gray-900 mt-4">
              {children}
            </h6>
          ),
          p: ({children}) => (
            <p className="mb-4 leading-relaxed text-gray-900">{children}</p>
          ),
          strong: ({children}) => (
            <strong className="font-bold text-gray-900">{children}</strong>
          ),
          em: ({children}) => (
            <em className="italic text-gray-800">{children}</em>
          ),
          code: ({children, className}) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-pink-600 border">
                  {children}
                </code>
              );
            }
            return (
              <code className={`${className} text-sm`}>
                {children}
              </code>
            );
          },
          pre: ({children}) => (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 border">
              {children}
            </pre>
          ),
          blockquote: ({children}) => (
            <blockquote className="border-l-4 border-blue-400 pl-6 py-2 my-6 bg-blue-50 rounded-r italic text-blue-800">
              {children}
            </blockquote>
          ),
          ul: ({children}) => (
            <ul className="list-disc list-outside mb-4 space-y-1 ml-6">
              {children}
            </ul>
          ),
          ol: ({children}) => (
            <ol className="list-decimal list-outside mb-4 space-y-1 ml-6">
              {children}
            </ol>
          ),
          li: ({children}) => (
            <li className="text-gray-900 leading-relaxed">{children}</li>
          ),
          a: ({children, href}) => (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          table: ({children}) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
                {children}
              </table>
            </div>
          ),
          th: ({children}) => (
            <th className="border border-gray-300 px-4 py-3 bg-gray-100 font-semibold text-left text-gray-900">
              {children}
            </th>
          ),
          td: ({children}) => (
            <td className="border border-gray-300 px-4 py-3 text-gray-900">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-8 border-gray-300" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );

  return (
    <div 
      className="w-full h-full relative editor-container group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Toolbar Flutuante - Aparece só no hover ou durante edição */}
      {(isHovering || isEditing) && (
        <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-2 py-1 shadow-sm transition-all duration-200">
          {!isEditing ? (
            <span className="text-xs text-gray-500 px-2 py-1">
              Clique para editar
            </span>
          ) : (
            <>
              <button
                onClick={handleManualRender}
                className="text-xs text-gray-600 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                title="Visualizar (Ctrl+Enter)"
              >
                👁️
              </button>
              {isActivelyTyping && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Digitando..."></div>
              )}
            </>
          )}
        </div>
      )}

      {/* Editor Area - Transição suave entre modos */}
      <div className="relative h-full">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editingContent}
            onChange={handleTextareaChange}
            onBlur={handleTextareaBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="w-full h-full p-4 resize-none focus:outline-none text-sm bg-white border-0 transition-all duration-200"
            placeholder="Comece a escrever...

🚀 ATALHOS DISPONÍVEIS:
• Ctrl+B = **negrito**
• Ctrl+I = *itálico*  
• Ctrl+U = ~~riscado~~
• Ctrl+K = [link](url)
• Ctrl+Shift+` = `código`
• Ctrl+/ = > citação
• Ctrl+L = - lista
• Ctrl+Shift+L = 1. lista numerada
• Ctrl+1-6 = # títulos
• Shift+Enter = quebra de linha
• Tab = indentação
• Enter = continua listas automaticamente
• Ctrl+Enter = visualizar resultado"
            style={{ 
              minHeight: 'calc(100vh - 200px)',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
              lineHeight: '1.6'
            }}
          />
        ) : (
          <div 
            ref={editableRef}
            className="w-full h-full p-4 overflow-auto bg-white cursor-text transition-all duration-200 hover:bg-gray-50/30"
            style={{ minHeight: 'calc(100vh - 200px)' }}
            onClick={handleClick}
          >
            {content ? (
              <div className="min-h-full">
                <MarkdownRenderer>{content}</MarkdownRenderer>
              </div>
            ) : (
              <div className="text-gray-400 italic flex flex-col items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-lg mb-4">✨ Comece a escrever sua primeira nota</p>
                  <div className="text-sm space-y-2 text-gray-500 max-w-md">
                    <p>Clique em qualquer lugar para começar</p>
                    <p className="text-xs">Markdown será renderizado automaticamente</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 