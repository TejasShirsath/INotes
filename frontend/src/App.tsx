import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './App.css';
import Landing from './pages/landing';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  const { isAuthenticated, isLoading } = useAuth0();
  const [showLogin, setShowLogin] = useState(false);

  // Show loading spinner while Auth0 is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (isAuthenticated) {
    return <Dashboard />;
  }

  // If login page is requested, show login
  if (showLogin) {
    return <LoginPage onBack={() => setShowLogin(false)} />;
  }

  // Default: show landing page
  return <Landing onLoginClick={() => setShowLogin(true)} />;
}

export default App;
