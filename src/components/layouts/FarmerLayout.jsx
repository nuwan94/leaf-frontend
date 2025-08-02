import React from 'react';

export default function FarmerLayout({ children }) {
  return (
    <div className="min-h-screen bg-green-50 dark:bg-green-900">
      <header className="p-4 bg-green-700 text-white">Farmer Dashboard</header>
      <main className="p-6">{children}</main>
    </div>
  );
}

