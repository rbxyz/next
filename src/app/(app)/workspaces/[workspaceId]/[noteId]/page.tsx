"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { LiveMarkdownEditor } from "~/components/core/live-markdown-editor";
import { api } from "~/trpc/react";
import { 
  Square, 
  Circle, 
  Triangle, 
  Diamond, 
  Pentagon,
  Hexagon,
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff,
  BookOpen,
  FileText,
  Library,
  Plus,
  List
} from "lucide-react";

export default function NotePage({
  params,
}: {
  params: Promise<{ workspaceId: string; noteId: string }>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [noteId, setNoteId] = useState<string>("");
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [showNavigation, setShowNavigation] = useState(true);
  
  // Refs para controlar debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Resolve params
  useEffect(() => {
    params.then((resolvedParams) => {
      setNoteId(resolvedParams.noteId);
      setWorkspaceId(resolvedParams.workspaceId);
    });
  }, [params]);

  // Load note data
  const { data: note } = api.note.getById.useQuery(
    { id: noteId },
    { enabled: !!noteId }
  );

  // Load workspace notes for navigation
  const { data: workspaceNotes } = api.note.getByWorkspace.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  );

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
      setLastSaved(new Date(note.updatedAt || note.createdAt));
      setIsLoading(false);
    }
  }, [note]);

  const updateNote = api.note.update.useMutation({
    onMutate: () => {
      setIsSaving(true);
    },
    onSuccess: () => {
      setIsSaving(false);
      setLastSaved(new Date());
    },
    onError: (error) => {
      setIsSaving(false);
      alert(`Error updating note: ${error.message}`);
    },
  });

  // Função de save otimizada
  const saveNote = useCallback((newTitle: string, newContent: string) => {
    if (!note) return;
    
    // Só salva se houve mudança real
    if (newTitle === note.title && newContent === (note.content || "")) return;
    
    // Só salva se há conteúdo
    if (!newTitle.trim() && !newContent.trim()) return;

    updateNote.mutate({
      id: noteId,
      title: newTitle,
      content: newContent,
    });
  }, [note, updateNote, noteId]);

  // Debounce para o conteúdo (5 segundos)
  const debouncedSaveContent = useCallback((newContent: string) => {
    // Cancela save anterior se estiver pendente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Agenda novo save
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(title, newContent);
    }, 5000); // 5 segundos
  }, [title, saveNote]);

  // Debounce para o título (3 segundos - mais rápido pois é menos frequente)
  const debouncedSaveTitle = useCallback((newTitle: string) => {
    // Cancela save anterior se estiver pendente
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current);
    }

    // Agenda novo save
    titleTimeoutRef.current = setTimeout(() => {
      saveNote(newTitle, content);
    }, 3000); // 3 segundos para título
  }, [content, saveNote]);

  // Handlers otimizados
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    debouncedSaveContent(newContent);
  }, [debouncedSaveContent]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    debouncedSaveTitle(newTitle);
  }, [debouncedSaveTitle]);

  // Save manual
  const handleManualSave = useCallback(() => {
    // Cancela debounces pendentes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current);
    }
    
    // Salva imediatamente
    saveNote(title, content);
  }, [title, content, saveNote]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current);
      }
    };
  }, []);

  // Save antes de sair da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current || titleTimeoutRef.current) {
        // Força save síncrono antes de sair
        saveNote(title, content);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [title, content, saveNote]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading note...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Note not found.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Extract headings for table of contents
  const headings = content.match(/^#{1,6}\s+(.+)$/gm) || [];
  const tableOfContents = headings.map((heading, index) => {
    const level = heading.match(/^#+/)?.[0].length || 1;
    const text = heading.replace(/^#+\s+/, '');
    const id = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    return { level, text, id, index };
  });

  // Navigation between notes
  const currentNoteIndex = workspaceNotes?.findIndex(n => n.id === noteId) ?? -1;
  const previousNote = currentNoteIndex > 0 ? workspaceNotes?.[currentNoteIndex - 1] : null;
  const nextNote = currentNoteIndex < (workspaceNotes?.length ?? 0) - 1 ? workspaceNotes?.[currentNoteIndex + 1] : null;

  // Status do save para exibição
  const getSaveStatus = () => {
    if (isSaving) return "Salvando...";
    if (saveTimeoutRef.current || titleTimeoutRef.current) return "Salvando em breve...";
    return "Salvo";
  };

  const getSaveStatusColor = () => {
    if (isSaving) return "text-blue-600";
    if (saveTimeoutRef.current || titleTimeoutRef.current) return "text-yellow-600";
    return "text-green-600";
  };

  const navigateToNote = (noteId: string) => {
    router.push(`/workspaces/${workspaceId}/${noteId}`);
  };

  const getHeadingIcon = (level: number) => {
    const iconConfigs = [
      { icon: Square, color: 'text-blue-600' },    // H1
      { icon: Circle, color: 'text-green-600' },   // H2  
      { icon: Triangle, color: 'text-purple-600' },// H3
      { icon: Diamond, color: 'text-orange-600' }, // H4
      { icon: Pentagon, color: 'text-pink-600' },  // H5
      { icon: Hexagon, color: 'text-indigo-600' }, // H6
    ];
    return iconConfigs[level - 1] || iconConfigs[0];
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Title Bar with Navigation */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Navigation Arrows */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => previousNote && navigateToNote(previousNote.id)}
                disabled={!previousNote}
                className={`p-2 rounded-lg border transition-colors ${
                  previousNote 
                    ? 'hover:bg-gray-100 border-gray-300 text-gray-700' 
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title={previousNote ? `Anterior: ${previousNote.title}` : 'Primeira nota'}
              >
                ←
              </button>
              <button
                onClick={() => nextNote && navigateToNote(nextNote.id)}
                disabled={!nextNote}
                className={`p-2 rounded-lg border transition-colors ${
                  nextNote 
                    ? 'hover:bg-gray-100 border-gray-300 text-gray-700' 
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title={nextNote ? `Próxima: ${nextNote.title}` : 'Última nota'}
              >
                →
              </button>
            </div>

            {/* Title Input */}
            <div className="flex-1 max-w-2xl">
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Untitled"
                className="text-2xl font-bold border-none shadow-none px-0 focus:ring-0 bg-transparent"
                disabled={false}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Toggle Navigation Button */}
            <button
              onClick={() => setShowNavigation(!showNavigation)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
              title="Toggle Navigation"
            >
              {showNavigation ? '👁️' : '📖'}
            </button>

            <span className={`text-sm ${getSaveStatusColor()}`}>
              {getSaveStatus()}
            </span>
            <Button
              onClick={handleManualSave}
              disabled={isSaving}
              size="sm"
              variant="outline"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {/* Progress and Meta */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>
              {currentNoteIndex + 1} de {workspaceNotes?.length || 0} notas
            </span>
            {content && (
              <span>
                {content.split(/\s+/).length} palavras
              </span>
            )}
            {tableOfContents.length > 0 && (
              <span>
                {tableOfContents.length} seções
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {lastSaved && `Última atualização: ${lastSaved.toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Live Editor */}
        <div className="flex-1 min-w-0">
          <LiveMarkdownEditor
            content={content}
            onChange={handleContentChange}
            disabled={false}
          />
        </div>

        {/* Enhanced Navigation Sidebar */}
        {showNavigation && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Table of Contents */}
            {tableOfContents.length > 0 && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                    📑 Sumário
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {tableOfContents.length}
                  </span>
                </div>
                <nav className="space-y-1 max-h-48 overflow-auto">
                  {tableOfContents.map((heading) => (
                    <button
                      key={heading.index}
                      onClick={() => {
                        const element = document.getElementById(heading.id);
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="block text-left w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      style={{ paddingLeft: `${12 + heading.level * 12}px` }}
                    >
                      <span className={`mr-2 ${getHeadingIcon(heading.level).color}`}>
                        {React.createElement(getHeadingIcon(heading.level).icon, { size: 14 })}
                      </span>
                      {heading.text}
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* All Notes in Workspace */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  📚 Todas as Notas
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {workspaceNotes?.length || 0}
                </span>
              </div>
              
              <div className="space-y-1">
                {workspaceNotes?.map((workspaceNote, index) => (
                  <button
                    key={workspaceNote.id}
                    onClick={() => navigateToNote(workspaceNote.id)}
                    className={`block text-left w-full px-3 py-3 text-sm rounded-lg transition-colors ${
                      workspaceNote.id === noteId
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs">
                            {workspaceNote.id === noteId ? '📖' : '📄'}
                          </span>
                          <span className="font-medium truncate">
                            {workspaceNote.title || 'Untitled'}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {new Date(workspaceNote.updatedAt || workspaceNote.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 ml-2">
                        {index + 1}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => router.push(`/workspaces/${workspaceId}/new`)}
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  ➕ Nova Nota
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}