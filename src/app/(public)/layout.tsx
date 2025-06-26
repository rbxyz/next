import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 md:w-3/4 lg:w-1/2 rounded-lg shadow-xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-between p-8 bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          <div>
            <h1 className="font-extrabold text-4xl tracking-tight">
              Hub <span className="text-[hsl(280,100%,70%)]">Notion</span>
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Sua plataforma de produtividade e colaboração tudo-em-um.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">✅</span>
              <p>Organize suas ideias e projetos com facilidade.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">✅</span>
              <p>Colabore em tempo real com sua equipe.</p>
            </div>
          </div>
        </div>
        {/* Right Panel (Form) */}
        <div className="p-8 bg-white">{children}</div>
      </div>
    </div>
  );
} 