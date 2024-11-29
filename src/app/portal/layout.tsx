import React from 'react';
import { AuthProvider } from '../authPortal'; // Importa o contexto específico do portal

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
