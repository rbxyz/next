import React from "react";
import Link from "next/link";
import { NewWorkspaceDialog } from "~/components/core/new-workspace-dialog";
import { api } from "~/trpc/server";

export default async function WorkspacesPage() {
  const workspaces = await api.workspace.getAll();

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Workspaces</h1>
          <p className="text-gray-600 mt-2">Organize your notes into focused workspaces</p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>{workspaces.length} workspaces</span>
          </div>
        </div>
        <NewWorkspaceDialog />
      </div>

      {/* Workspaces Grid */}
      {workspaces.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces yet</h3>
          <p className="text-gray-500 mb-6">Create your first workspace to start organizing your notes.</p>
          <NewWorkspaceDialog />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {workspaces.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/workspaces/${workspace.id}`}
              className="group block p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {workspace.name}
                </h3>
                <div className="w-3 h-3 bg-indigo-400 rounded-full flex-shrink-0"></div>
              </div>
              
              {workspace.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {workspace.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{workspace.ownerName || "Anonymous"}</span>
                <span>Workspace</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}