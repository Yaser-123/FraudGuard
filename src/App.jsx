import { useState, useEffect } from 'react';
import ComplaintForm from './ComplaintForm';
import AdminAuth from './AdminAuth';
import LandingPage from './LandingPage';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'form', or 'admin'

  // Check URL parameters for admin access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setCurrentView('admin');
    } else if (urlParams.get('form') === 'true') {
      setCurrentView('form');
    }
  }, []);

  // Update URL when view changes
  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState({}, '', '?admin=true');
    } else if (view === 'form') {
      window.history.pushState({}, '', '?form=true');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'form':
        return <ComplaintForm onNavigateHome={() => handleViewChange('landing')} />;
      case 'admin':
        return <AdminAuth onNavigateHome={() => handleViewChange('landing')} />;
      default:
        return <LandingPage onNavigate={handleViewChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {renderCurrentView()}
    </div>
  );
}

export default App;
