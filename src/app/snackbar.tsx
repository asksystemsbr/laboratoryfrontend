//src/app/snackbar.tsx
import React  from 'react';

interface SnackbarProps {
  message: string;
  type: 'success' | 'error';
  progress: number;
  onClose: () => void;
}

export const Snackbar = ({ message, type, progress,onClose  }: SnackbarProps) => {
  return (
    <div
      className={`fixed top-5 right-5 p-4 mb-4 text-white rounded-md shadow-lg ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      }`}
      style={{ width: '300px', zIndex: 9999 }}
    >
      <p>{message}</p>
      <div className="relative w-full h-1 mt-2 bg-gray-300">
        <div
          className="absolute left-0 top-0 h-full bg-white"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <button
             onClick={onClose} // Chama a função `onClose` ao clicar
            className="text-sm underline focus:outline-none"
          >
            Fechar
      </button>      
    </div>
  );
};  