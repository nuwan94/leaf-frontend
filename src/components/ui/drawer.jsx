import * as React from 'react';
import { cn } from '@/lib/utils';

export function Drawer({ open, onOpenChange, side = 'right', children, className = '' }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex',
        open ? 'pointer-events-auto' : 'pointer-events-none',
        className
      )}
      aria-modal="true"
      role="dialog"
      style={{ display: open ? 'flex' : 'none' }}
    >
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => onOpenChange(false)}
      />
      {/* Drawer panel */}
      <div
        className={cn(
          'fixed bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 ease-in-out',
          // Responsive width: full on mobile, max-w-lg on md+
          side === 'right' && 'top-0 right-0 h-full w-full md:max-w-3xl',
          side === 'left' && 'top-0 left-0 h-full w-full md:max-w-3xl',
          side === 'bottom' && 'bottom-0 left-0 w-full max-h-[90vh]',
          side === 'top' && 'top-0 left-0 w-full max-h-[90vh]',
          open
            ? 'translate-x-0 translate-y-0'
            : side === 'right'
            ? 'translate-x-full'
            : side === 'left'
            ? '-translate-x-full'
            : side === 'bottom'
            ? 'translate-y-full'
            : '-translate-y-full',
          // Make sure on mobile the drawer covers the whole screen
          'md:rounded-l-xl md:rounded-r-none md:rounded-t-none md:rounded-b-none',
          ''
        )}
        tabIndex={-1}
        style={{
          width: side === 'right' || side === 'left' ? '100vw' : undefined,
          maxWidth: side === 'right' || side === 'left' ? undefined : '100vw',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function DrawerHeader({ children, className = '' }) {
  return <div className={cn('p-6 border-b', className)}>{children}</div>;
}

export function DrawerBody({ children, className = '' }) {
  return <div className={cn('p-6 flex-1 overflow-y-auto', className)}>{children}</div>;
}

export function DrawerFooter({ children, className = '' }) {
  return <div className={cn('p-6 border-t flex justify-end gap-2', className)}>{children}</div>;
}
