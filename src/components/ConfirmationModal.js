"use client";

import { useState } from 'react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      background: 'bg-[#93233B] hover:bg-[#7a1c30]',
      text: 'text-white'
    },
    warning: {
      background: 'bg-yellow-600 hover:bg-yellow-700',
      text: 'text-white'
    },
    neutral: {
      background: 'bg-gray-600 hover:bg-gray-700',
      text: 'text-white'
    }
  };

  const { background, text } = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1e1e1e] rounded-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
        <p className="mb-6 text-gray-300">{message}</p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`px-4 py-2 ${background} ${text} rounded transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
