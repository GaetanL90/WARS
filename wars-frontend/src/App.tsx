import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppRoutes from './routes/AppRoutes';
import { seedMockCases } from './utils/mockData';
import './i18n/config';

function App() {
  // Seed mock cases on app initialization
  useEffect(() => {
    seedMockCases();
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

