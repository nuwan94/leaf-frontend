import React from 'react';
import DeliveryAgentLayout from '../components/layouts/DeliveryAgentLayout';

export default function DeliveryAgentHome() {
  return (
    <DeliveryAgentLayout>
      <h1 className="text-2xl font-bold mb-4">Welcome, Delivery Agent!</h1>
      <p>This is your delivery agent dashboard home page.</p>
    </DeliveryAgentLayout>
  );
}

