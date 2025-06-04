import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroScreen.css';
import FuncionariosCadastro from './FuncionariosCadastro';
import PacientesCadastro from './PacientesCadastro'; // Importar o novo componente

function CadastroScreen() {
  const [activeSubModule, setActiveSubModule] = useState('pacientes'); // Iniciar com pacientes ativo
  const navigate = useNavigate();

  const renderSubModuleContent = () => {
    switch (activeSubModule) {
      case 'pacientes':
        return <PacientesCadastro />; // Renderizar o componente aqui
      case 'funcionarios':
        return <FuncionariosCadastro />;
      case 'planos':
        return <div>Conteúdo do Cadastro de Planos de Saúde (a ser implementado)</div>;
      case 'sadt':
        return <div>Conteúdo do Cadastro de SADT (a ser implementado)</div>;
      default:
        return <div>Selecione uma categoria de cadastro.</div>;
    }
  };

  return (
    <div className="cadastro-screen-wrapper">
      <header className="cadastro-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          &larr; Voltar para Módulos
        </button>
        <h1>Módulo de Cadastro</h1>
      </header>
      <nav className="cadastro-subnav">
        <button
          className={activeSubModule === 'pacientes' ? 'active' : ''}
          onClick={() => setActiveSubModule('pacientes')}
        >
          Pacientes
        </button>
        <button
          className={activeSubModule === 'funcionarios' ? 'active' : ''}
          onClick={() => setActiveSubModule('funcionarios')}
        >
          Funcionários
        </button>
        <button
          className={activeSubModule === 'planos' ? 'active' : ''}
          onClick={() => setActiveSubModule('planos')}
        >
          Planos
        </button>
        <button
          className={activeSubModule === 'sadt' ? 'active' : ''}
          onClick={() => setActiveSubModule('sadt')}
        >
          SADT
        </button>
      </nav>
      <main className="cadastro-content">
        {renderSubModuleContent()}
      </main>
    </div>
  );
}

export default CadastroScreen;