"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "~/components/core/sidebar";
import { Header } from "~/components/core/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we're on an editor page (note creation or editing)
  const isEditorPage = pathname.includes('/new') || 
    (pathname.split('/').length === 5 && pathname.includes('/workspaces/'));

  if (isEditorPage) {
    return (
      <div className="flex min-h-screen">
        <Sidebar className="flex-shrink-0" />
        <main className="flex-1 min-w-0 relative">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}