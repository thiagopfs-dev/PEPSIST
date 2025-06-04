import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AtendimentoScreen.css';
import RecepcaoPacientes from './RecepcaoPacientes';
import TriagemPacientes from './TriagemPacientes';
import ConsultaMedica from './ConsultaMedica'; // 1. Importar o novo componente

function AtendimentoScreen() {
  const navigate = useNavigate();
  const [activeSubModule, setActiveSubModule] = useState('recepcao'); // Pode manter 'recepcao' como padrão ou mudar

  const renderSubModuleContent = () => {
    switch (activeSubModule) {
      case 'recepcao':
        return <RecepcaoPacientes />;
      case 'triagem':
        return <TriagemPacientes />;
      case 'consulta_medica': // 2. Novo case para consulta médica
        return <ConsultaMedica />;
      default:
        return <RecepcaoPacientes />;
    }
  };

  return (
    <div className="atendimento-screen-wrapper">
      <header className="atendimento-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          &larr; Voltar para Módulos
        </button>
        <h1>Módulo de Atendimento</h1>
      </header>
      
      <nav className="atendimento-subnav">
        <button
          className={`tab-button ${activeSubModule === 'recepcao' ? 'active' : ''}`}
          onClick={() => setActiveSubModule('recepcao')}
        >
          Recepção
        </button>
        <button
          className={`tab-button ${activeSubModule === 'triagem' ? 'active' : ''}`}
          onClick={() => setActiveSubModule('triagem')}
        >
          Triagem
        </button>
        {/* 3. Novo botão para Consulta Médica */}
        <button
          className={`tab-button ${activeSubModule === 'consulta_medica' ? 'active' : ''}`}
          onClick={() => setActiveSubModule('consulta_medica')}
        >
          Consultório
        </button>
      </nav>
      <main className="atendimento-content-area">
        {renderSubModuleContent()}
      </main>
    </div>
  );
}

export default AtendimentoScreen;