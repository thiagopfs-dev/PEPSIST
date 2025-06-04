import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import './ConsultaMedica.css'; // Criaremos este CSS

function ConsultaMedica() {
  const [pacientesEmEspera, setPacientesEmEspera] = useState([]);
  const [pacienteEmConsulta, setPacienteEmConsulta] = useState(null); // Paciente atualmente em consulta
  // const [showConsultaDetalhes, setShowConsultaDetalhes] = useState(false); // Controla a visualização da área de consulta

  // Dados do formulário da consulta
  const [consultaFormData, setConsultaFormData] = useState({
    anamnese: '',
    exameFisico: '',
    hipoteseDiagnostica: '',
    condutaPrescricao: '', // Para prescrições
    condutaExames: '',    // Para solicitação de exames
    condutaObservacoes: '', // Outras observações ou encaminhamentos
    // Você pode adicionar mais campos estruturados aqui no futuro
  });

  // Carregar pacientes da fila de espera (gerenciada pela Recepção/Triagem)
  useEffect(() => {
    const savedEspera = localStorage.getItem('erpPacientesEmEspera');
    if (savedEspera) {
      setPacientesEmEspera(JSON.parse(savedEspera));
    }
  }, []); // Roda uma vez ao montar

  // Salvar alterações na lista de espera (quando um status muda, etc.)
  useEffect(() => {
    // Apenas salva se houver alguma alteração real para evitar loops desnecessários
    // Este componente modificará a lista, então ele salva.
    localStorage.setItem('erpPacientesEmEspera', JSON.stringify(pacientesEmEspera));
  }, [pacientesEmEspera]);


  const handleIniciarConsulta = (pacienteDaFila) => {
    setPacienteEmConsulta(pacienteDaFila);
    // Limpa o formulário de consulta para o novo paciente
    setConsultaFormData({
      anamnese: pacienteDaFila.dadosConsulta?.anamnese || '', // Carrega dados se já houver consulta iniciada
      exameFisico: pacienteDaFila.dadosConsulta?.exameFisico || '',
      hipoteseDiagnostica: pacienteDaFila.dadosConsulta?.hipoteseDiagnostica || '',
      condutaPrescricao: pacienteDaFila.dadosConsulta?.condutaPrescricao || '',
      condutaExames: pacienteDaFila.dadosConsulta?.condutaExames || '',
      condutaObservacoes: pacienteDaFila.dadosConsulta?.condutaObservacoes || '',
    });
    // setShowConsultaDetalhes(true); // O formulário será exibido condicionalmente

    // Atualiza o status do paciente para "Em Consulta Médica"
    setPacientesEmEspera(
      pacientesEmEspera.map((p) =>
        p.idEspera === pacienteDaFila.idEspera ? { ...p, status: 'Em Consulta Médica', horaInicioConsulta: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) } : p
      )
    );
  };

  const handleConsultaInputChange = (e) => {
    const { name, value } = e.target;
    setConsultaFormData({ ...consultaFormData, [name]: value });
  };

  const handleSalvarConsulta = (finalizar = false) => {
    if (!pacienteEmConsulta) return;

    let novoStatus = pacienteEmConsulta.status;
    if (finalizar) {
        // Aqui você poderia ter uma lógica mais complexa para definir o próximo status
        // Ex: Se pediu exames -> "Aguardando Exames", se prescreveu -> "Medicação Aplicada/Liberado", etc.
        novoStatus = 'Atendimento Finalizado'; // Status genérico por enquanto
    }

    const consultaAtualizada = {
      ...pacienteEmConsulta,
      dadosConsulta: { ...consultaFormData }, // Salva os dados da consulta no paciente da fila
      status: novoStatus,
      horaFimConsulta: finalizar ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : pacienteEmConsulta.horaFimConsulta,
    };

    setPacientesEmEspera(
      pacientesEmEspera.map((p) =>
        p.idEspera === pacienteEmConsulta.idEspera ? consultaAtualizada : p
      )
    );

    if (finalizar) {
      setPacienteEmConsulta(null); // Limpa o paciente em consulta
      // setShowConsultaDetalhes(false); // Esconde o formulário
    } else {
        // Se for apenas um "salvar parcial", atualiza o pacienteEmConsulta para refletir os dados salvos
        setPacienteEmConsulta(consultaAtualizada);
        alert("Consulta salva parcialmente!");
    }
  };


  // Filtra pacientes que estão aguardando consulta após a triagem
  const pacientesParaAtendimento = pacientesEmEspera.filter(
    p => p.status === 'Aguardando Consulta' || p.status === 'Triagem Concluída' // Ajuste status conforme seu fluxo da triagem
  ).sort((a,b) => {
    // Adicionar lógica de prioridade baseada na classificação de risco da triagem, se houver
    // Por enquanto, ordena pela hora da triagem ou chegada
    const timeA = a.horaTriagem || a.horaChegada;
    const timeB = b.horaTriagem || b.horaChegada;
    return new Date('1970/01/01 ' + timeA) - new Date('1970/01/01 ' + timeB);
  });

  const pacienteAtualmenteEmConsulta = pacientesEmEspera.find(p => p.idEspera === pacienteEmConsulta?.idEspera);


  return (
    <div className="consulta-medica-container">
      {!pacienteEmConsulta ? (
        <>
          <h4>Pacientes Aguardando Consulta</h4>
          {pacientesParaAtendimento.length > 0 ? (
            <table className="tabela-consulta-espera">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Chegada / Triagem</th>
                  <th>Queixa (Triagem)</th>
                  <th>Class. Risco</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pacientesParaAtendimento.map((p) => (
                  <tr key={p.idEspera}>
                    <td>{p.nomeCompleto}</td>
                    <td>{p.horaTriagem || p.horaChegada}</td>
                    <td>{p.dadosTriagem?.queixaPrincipal || 'N/A'}</td>
                    <td>
                        <span className={`risco-badge risco-${p.dadosTriagem?.classificacaoRisco?.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '') || 'na'}`}>
                            {p.dadosTriagem?.classificacaoRisco || 'N/A'}
                        </span>
                    </td>
                    <td>
                      <button onClick={() => handleIniciarConsulta(p)} className="btn-action-consulta btn-iniciar-consulta">
                        Atender Paciente
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="info-message-consulta">Nenhum paciente aguardando consulta no momento.</p>
          )}
        </>
      ) : (
        // Formulário/Área de Consulta para o pacienteEmConsulta
        <div className="area-consulta-ativa">
          <div className="consulta-header-paciente">
            <h3>Atendendo: {pacienteAtualmenteEmConsulta?.nomeCompleto}</h3>
            <div className="paciente-info-resumo">
                <span>Chegada: {pacienteAtualmenteEmConsulta?.horaChegada}</span> |
                <span>Triagem: {pacienteAtualmenteEmConsulta?.horaTriagem || 'N/A'}</span> |
                <span>Queixa: {pacienteAtualmenteEmConsulta?.dadosTriagem?.queixaPrincipal || 'N/A'}</span> |
                <span>Risco: {pacienteAtualmenteEmConsulta?.dadosTriagem?.classificacaoRisco || 'N/A'}</span>
            </div>
          </div>

          <form className="form-consulta-medica" onSubmit={(e) => {e.preventDefault(); handleSalvarConsulta(false);}}>
            <div className="form-section-consulta">
              <label htmlFor="anamnese">Anamnese / História Clínica</label>
              <textarea id="anamnese" name="anamnese" rows="6" value={consultaFormData.anamnese} onChange={handleConsultaInputChange}></textarea>
            </div>
            <div className="form-section-consulta">
              <label htmlFor="exameFisico">Exame Físico</label>
              <textarea id="exameFisico" name="exameFisico" rows="5" value={consultaFormData.exameFisico} onChange={handleConsultaInputChange}></textarea>
            </div>
            <div className="form-section-consulta">
              <label htmlFor="hipoteseDiagnostica">Hipótese Diagnóstica (HD)</label>
              <textarea id="hipoteseDiagnostica" name="hipoteseDiagnostica" rows="4" value={consultaFormData.hipoteseDiagnostica} onChange={handleConsultaInputChange}></textarea>
            </div>
            
            <div className="form-section-consulta conduta-section">
                <h4>Conduta</h4>
                <div className="form-group-consulta">
                    <label htmlFor="condutaPrescricao">Prescrição</label>
                    <textarea id="condutaPrescricao" name="condutaPrescricao" rows="4" placeholder="Medicamentos, dosagens, via, frequência..." value={consultaFormData.condutaPrescricao} onChange={handleConsultaInputChange}></textarea>
                </div>
                <div className="form-group-consulta">
                    <label htmlFor="condutaExames">Solicitação de Exames</label>
                    <textarea id="condutaExames" name="condutaExames" rows="3" placeholder="Exames laboratoriais, de imagem..." value={consultaFormData.condutaExames} onChange={handleConsultaInputChange}></textarea>
                </div>
                <div className="form-group-consulta">
                    <label htmlFor="condutaObservacoes">Observações / Encaminhamentos / Atestado</label>
                    <textarea id="condutaObservacoes" name="condutaObservacoes" rows="3" placeholder="Outras condutas, atestados, encaminhamentos..." value={consultaFormData.condutaObservacoes} onChange={handleConsultaInputChange}></textarea>
                </div>
            </div>

            <div className="consulta-actions">
              <button type="button" onClick={() => handleSalvarConsulta(false)} className="btn-salvar-parcial-consulta">Salvar Parcial</button>
              <button type="button" onClick={() => { if(window.confirm('Tem certeza que deseja finalizar este atendimento?')) handleSalvarConsulta(true);}} className="btn-finalizar-consulta">Finalizar Atendimento</button>
              <button type="button" onClick={() => setPacienteEmConsulta(null)} className="btn-voltar-lista-consulta">Voltar para Lista</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ConsultaMedica;