import React from 'react';  
import ReactDOM from 'react-dom/client';  
import { BrowserRouter } from 'react-router-dom';  
import App from './App.jsx';  
import './index.css';  
import 'bootstrap/dist/css/bootstrap.min.css';  
import './GlobalStyles.css';  
import { AuthProvider } from './context/AuthContext';  

// Register service worker  
if ('serviceWorker' in navigator) {  
  window.addEventListener('load', () => {  
    navigator.serviceWorker.register('/service-worker.js');  
  });  
}  

ReactDOM.createRoot(document.getElementById('root')).render(  
  <React.StrictMode>  
    <BrowserRouter>  
      <AuthProvider>  
        <App />  
      </AuthProvider>  
    </BrowserRouter>  
  </React.StrictMode>  
); 