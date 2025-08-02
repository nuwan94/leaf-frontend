import React from 'react';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="p-4 bg-blue-800 text-white">Admin Panel</header>
      <main className="p-6">{children}</main>
    </div>
  );
}

