// Em: src/components/MainScreen.js

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import './MainScreen.css';

const initialModulesData = [
  { id: 'module-1-pacientes', name: 'Pacientes', icon: '🧑‍⚕️', isFavorite: false, path: '/dashboard/pacientes' },
  { id: 'module-2-agendamentos', name: 'Agendamentos', icon: '📅', isFavorite: false, path: '/dashboard/agendamentos' },
  { id: 'module-3-internacoes', name: 'Internações', icon: '🏥', isFavorite: false, path: '/dashboard/internacoes' },
  { id: 'module-4-prontuarios', name: 'Prontuários', icon: '📋', isFavorite: false, path: '/dashboard/prontuarios' },
  { id: 'module-5-faturamento', name: 'Faturamento', icon: '🧾', isFavorite: false, path: '/dashboard/faturamento' },
  { id: 'module-6-relatorios', name: 'Relatórios', icon: '📊', isFavorite: false, path: '/dashboard/relatorios' },
  { id: 'module-7-farmacia', name: 'Farmácia', icon: '💊', isFavorite: false, path: '/dashboard/farmacia' },
  { id: 'module-8-configuracoes', name: 'Configurações', icon: '⚙️', isFavorite: false, path: '/dashboard/configuracoes' },
  { id: 'module-9-cadastro', name: 'Cadastro', icon: '📝', isFavorite: false, path: '/dashboard/cadastro' },
  // Novo módulo de Atendimento
  { id: 'module-10-atendimento', name: 'Atendimento', icon: '🎧', isFavorite: false, path: '/dashboard/atendimento' },
];


function MainScreen({ onLogout, userName }) {
  const [modules, setModules] = useState(() => {
    const savedModules = localStorage.getItem('erpModulesPEP');
    if (savedModules) {
      try {
        const parsedSavedModules = JSON.parse(savedModules);
        // Mapear sobre initialModulesData para garantir que todos os módulos definidos no código existam,
        // e aplicar o estado salvo (isFavorite, e implicitamente a ordem se parsedSavedModules for usado como base depois)
        // Esta abordagem garante que novos módulos adicionados ao código apareçam,
        // e módulos removidos do código não apareçam mais, mesmo que estivessem no localStorage.
        const currentModules = initialModulesData.map(initialModule => {
          const savedModuleState = parsedSavedModules.find(sm => sm.id === initialModule.id);
          return {
            ...initialModule, // Padrões do código (nome, ícone, path)
            isFavorite: savedModuleState ? savedModuleState.isFavorite : (initialModule.isFavorite || false),
            // A ordem será determinada pela ordem de parsedSavedModules se ela for usada para popular o estado final.
            // Se não, a ordem de initialModulesData prevalecerá para novos módulos.
          };
        });

        // Reordenar currentModules baseado na ordem que estava em parsedSavedModules, se possível.
        // Isso preserva a ordem de arrastar e soltar do usuário.
        const orderedModules = parsedSavedModules
          .map(savedModule => currentModules.find(cm => cm.id === savedModule.id))
          .filter(Boolean); // Filtra undefined se um módulo salvo não existir mais em initialModulesData

        // Adicionar quaisquer novos módulos de initialModulesData que não estavam na lista salva
        initialModulesData.forEach(initialModule => {
          if (!orderedModules.some(om => om.id === initialModule.id)) {
            orderedModules.push(initialModule); // Adiciona novos módulos no final
          }
        });
        return orderedModules;

      } catch (error) {
        console.error("Erro ao carregar ou mesclar módulos do localStorage:", error);
        return initialModulesData.map(m => ({ ...m, id: m.id || uuidv4(), isFavorite: m.isFavorite || false }));
      }
    }
    return initialModulesData.map(m => ({ ...m, id: m.id || uuidv4(), isFavorite: m.isFavorite || false }));
  });

  const [currentView, setCurrentView] = useState('favorites');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('erpModulesPEP', JSON.stringify(modules));
  }, [modules]);

  const handleToggleFavorite = (moduleId, event) => {
    event.stopPropagation();
    event.preventDefault();
    setModules(
      modules.map((module) =>
        module.id === moduleId
          ? { ...module, isFavorite: !module.isFavorite }
          : module
      )
    );
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    if (currentView !== 'all') return;

    const items = Array.from(modules);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);
    setModules(items);
  };
  
  const handleModuleClick = (path) => {
    if (path) {
      navigate(path);
    } else {
      console.warn("Caminho (path) não definido para este módulo.");
    }
  };

  const displayedModules =
    currentView === 'favorites'
      ? modules.filter((module) => module.isFavorite)
      : modules;
  
  // O JSX do retorno continua o mesmo
  return (
    <div className="main-screen-wrapper">
      <header className="main-header">
        <div className="erp-logo-main">
          PEP<span className="erp-logo-plus-main">+</span>
          <span className="erp-subtitle-main">sistemas hospitalares</span>
        </div>
        <div className="user-info">
          <span>Bem-vindo(a), {userName || 'Usuário'}!</span>
          <button onClick={onLogout} className="logout-button">
            Sair 🚪
          </button>
        </div>
      </header>

      <nav className="view-tabs">
        <button
          className={`tab-button ${currentView === 'all' ? 'active' : ''}`}
          onClick={() => setCurrentView('all')}
        >
          Todos os Módulos
        </button>
        <button
          className={`tab-button ${currentView === 'favorites' ? 'active' : ''}`}
          onClick={() => setCurrentView('favorites')}
        >
          Favoritos ({modules.filter(m => m.isFavorite).length})
        </button>
      </nav>

      <main className="modules-container">
        <h2>
          {currentView === 'all' ? 'Módulos do Sistema' : 'Módulos Favoritos'}
        </h2>
        {(displayedModules.length === 0 && currentView === 'all' && modules.length > 0 ) && (
             <p className="empty-favorites-message">Nenhum módulo corresponde à visualização atual.</p>
        )}
         {(modules.length === 0 && currentView === 'all' ) && (
             <p className="empty-favorites-message">Não há módulos cadastrados no sistema.</p>
        )}
        {(displayedModules.length === 0 && currentView === 'favorites') ? (
          <p className="empty-favorites-message">Você ainda não marcou nenhum módulo como favorito. Clique na estrela ☆ de um módulo para adicioná-lo aqui!</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="moduleListDroppable" direction="horizontal">
              {(providedDroppable, snapshotDroppable) => (
                <div
                  className={`modules-grid ${snapshotDroppable.isDraggingOver ? 'dragging-over' : ''}`}
                  ref={providedDroppable.innerRef}
                  {...providedDroppable.droppableProps}
                >
                  {displayedModules.map((module, index) => (
                    <Draggable
                        key={module.id}
                        draggableId={module.id.toString()}
                        index={index}
                        isDragDisabled={currentView !== 'all'}
                    >
                      {(providedDraggable, snapshotDraggable) => (
                        <div
                          className={`module-card ${snapshotDraggable.isDragging ? 'dragging' : ''}`}
                          ref={providedDraggable.innerRef}
                          {...providedDraggable.draggableProps}
                          {...providedDraggable.dragHandleProps}
                          style={{ ...providedDraggable.draggableProps.style }}
                          onClick={() => handleModuleClick(module.path)}
                          role="link" 
                          tabIndex={0} 
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleModuleClick(module.path)}}
                        >
                          <button
                            className="favorite-button"
                            onClick={(event) => handleToggleFavorite(module.id, event)}
                            title={module.isFavorite ? "Desfavoritar" : "Favoritar"}
                          >
                            {module.isFavorite ? '★' : '☆'}
                          </button>
                          <div className="module-icon">{module.icon}</div>
                          <h3 className="module-name">{module.name}</h3>
                          <p>Acessar módulo de {module.name.toLowerCase()}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {providedDroppable.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </main>
      <footer className="main-footer">
        © {new Date().getFullYear()} PEP+ Sistemas Hospitalares.
      </footer>
    </div>
  );
}

export default MainScreen;