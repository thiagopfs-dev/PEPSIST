import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './RecepcaoPacientes.css'; // Criaremos este CSS

function RecepcaoPacientes() {
  const [todosOsPacientes, setTodosOsPacientes] = useState([]);
  const [pacientesEmEspera, setPacientesEmEspera] = useState(() => {
    const savedEspera = localStorage.getItem('erpPacientesEmEspera');
    return savedEspera ? JSON.parse(savedEspera) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [tipoAtendimento, setTipoAtendimento] = useState('');
  const [profissional, setProfissional] = useState(''); // Opcional

  const navigate = useNavigate();

  // Carregar todos os pacientes cadastrados (do localStorage de PacientesCadastro)
  useEffect(() => {
    const cadastrados = localStorage.getItem('erpPacientes');
    if (cadastrados) {
      setTodosOsPacientes(JSON.parse(cadastrados).filter(p => p.status === 'Ativo')); // Filtra apenas ativos
    }
  }, []); // Roda uma vez ao montar

  // Salvar pacientes em espera no localStorage
  useEffect(() => {
    localStorage.setItem('erpPacientesEmEspera', JSON.stringify(pacientesEmEspera));
  }, [pacientesEmEspera]);

  const formatCPFDisplay = (cpf) => {
    if (!cpf) return '';
    const digits = cpf.replace(/\D/g, '').substring(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.substring(0, 3)}.${digits.substring(3)}`;
    if (digits.length <= 9) return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6)}`;
    return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9)}`;
  };

  const filteredPacientesCadastrados = todosOsPacientes.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    const cpfLimpo = p.cpf ? p.cpf.replace(/\D/g, '') : '';
    return (
      p.nomeCompleto.toLowerCase().includes(searchLower) ||
      cpfLimpo.includes(searchLower) ||
      formatCPFDisplay(p.cpf).includes(searchLower)
    );
  }).slice(0, 10); // Limitar a 10 resultados para não poluir a tela

  const handleSelectPacienteParaCheckin = (paciente) => {
    // Verificar se o paciente já está na fila de espera
    if (pacientesEmEspera.some(pEspera => pEspera.pacienteId === paciente.id && pEspera.status !== 'Atendido')) {
        alert(`${paciente.nomeCompleto} já está na fila de espera ou em atendimento.`);
        return;
    }
    setPacienteSelecionado(paciente);
    setTipoAtendimento(''); // Resetar campos do modal
    setProfissional('');
    setShowCheckinModal(true);
  };

  const handleConfirmCheckin = () => {
    if (!pacienteSelecionado || !tipoAtendimento) {
      alert('Por favor, selecione um paciente e preencha o tipo de atendimento.');
      return;
    }
    const novoCheckin = {
      idEspera: uuidv4(),
      pacienteId: pacienteSelecionado.id,
      nomeCompleto: pacienteSelecionado.nomeCompleto,
      cpf: pacienteSelecionado.cpf,
      horaChegada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      dataChegada: new Date().toLocaleDateString('pt-BR'),
      tipoAtendimento: tipoAtendimento,
      profissional: profissional, // Pode ser opcional
      status: 'Aguardando Atendimento', // Outros status: Em Atendimento, Atendido, Cancelado
    };
    setPacientesEmEspera([...pacientesEmEspera, novoCheckin]);
    setShowCheckinModal(false);
    setPacienteSelecionado(null);
    setSearchTerm(''); // Limpa a busca após check-in
  };

  // Função para simular o chamado do paciente (apenas muda o status)
  const handleChamarPaciente = (idEspera) => {
    setPacientesEmEspera(pacientesEmEspera.map(p =>
        p.idEspera === idEspera ? { ...p, status: 'Em Atendimento', horaChamada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) } : p
    ));
  };

  // Função para finalizar o atendimento
  const handleFinalizarAtendimento = (idEspera) => {
     setPacientesEmEspera(pacientesEmEspera.map(p =>
        p.idEspera === idEspera ? { ...p, status: 'Atendido', horaFim: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) } : p
    ));
  }
  // Poderia ter uma função para remover da fila principal após X tempo ou mover para um histórico.

  return (
    <div className="recepcao-pacientes-container">
      <div className="secao-busca-paciente">
        <h4>Buscar Paciente Cadastrado</h4>
        <div className="busca-actions">
            <input
            type="text"
            placeholder="Digite nome ou CPF do paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-recepcao"
            />
            <button 
                onClick={() => navigate('/dashboard/cadastro', { state: { activeSubModule: 'pacientes' } })} 
                className="btn-novo-paciente-recepcao"
            >
            + Novo Paciente
            </button>
        </div>
        {searchTerm && filteredPacientesCadastrados.length > 0 && (
          <ul className="lista-resultados-busca">
            {filteredPacientesCadastrados.map((p) => (
              <li key={p.id}>
                <span>{p.nomeCompleto} (CPF: {formatCPFDisplay(p.cpf)})</span>
                <button onClick={() => handleSelectPacienteParaCheckin(p)} className="btn-checkin">
                  Registrar Chegada
                </button>
              </li>
            ))}
          </ul>
        )}
        {searchTerm && filteredPacientesCadastrados.length === 0 && (
            <p className="info-message">Nenhum paciente encontrado com este termo. Verifique o cadastro ou adicione um novo paciente.</p>
        )}
      </div>

      <div className="secao-fila-espera">
        <h4>Pacientes em Espera / Atendimento</h4>
        {pacientesEmEspera.length > 0 ? (
          <table className="tabela-fila-espera">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Chegada</th>
                <th>Tipo Atend.</th>
                <th>Profissional</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pacientesEmEspera.filter(p => p.status !== 'Atendido').sort((a,b) => new Date('1970/01/01 ' + a.horaChegada) - new Date('1970/01/01 ' + b.horaChegada)).map((p) => ( // Ordena por hora de chegada
                <tr key={p.idEspera} className={`status-fila-${p.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  <td>{p.nomeCompleto}</td>
                  <td>{p.horaChegada}</td>
                  <td>{p.tipoAtendimento}</td>
                  <td>{p.profissional || 'N/A'}</td>
                  <td>{p.status}</td>
                  <td>
                    {p.status === 'Aguardando Atendimento' && (
                      <button onClick={() => handleChamarPaciente(p.idEspera)} className="btn-action-fila btn-chamar">Chamar</button>
                    )}
                    {p.status === 'Em Atendimento' && (
                      <button onClick={() => handleFinalizarAtendimento(p.idEspera)} className="btn-action-fila btn-finalizar">Finalizar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="info-message">Nenhum paciente aguardando atendimento no momento.</p>
        )}
      </div>

      {showCheckinModal && pacienteSelecionado && (
        <div className="modal-backdrop-recepcao">
          <div className="modal-checkin">
            <h4>Confirmar Chegada: {pacienteSelecionado.nomeCompleto}</h4>
            <div className="form-group-modal">
              <label htmlFor="tipoAtendimento">Tipo de Atendimento*</label>
              <input
                type="text"
                id="tipoAtendimento"
                value={tipoAtendimento}
                onChange={(e) => setTipoAtendimento(e.target.value)}
                placeholder="Ex: Consulta, Exame, Retorno"
                required
              />
            </div>
            <div className="form-group-modal">
              <label htmlFor="profissional">Profissional (opcional)</label>
              <input
                type="text"
                id="profissional"
                value={profissional}
                onChange={(e) => setProfissional(e.target.value)}
                placeholder="Nome do médico/profissional"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleConfirmCheckin} className="btn-confirmar-checkin">Confirmar Chegada</button>
              <button onClick={() => setShowCheckinModal(false)} className="btn-cancelar-modal">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecepcaoPacientes;