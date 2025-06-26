import React from "react";

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceId: string };
}) {
  // TODO: Fetch workspace data using params.workspaceId
  return (
    <div>
      {/* Can add workspace-specific context/header here */}
      {children}
    </div>
  );
}