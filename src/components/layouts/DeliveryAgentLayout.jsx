import React from 'react';

export default function DeliveryAgentLayout({ children }) {
  return (
    <div className="min-h-screen bg-blue-50 dark:bg-blue-900">
      <header className="p-4 bg-blue-700 text-white">Delivery Agent Dashboard</header>
      <main className="p-6">{children}</main>
    </div>
  );
}

