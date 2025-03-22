import React from 'react';  
import ReactDOM from 'react-dom/client';  
import { BrowserRouter } from 'react-router-dom';  
import App from './App';  
import 'bootstrap/dist/css/bootstrap.css';  
import './styles/globalStyles.css';  

// Register service worker  
if ('serviceWorker' in navigator) {  
  window.addEventListener('load', () => {  
    navigator.serviceWorker.register('/service-worker.js');  
  });  
}  

ReactDOM.createRoot(document.getElementById('root')).render(  
  <BrowserRouter>  
    <App />  
  </BrowserRouter>  
); 