// src/app/portal/Cliente/create/page.tsx
"use client";

import React, { useState } from 'react';
import { ClienteCreateForm } from '@/app/portal/Cliente/create/clientecreate';
import { SnackbarState } from '@/models/snackbarState';
import axios from "axios";
import { Cliente } from '@/models/cliente';

export default function CreateClientePage() {
    const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const handleSave =async  (newClient: Cliente) => {
    try {
        // Save the new client via API
        const response = await axios.post("/api/Cliente", newClient);
  
        // Handle successful save
        setSnackbar(new SnackbarState("Cliente salvo com sucesso!", "success", true));
        console.log("Saved Client:", response.data);
  
        // Optionally, redirect or reset the form
      } catch (error) {
        // Handle errors
        console.error("Error saving client:", error);
        setSnackbar(new SnackbarState("Erro ao salvar cliente!", "error", true));
      }
  };

  const handleClose = () => {
    setSnackbar(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <ClienteCreateForm onSave={handleSave} onClose={handleClose} setSnackbar={setSnackbar} />
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
