import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function getUser() {
  const user = JSON.parse(localStorage.getItem('user'));
  return user;
}

export default function ProtectedRoute() {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

