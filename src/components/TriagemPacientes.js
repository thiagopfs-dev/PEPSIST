// src/components/TriagemPacientes.js

import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Descomente se precisar de navegação
import './TriagemPacientes.css';

// Dados de exemplo para pacientes aguardando triagem
const initialTriagemQueue = [
  {
    idEspera: 'triagem-exemplo-1', // ID único para este item na fila de triagem
    pacienteId: 'paciente-id-abc', // ID do paciente (do cadastro geral de pacientes)
    nomeCompleto: 'Carlos Alberto Nóbrega',
    cpf: '123.456.789-00', // Exemplo, pode ser formatado ou não dependendo da origem
    horaChegada: '08:30',
    dataChegada: new Date().toLocaleDateString('pt-BR'),
    tipoAtendimento: 'Consulta Clínica Geral',
    profissional: 'Dr. House', // Profissional da recepção ou preferência
    status: 'Aguardando Atendimento', // Status que indica que está aguardando triagem
    // Não incluiria 'dadosTriagem' aqui, pois é o que será preenchido
  },
  {
    idEspera: 'triagem-exemplo-2',
    pacienteId: 'paciente-id-def',
    nomeCompleto: 'Joana Dark Silva',
    cpf: '987.654.321-00',
    horaChegada: '08:45',
    dataChegada: new Date().toLocaleDateString('pt-BR'),
    tipoAtendimento: 'Curativo',
    profissional: '',
    status: 'Em Atendimento', // Outro status que a triagem pode pegar
  },
];


function TriagemPacientes() {
  const [pacientesEmEspera, setPacientesEmEspera] = useState(() => {
    const savedEspera = localStorage.getItem('erpPacientesEmEspera');
    // Se localStorage estiver vazio, usa os dados de exemplo. Senão, usa os dados salvos.
    return savedEspera ? JSON.parse(savedEspera) : initialTriagemQueue;
  });

  const [pacienteEmTriagem, setPacienteEmTriagem] = useState(null);
  const [showTriageModal, setShowTriageModal] = useState(false);

  const [triageFormData, setTriageFormData] = useState({
    pressaoArterial: '', temperatura: '', frequenciaCardiaca: '',
    frequenciaRespiratoria: '', saturacaoOxigenio: '', nivelDor: '0',
    queixaPrincipal: '', alergiasConhecidas: '', observacoesTriagem: '',
    classificacaoRisco: 'Não Urgente',
  });

  // Carregar pacientes da fila de espera (do localStorage) na montagem inicial
  // Efeito para recarregar do localStorage se outro componente (como Recepcao) o modificar.
  // Isso é um pouco rudimentar; uma gestão de estado global (Context API, Redux) seria melhor para sincronização.
  useEffect(() => {
    const handleStorageChange = () => {
        const savedEspera = localStorage.getItem('erpPacientesEmEspera');
        // Se o localStorage estiver vazio APÓS uma mudança, e não temos dados iniciais aqui,
        // podemos optar por não usar initialTriagemQueue para não sobrescrever um "limpar" da recepção.
        // Mas para o exemplo, vamos recarregar ou usar o inicial.
        const dataToLoad = savedEspera ? JSON.parse(savedEspera) : initialTriagemQueue;
        // Apenas atualiza se os dados realmente mudaram para evitar loops
        if (JSON.stringify(dataToLoad) !== JSON.stringify(pacientesEmEspera)) {
            setPacientesEmEspera(dataToLoad);
        }
    };

    // Tenta carregar na montagem inicial (já feito no useState)
    // window.addEventListener('storage', handleStorageChange); // Ouve mudanças no localStorage de outras abas/janelas

    // Para simular atualização se outro componente na MESMA aba mudar o localStorage:
    // Poderíamos ter um "gatilho" ou um intervalo, mas é complexo sem estado global.
    // Por agora, o carregamento inicial do useState já ajuda a ter exemplos.
    // Se a Recepção limpar o localStorage, a Triagem só verá isso no próximo reload ou se implementarmos um listener mais complexo.

    return () => {
    //   window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Removido pacientesEmEspera daqui para não causar loop com o useEffect abaixo.

  // Salvar alterações na lista de espera
  useEffect(() => {
    localStorage.setItem('erpPacientesEmEspera', JSON.stringify(pacientesEmEspera));
  }, [pacientesEmEspera]);


  const handleOpenTriageModal = (pacienteDaFila) => {
    setPacienteEmTriagem(pacienteDaFila);
    // Tenta carregar alergias do cadastro principal do paciente, se disponível
    let alergiasSalvas = '';
    const todosPacientesCadastrados = JSON.parse(localStorage.getItem('erpPacientes') || '[]');
    const pacienteCadastrado = todosPacientesCadastrados.find(p => p.id === pacienteDaFila.pacienteId);
    if (pacienteCadastrado && pacienteCadastrado.alergias) {
        alergiasSalvas = pacienteCadastrado.alergias;
    }

    setTriageFormData({
      pressaoArterial: pacienteDaFila.dadosTriagem?.pressaoArterial || '',
      temperatura: pacienteDaFila.dadosTriagem?.temperatura || '',
      frequenciaCardiaca: pacienteDaFila.dadosTriagem?.frequenciaCardiaca || '',
      frequenciaRespiratoria: pacienteDaFila.dadosTriagem?.frequenciaRespiratoria || '',
      saturacaoOxigenio: pacienteDaFila.dadosTriagem?.saturacaoOxigenio || '',
      nivelDor: pacienteDaFila.dadosTriagem?.nivelDor || '0',
      queixaPrincipal: pacienteDaFila.dadosTriagem?.queixaPrincipal || '',
      alergiasConhecidas: pacienteDaFila.dadosTriagem?.alergiasConhecidas || alergiasSalvas,
      observacoesTriagem: pacienteDaFila.dadosTriagem?.observacoesTriagem || '',
      classificacaoRisco: pacienteDaFila.dadosTriagem?.classificacaoRisco || 'Não Urgente',
    });
    setShowTriageModal(true);
  };

  const handleCloseTriageModal = () => {
    setShowTriageModal(false);
    setPacienteEmTriagem(null);
  };

  const handleTriageInputChange = (e) => {
    const { name, value } = e.target;
    setTriageFormData({ ...triageFormData, [name]: value });
  };

  const handleSaveTriage = () => {
    if (!pacienteEmTriagem || !triageFormData.queixaPrincipal) {
      alert('A queixa principal é obrigatória para salvar a triagem.');
      return;
    }

    const triagemRealizada = {
      ...pacienteEmTriagem,
      dadosTriagem: { ...triageFormData }, // Salva todos os dados do formulário de triagem
      status: 'Aguardando Consulta', // Define novo status após triagem
      horaTriagem: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setPacientesEmEspera(
      pacientesEmEspera.map((p) =>
        p.idEspera === pacienteEmTriagem.idEspera ? triagemRealizada : p
      )
    );
    handleCloseTriageModal();
  };

  // Filtra pacientes que efetivamente precisam de triagem
  const pacientesParaTriagem = pacientesEmEspera.filter(
    p => p.status === 'Aguardando Atendimento' || p.status === 'Em Atendimento' // Ajuste status conforme seu fluxo
  ).sort((a,b) => new Date('1970/01/01 ' + a.horaChegada) - new Date('1970/01/01 ' + b.horaChegada));

  return (
    <div className="triagem-pacientes-container">
      <h4>Pacientes para Triagem</h4>
      {pacientesParaTriagem.length > 0 ? (
        <div className="lista-container-triagem"> {/* Adicionado um wrapper para a tabela */}
            <table className="tabela-triagem-espera">
            <thead>
                <tr>
                <th>Paciente</th>
                <th>Chegada</th>
                <th>Tipo Atend.</th>
                <th>Status Fila</th>
                <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                {pacientesParaTriagem.map((p) => (
                <tr key={p.idEspera} className={`status-triagem-${p.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    <td>{p.nomeCompleto}</td>
                    <td>{p.horaChegada}</td>
                    <td>{p.tipoAtendimento}</td>
                    <td>{p.status}</td>
                    <td>
                    {(p.status === 'Aguardando Atendimento' || p.status === 'Em Atendimento') && (
                        <button onClick={() => handleOpenTriageModal(p)} className="btn-action-triagem btn-iniciar-triagem">
                        {p.dadosTriagem ? 'Revisar/Editar Triagem' : 'Iniciar Triagem'}
                        </button>
                    )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      ) : (
        <p className="info-message-triagem">Nenhum paciente aguardando triagem no momento.</p>
      )}

      {showTriageModal && pacienteEmTriagem && (
        <div className="modal-backdrop-triagem">
          <div className="modal-triagem">
            <h3>Triagem: {pacienteEmTriagem.nomeCompleto}</h3>
            <p>Chegada: {pacienteEmTriagem.horaChegada} | Tipo: {pacienteEmTriagem.tipoAtendimento}</p>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveTriage(); }} className="form-triagem">
              <div className="form-section">
                <h4>Sinais Vitais</h4>
                <div className="form-grid-triagem">
                  <div className="form-group-triagem">
                    <label htmlFor="pressaoArterial">Pressão Arterial (mmHg)</label>
                    <input type="text" name="pressaoArterial" id="pressaoArterial" placeholder="Ex: 120/80" value={triageFormData.pressaoArterial} onChange={handleTriageInputChange} />
                  </div>
                  <div className="form-group-triagem">
                    <label htmlFor="temperatura">Temperatura (°C)</label>
                    <input type="text" name="temperatura" id="temperatura" placeholder="Ex: 36.5" value={triageFormData.temperatura} onChange={handleTriageInputChange} />
                  </div>
                  <div className="form-group-triagem">
                    <label htmlFor="frequenciaCardiaca">Freq. Cardíaca (bpm)</label>
                    <input type="number" name="frequenciaCardiaca" id="frequenciaCardiaca" placeholder="Ex: 75" value={triageFormData.frequenciaCardiaca} onChange={handleTriageInputChange} />
                  </div>
                  <div className="form-group-triagem">
                    <label htmlFor="frequenciaRespiratoria">Freq. Respiratória (rpm)</label>
                    <input type="number" name="frequenciaRespiratoria" id="frequenciaRespiratoria" placeholder="Ex: 16" value={triageFormData.frequenciaRespiratoria} onChange={handleTriageInputChange} />
                  </div>
                  <div className="form-group-triagem">
                    <label htmlFor="saturacaoOxigenio">Sat. O₂ (%)</label>
                    <input type="number" name="saturacaoOxigenio" id="saturacaoOxigenio" placeholder="Ex: 98" value={triageFormData.saturacaoOxigenio} onChange={handleTriageInputChange} />
                  </div>
                  <div className="form-group-triagem">
                    <label htmlFor="nivelDor">Nível de Dor (0-10)</label>
                    <select name="nivelDor" id="nivelDor" value={triageFormData.nivelDor} onChange={handleTriageInputChange}>
                      {[...Array(11).keys()].map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Informações Clínicas</h4>
                <div className="form-group-triagem full-width">
                  <label htmlFor="queixaPrincipal">Queixa Principal*</label>
                  <textarea name="queixaPrincipal" id="queixaPrincipal" rows="3" value={triageFormData.queixaPrincipal} onChange={handleTriageInputChange} required></textarea>
                </div>
                 <div className="form-group-triagem full-width">
                  <label htmlFor="alergiasConhecidas">Alergias Conhecidas</label>
                  <input type="text" name="alergiasConhecidas" id="alergiasConhecidas" value={triageFormData.alergiasConhecidas} onChange={handleTriageInputChange} />
                </div>
                <div className="form-group-triagem full-width">
                  <label htmlFor="observacoesTriagem">Observações da Triagem</label>
                  <textarea name="observacoesTriagem" id="observacoesTriagem" rows="3" value={triageFormData.observacoesTriagem} onChange={handleTriageInputChange}></textarea>
                </div>
                <div className="form-group-triagem">
                  <label htmlFor="classificacaoRisco">Classificação de Risco*</label>
                  <select name="classificacaoRisco" id="classificacaoRisco" value={triageFormData.classificacaoRisco} onChange={handleTriageInputChange} required>
                    <option value="Emergência">Emergência (Vermelho)</option>
                    <option value="Muito Urgente">Muito Urgente (Laranja)</option>
                    <option value="Urgente">Urgente (Amarelo)</option>
                    <option value="Pouco Urgente">Pouco Urgente (Verde)</option>
                    <option value="Não Urgente">Não Urgente (Azul)</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions-triagem">
                <button type="submit" className="btn-salvar-triagem">Salvar Triagem</button>
                <button type="button" onClick={handleCloseTriageModal} className="btn-cancelar-triagem-modal">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TriagemPacientes;