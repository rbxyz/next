"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "~/trpc/react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
  
  const { data: workspaces, isLoading } = api.workspace.getAll.useQuery();
  
  const toggleWorkspace = (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);
  };

  if (isLoading) {
    return (
      <div className={`w-64 bg-gray-50 border-r border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0 ${className}`}>
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Navigation
          </h2>
          <nav className="space-y-1">
            <Link
              href="/workspaces"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === "/workspaces"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              All Workspaces
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Workspaces
          </h2>
          <nav className="space-y-1">
            {workspaces?.map((workspace) => (
              <WorkspaceDropdown
                key={workspace.id}
                workspace={workspace}
                isExpanded={expandedWorkspaces.has(workspace.id)}
                onToggle={() => toggleWorkspace(workspace.id)}
                pathname={pathname}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

interface WorkspaceDropdownProps {
  workspace: {
    id: string;
    name: string;
    description?: string | null;
  };
  isExpanded: boolean;
  onToggle: () => void;
  pathname: string;
}

function WorkspaceDropdown({ workspace, isExpanded, onToggle, pathname }: WorkspaceDropdownProps) {
  const { data: notes } = api.note.getByWorkspace.useQuery(
    { workspaceId: workspace.id },
    { enabled: isExpanded }
  );

  const isWorkspaceActive = pathname.includes(`/workspaces/${workspace.id}`);

  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isWorkspaceActive
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <svg
          className={`w-4 h-4 mr-2 transition-transform ${
            isExpanded ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2 flex-shrink-0"></div>
        <span className="truncate">{workspace.name}</span>
      </button>

      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          <Link
            href={`/workspaces/${workspace.id}`}
            className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
              pathname === `/workspaces/${workspace.id}`
                ? "bg-gray-200 text-gray-900"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            📁 Overview
          </Link>
          <Link
            href={`/workspaces/${workspace.id}/new`}
            className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
              pathname === `/workspaces/${workspace.id}/new`
                ? "bg-gray-200 text-gray-900"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            ➕ New Note
          </Link>
          
          {notes && notes.length > 0 && (
            <div className="pt-2">
              <div className="text-xs font-medium text-gray-400 px-3 py-1">
                Notes ({notes.length})
              </div>
              {notes.slice(0, 5).map((note) => (
                <Link
                  key={note.id}
                  href={`/workspaces/${workspace.id}/${note.id}`}
                  className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                    pathname === `/workspaces/${workspace.id}/${note.id}`
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  <span className="truncate">📝 {note.title}</span>
                </Link>
              ))}
              {notes.length > 5 && (
                <Link
                  href={`/workspaces/${workspace.id}`}
                  className="block px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600"
                >
                  ... and {notes.length - 5} more
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}