// src/app/portal/Cliente/create/page.tsx
"use client";

import React, { useState } from 'react';
import { ClienteEditForm } from '@/app/portal/Cliente/edit/clienteedit';
import { SnackbarState } from '@/models/snackbarState';

export default function CreateClientePage() {
    const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  const handleSnackbarClose = () => {
    setSnackbar(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <ClienteEditForm   />
      {snackbar && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded-md shadow-md ${
            snackbar.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          <p>{snackbar.message}</p>
          <button onClick={handleSnackbarClose} className="text-sm underline mt-2">
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}
