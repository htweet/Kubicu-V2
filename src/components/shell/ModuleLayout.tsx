import React from 'react';
import { Outlet } from 'react-router-dom';
import { SubNav, type SubNavItem } from './SubNav';

export type ModuleNavItem = SubNavItem;

/** Shared frame for module areas with sub-pages (Bookings, …). */
export function ModuleLayout({ label, items }: { label: string; items: ModuleNavItem[] }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pt-6 md:px-10 md:pt-8">
      <SubNav label={label} items={items} />
      <div className="pb-16 pt-6 md:pt-8">
        <Outlet />
      </div>
    </div>
  );
}
