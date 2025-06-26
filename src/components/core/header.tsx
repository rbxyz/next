import React from "react";

export function Header() {
  return (
    <header className="flex h-16 items-center border-b bg-white px-8">
      <div className="flex-1">
        {/* TODO: Breadcrumbs or Search */}
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>
      <div>{/* TODO: User menu/avatar */}</div>
    </header>
  );
}