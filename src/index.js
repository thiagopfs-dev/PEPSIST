import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Se você tiver estilos globais aqui
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // Importe o BrowserRouter

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Envolva o App com BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);