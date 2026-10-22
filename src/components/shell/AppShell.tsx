import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { KubicuLogo } from './KubicuLogo';

export function AppShell() {
  return (
    <div className="flex min-h-screen w-full bg-canvas text-fg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-line bg-raised px-4 md:hidden">
          <KubicuLogo />
        </header>
        <main className="flex-1 pb-24 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>);

}