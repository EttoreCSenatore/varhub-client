import React from 'react';  
import { Routes, Route } from 'react-router-dom';  
import HomePage from './pages/HomePage.jsx';  
import ProjectsPage from './pages/ProjectsPage.jsx'; 
import QRScannerPage from './pages/QRScannerPage.jsx';
import NavBar from './components/NavBar';  
import Footer from './components/Footer';  
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';

function App() {  
  const { currentUser } = useAuth();
  
  return (  
    <div className="app-container d-flex flex-column min-vh-100">
      <NavBar />  
      <main className="flex-grow-1">  
        <div className="container py-4">  
          <Routes>  
            <Route path="/" element={<HomePage />} />  
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/projects" 
              element={
                <PrivateRoute>
                  <ProjectsPage /> 
                </PrivateRoute>
              } 
            />
            <Route path="/scan" element={<QRScannerPage />} />
            <Route path="/webxr-samples-main/*" element={<WebXRSampleRedirect />} />
          </Routes>  
        </div>  
      </main>  
      <Footer />
    </div>  
  );  
}

// Component to handle redirects to WebXR samples
function WebXRSampleRedirect() {
  React.useEffect(() => {
    // Get the path from URL and remove any additional /webxr-samples-main/ prefixes
    const path = window.location.pathname;
    
    // Extract just the filename from the path
    const filename = path.split('/').pop();
    
    // Redirect directly to the file
    window.location = `webxr-samples-main/${filename}`;
    
    return () => {};
  }, []);
  
  return (
    <div className="text-center py-5">
      <p>Redirecting to WebXR sample...</p>
    </div>
  );
}

export default App;  