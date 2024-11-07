// src/components/InformativeModal.tsx
import React from 'react';
import Modal from 'react-modal';

interface InformativeModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function InformativeModal({
  isOpen,
  title,
  message,
  onClose,
}: InformativeModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white p-6 max-w-sm mx-auto rounded-lg shadow-lg w-full"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div>
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Ok
          </button>
        </div>
      </div>
    </Modal>
  );
}