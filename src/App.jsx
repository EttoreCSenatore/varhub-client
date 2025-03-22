import React from 'react';  
import { Routes, Route } from 'react-router-dom';  
import HomePage from './pages/HomePage.jsx';  
import LoginPage from './pages/LoginPage.jsx';  
import ProjectsPage from './pages/ProjectsPage.jsx'; 
import NavBar from './components/NavBar.jsx';
import QRScannerPage from './pages/QRScannerPage';
import VRViewerPage from './pages/VRViewerPage';
import Footer from './components/Footer';

function App() {  
  return (  
    <div className="app-container d-flex flex-column min-vh-100">
      <NavBar />  
      
      {/* Main content with padding for fixed navbar */}
      <main className="flex-grow-1 pt-5 mt-4">
        <Routes>  
          <Route path="/" element={<HomePage />} />  
          <Route path="/login" element={<LoginPage />} />  
          <Route path="/projects" element={<ProjectsPage />} />  
          <Route path="/scan" element={<QRScannerPage />} />
          <Route path="/vr-viewer" element={<VRViewerPage />} />
        </Routes>
      </main>
      
      <Footer />
    </div>  
  );  
}  

export default App;  