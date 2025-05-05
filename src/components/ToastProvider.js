import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        success: {
          style: {
            background: '#4CAF50',
            color: 'white',
          },
        },
        error: {
          style: {
            background: '#F44336',
            color: 'white',
          },
        },
        duration: 3000,
      }}
    />
  );
}
