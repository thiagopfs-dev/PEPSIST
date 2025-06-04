// Em: src/App.js

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'; // Removido useLocation se não usado
import Login from './components/Login';
import MainScreen from './components/MainScreen';
import CadastroScreen from './components/CadastroScreen';
import AtendimentoScreen from './components/AtendimentoScreen'; // 1. Importar AtendimentoScreen
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedLoginStatus = localStorage.getItem('isLoggedIn');
    return savedLoginStatus ? JSON.parse(savedLoginStatus) : false;
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || '';
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    localStorage.setItem('userName', userName);
  }, [isLoggedIn, userName]);

  const handleLoginSuccess = (username) => {
    setIsLoggedIn(true);
    setUserName(username);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="App">
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />
          }
        />
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? <MainScreen onLogout={handleLogout} userName={userName} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/dashboard/cadastro"
          element={
            isLoggedIn ? <CadastroScreen /> : <Navigate to="/login" />
          }
        />
        {/* 2. Nova Rota para Atendimento */}
        <Route
          path="/dashboard/atendimento"
          element={
            isLoggedIn ? <AtendimentoScreen /> : <Navigate to="/login" />
          }
        />
        {/* Adicione aqui outras rotas para os demais módulos */}
        <Route
          path="*"
          element={
            isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </div>
  );
}

export default App;