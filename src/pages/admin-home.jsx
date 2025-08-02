import React from 'react';
import AdminLayout from '../components/layouts/AdminLayout';

export default function AdminHome() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Welcome, Admin!</h1>
      <p>This is your admin dashboard home page.</p>
    </AdminLayout>
  );
}

