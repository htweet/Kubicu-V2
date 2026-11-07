import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/** Frame for the Growth tools that have their own sidebar entry: QR codes, Print kit and Campaign links. */
export function GrowthToolLayout() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pb-16 pt-8 md:px-10 md:pt-12">
      <Outlet />
    </div>
  );
}

/** Old Domains & QR addresses forward to the tool's new home, keeping any ?link=… query. */
export function MovedTo({ to }: { to: string }) {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}
