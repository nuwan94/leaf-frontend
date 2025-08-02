import React from 'react';
import UserLayout from '../components/layouts/UserLayout';

export default function UserHome() {
  return (
    <UserLayout>
      <h1 className="text-2xl font-bold mb-4">Welcome, User!</h1>
      <p>This is your user dashboard home page.</p>
    </UserLayout>
  );
}

