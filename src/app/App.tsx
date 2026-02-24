import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { initializeNotifications } from './utils/notifications';
import { checkAndGenerateRecurringTransactions } from './utils/recurring';
import { initializeDemoData } from './utils/storage';

export default function App() {
  useEffect(() => {
    initializeDemoData();
    checkAndGenerateRecurringTransactions();
    initializeNotifications();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}
