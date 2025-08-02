import React from 'react';

export default function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen bg-yellow-50 dark:bg-yellow-900">
      <header className="p-4 bg-yellow-600 text-white">Customer Dashboard</header>
      <main className="p-6">{children}</main>
    </div>
  );
}

