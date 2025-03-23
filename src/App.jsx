import React from 'react';  
import { Routes, Route } from 'react-router-dom';  
import HomePage from './pages/HomePage.jsx';  
import ProjectsPage from './pages/ProjectsPage.jsx'; 
import NavBar from './components/NavBar.jsx';
import QRScannerPage from './pages/QRScannerPage';
import VRViewerPage from './pages/VRViewerPage';
import ARViewerPage from './pages/ARViewerPage';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import NotFoundPage from './pages/NotFoundPage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {  
  const { loading } = useAuth();

  // Don't render anything while checking authentication status
  if (loading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  return (  
    <div className="app-container d-flex flex-column min-vh-100">
      <NavBar />  
      
      {/* Main content with padding for fixed navbar */}
      <main className="flex-grow-1 pt-5 mt-4 px-2">
        <Routes>  
          <Route path="/" element={<HomePage />} />  
          <Route 
            path="/projects" 
            element={
              <PrivateRoute>
                <ProjectsPage />
              </PrivateRoute>
            } 
          />  
          <Route 
            path="/scan" 
            element={
              <PrivateRoute>
                <QRScannerPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/vr-viewer/:projectId?" 
            element={
              <PrivateRoute>
                <ErrorBoundary>
                  <VRViewerPage />
                </ErrorBoundary>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/ar-viewer/:projectId?" 
            element={
              <PrivateRoute>
                <ARViewerPage />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      <Footer />
    </div>  
  );  
}  

export default App;  