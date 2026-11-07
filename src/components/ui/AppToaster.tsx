import React from 'react';
import { Toaster } from 'sonner';
import { useDirection } from '../../contexts/DirectionContext';

export function AppToaster() {
  const direction = useDirection();
  return (
    <Toaster
      theme={direction === 'darkStudio' ? 'dark' : 'light'}
      position="bottom-center"
      offset={88}
      gap={8}
      toastOptions={{
        duration: 4500,
        style: {
          background: 'rgb(var(--overlay))',
          color: 'rgb(var(--text-primary))',
          border: '1px solid rgb(var(--border-subtle))',
          borderRadius: '10px',
          boxShadow: 'var(--shadow-3)',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '13px',
        },
        actionButtonStyle: {
          background: 'rgb(var(--action))',
          color: 'rgb(var(--on-action))',
          borderRadius: '6px',
          fontWeight: 600,
        },
      }}
    />
  );
}
