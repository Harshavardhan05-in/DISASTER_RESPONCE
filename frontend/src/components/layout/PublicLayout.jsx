import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ToastContainer } from '../ui/ToastContainer';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-primary">
      <Navbar />
      <main className="flex-1 pt-18">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};
