import React from 'react';
import FarmerLayout from '../components/layouts/FarmerLayout';

export default function FarmerHome() {
  return (
    <FarmerLayout>
      <h1 className="text-2xl font-bold mb-4">Welcome, Farmer!</h1>
      <p>This is your farmer dashboard home page.</p>
    </FarmerLayout>
  );
}

