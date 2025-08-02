import React from 'react';
import CustomerLayout from '../components/layouts/CustomerLayout';

export default function CustomerHome() {
  return (
    <CustomerLayout>
      <h1 className="text-2xl font-bold mb-4">Welcome, Customer!</h1>
      <p>This is your customer dashboard home page.</p>
    </CustomerLayout>
  );
}

