import React from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";

export default async function SingleWorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  
  // Get workspace info and notes
  const [workspaces, notes] = await Promise.all([
    api.workspace.getAll(),
    api.note.getByWorkspace({ workspaceId }),
  ]);
  
  const workspace = workspaces.find(w => w.id === workspaceId);
  
  return (
    <div className="bg-gray-50 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {workspace?.name || "Workspace"}
          </h1>
          {workspace?.description && (
            <p className="text-gray-600 mt-2">{workspace.description}</p>
          )}
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>{notes.length} notes</span>
          </div>
        </div>
        <Link href={`/workspaces/${workspaceId}/new`}>
          <Button>New Note</Button>
        </Link>
      </div>
      
      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
          <p className="text-gray-500 mb-6">Create your first note to get started with this workspace.</p>
          <Link href={`/workspaces/${workspaceId}/new`}>
            <Button>Create your first note</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/workspaces/${workspaceId}/${note.id}`}
              className="group block p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {note.title}
                </h3>
                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 ml-2"></div>
              </div>
              
              {note.content && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {note.content.replace(/#+\s/g, '').substring(0, 120)}...
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{note.authorName || "Anonymous"}</span>
                <span>{new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}