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
    // Get the current path without the leading slash
    const currentPath = window.location.pathname;
    
    // Use a more reliable approach with a direct link
    const linkElement = document.createElement('a');
    linkElement.href = `.${currentPath}`;
    linkElement.rel = 'noopener noreferrer';
    document.body.appendChild(linkElement);
    linkElement.click();
    
    // Clean up the element
    setTimeout(() => {
      try {
        document.body.removeChild(linkElement);
      } catch (e) {
        console.log('Element already removed');
      }
    }, 100);
    
    return () => {};
  }, []);
  
  return (
    <div className="text-center py-5">
      <p>Redirecting to WebXR sample...</p>
      <p>If you're not redirected automatically, <a href={`.${window.location.pathname}`}>click here</a> to open the sample.</p>
    </div>
  );
}

export default App;  