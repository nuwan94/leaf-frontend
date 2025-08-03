import React from 'react';
import TopNavLayout from '@/components/layouts/TopNavLayout';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const Layout = user.role === 'farmer' || user.role === 'delivery-agent' ? SidebarLayout : TopNavLayout;

  return (
    <Layout role={user.role} title="Profile">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Name:</h2>
              <p>{user.name || 'N/A'}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Email:</h2>
              <p>{user.email || 'N/A'}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Role:</h2>
              <p>{user.role || 'N/A'}</p>
            </div>
          </div>
          <Button
            className="mt-6 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
          >
            Logout
          </Button>
        </Card>
      </div>
    </Layout>
  );
}
