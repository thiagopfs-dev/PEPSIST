import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './PacientesCadastro.css'; // Certifique-se que este arquivo CSS existe e está estilizado

// --- SIMULAÇÃO DE API DA RECEITA ---
const mockCPFDatabase = {
  '111.111.111-11': { nomeCompleto: 'Fulano de Tal da Silva (Mock)', dataNascimento: '1990-01-15' },
  '222.222.222-22': { nomeCompleto: 'Ciclana Santos Oliveira (Mock)', dataNascimento: '1985-05-20' },
  '000.000.000-00': { nomeCompleto: 'Beltrano Teste Exemplo (Mock)', dataNascimento: '2000-10-30' },
};

const fetchCPFDataMock = (cpf) => {
  console.log(`Simulando busca para CPF: ${cpf}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const cleanedCPF = cpf.replace(/[.-]/g, '');
      const mockKey = Object.keys(mockCPFDatabase).find(key => key.replace(/[.-]/g, '') === cleanedCPF);

      if (mockCPFDatabase[mockKey]) {
        console.log('Dados encontrados (mock):', mockCPFDatabase[mockKey]);
        resolve({ success: true, data: mockCPFDatabase[mockKey] });
      } else {
        console.log('CPF não encontrado na base mockada.');
        resolve({ success: false, message: 'CPF não encontrado na base de dados simulada.' });
      }
    }, 1500);
  });
};
// --- FIM DA SIMULAÇÃO DE API ---

const initialPacientes = [
  // { id: uuidv4(), nomeCompleto: 'João da Silva Sauro', dataNascimento: '1985-07-15', sexo: 'Masculino', cpf: '111.222.333-44', telefone: '(62) 99999-1111', convenio: 'SUS', status: 'Ativo' },
  // { id: uuidv4(), nomeCompleto: 'Maria Oliveira Santos', dataNascimento: '1992-03-22', sexo: 'Feminino', cpf: '222.333.444-55', telefone: '(62) 98888-2222', convenio: 'IPASGO', status: 'Ativo' },
];

function PacientesCadastro() {
  const [pacientes, setPacientes] = useState(() => {
    const savedPacientes = localStorage.getItem('erpPacientes');
    return savedPacientes ? JSON.parse(savedPacientes) : initialPacientes;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPaciente, setCurrentPaciente] = useState(null);
  const [isFetchingCPF, setIsFetchingCPF] = useState(false);

  const [formData, setFormData] = useState({
    id: '', nomeCompleto: '', dataNascimento: '', sexo: 'Outro', cpf: '',
    rg: '', nomeDaMae: '', telefone: '', email: '', endereco: '', cep: '',
    bairro: '', cidade: '', uf: '', convenio: '', numeroCarteirinha: '',
    alergias: '', observacoes: '', status: 'Ativo',
  });

  useEffect(() => {
    localStorage.setItem('erpPacientes', JSON.stringify(pacientes));
  }, [pacientes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cpf') {
      const digits = value.replace(/\D/g, '');
      const limitedDigits = digits.substring(0, 11);
      let maskedValue = '';
      if (limitedDigits.length <= 3) {
        maskedValue = limitedDigits;
      } else if (limitedDigits.length <= 6) {
        maskedValue = `${limitedDigits.substring(0, 3)}.${limitedDigits.substring(3)}`;
      } else if (limitedDigits.length <= 9) {
        maskedValue = `${limitedDigits.substring(0, 3)}.${limitedDigits.substring(3, 6)}.${limitedDigits.substring(6)}`;
      } else {
        maskedValue = `${limitedDigits.substring(0, 3)}.${limitedDigits.substring(3, 6)}.${limitedDigits.substring(6, 9)}-${limitedDigits.substring(9)}`;
      }
      setFormData({ ...formData, [name]: maskedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCPFBlur = async () => {
    // Usa formData.cpf que já está mascarado, a função fetchCPFDataMock já limpa a máscara.
    if (formData.cpf && formData.cpf.replace(/[.-]/g, '').length === 11) {
      setIsFetchingCPF(true);
      // Não limpa nome e data aqui, para não apagar o que o usuário já digitou se a API não retornar
      // setFormData(prev => ({ ...prev, nomeCompleto: '', dataNascimento: '' }));

      try {
        const response = await fetchCPFDataMock(formData.cpf); // fetchCPFDataMock limpa a máscara
        if (response.success && response.data) {
          setFormData(prev => ({
            ...prev,
            nomeCompleto: response.data.nomeCompleto || prev.nomeCompleto, // Mantém se API não retornar
            dataNascimento: response.data.dataNascimento || prev.dataNascimento, // Mantém se API não retornar
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar dados do CPF (simulado):", error);
      } finally {
        setIsFetchingCPF(false);
      }
    }
  };

  const handleShowForm = (paciente = null) => {
    if (paciente) {
      setFormData({ ...paciente });
      setIsEditing(true);
      setCurrentPaciente(paciente);
    } else {
      setFormData({
        id: '', nomeCompleto: '', dataNascimento: '', sexo: 'Outro', cpf: '', rg: '',
        nomeDaMae: '', telefone: '', email: '', endereco: '', cep: '', bairro: '',
        cidade: '', uf: '', convenio: '', numeroCarteirinha: '', alergias: '',
        observacoes: '', status: 'Ativo',
      });
      setIsEditing(false);
      setCurrentPaciente(null);
    }
    setShowForm(true);
  };

  const handleHideForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentPaciente(null);
    setFormData({
        id: '', nomeCompleto: '', dataNascimento: '', sexo: 'Outro', cpf: '', rg: '',
        nomeDaMae: '', telefone: '', email: '', endereco: '', cep: '', bairro: '',
        cidade: '', uf: '', convenio: '', numeroCarteirinha: '', alergias: '',
        observacoes: '', status: 'Ativo',
      });
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const cleanedCPF = formData.cpf.replace(/[.-]/g, '');

    if (!formData.nomeCompleto || !formData.dataNascimento || !cleanedCPF) {
        alert('Nome completo, Data de Nascimento e CPF são obrigatórios.');
        return;
    }
    if (cleanedCPF.length !== 11) {
        alert('Formato de CPF inválido. Deve conter 11 dígitos.');
        return;
    }

    const dataToSave = { ...formData, cpf: cleanedCPF }; // Salva CPF limpo

    if (isEditing && currentPaciente) {
      setPacientes(
        pacientes.map((p) =>
          p.id === currentPaciente.id ? { ...dataToSave, id: currentPaciente.id } : p
        )
      );
    } else {
      if (pacientes.some(p => p.cpf === cleanedCPF)) {
        alert('CPF já cadastrado para outro paciente!');
        return;
      }
      const novoPaciente = { ...dataToSave, id: uuidv4() };
      setPacientes([...pacientes, novoPaciente]);
    }
    handleHideForm();
  };

  const handleDeletePaciente = (idToDelete) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.')) {
        setPacientes(pacientes.filter(p => p.id !== idToDelete));
    }
  }

  const formatCPFDisplay = (cpf) => { // Função para formatar CPF para exibição na tabela
    if (!cpf) return '';
    const digits = cpf.replace(/\D/g, '').substring(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.substring(0, 3)}.${digits.substring(3)}`;
    if (digits.length <= 9) return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6)}`;
    return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9)}`;
  };

  const filteredPacientes = pacientes.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    const cpfLimpo = p.cpf ? p.cpf.replace(/\D/g, '') : ''; // Busca pelo CPF limpo
    return (
      p.nomeCompleto.toLowerCase().includes(searchLower) ||
      cpfLimpo.includes(searchLower) || // Busca por parte do CPF limpo
      formatCPFDisplay(p.cpf).includes(searchLower) || // Busca pelo CPF formatado
      (p.convenio && p.convenio.toLowerCase().includes(searchLower))
    );
  });


  return (
    <div className="pacientes-cadastro-container">
      {!showForm ? (
        <>
          <div className="toolbar">
            <input
              type="text"
              placeholder="Buscar por nome, CPF, convênio..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => handleShowForm()} className="btn-new">
              + Novo Paciente
            </button>
          </div>

          <div className="pacientes-list">
            {filteredPacientes.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Nome Completo</th>
                    <th>Data Nasc.</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Convênio</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPacientes.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nomeCompleto}</td>
                      <td>{p.dataNascimento ? new Date(p.dataNascimento + 'T00:00:00-03:00').toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'}) : ''}</td>
                      <td>{formatCPFDisplay(p.cpf)}</td> {/* Exibe CPF formatado */}
                      <td>{p.telefone}</td>
                      <td>{p.convenio}</td>
                      <td><span className={`status-badge status-${p.status?.toLowerCase()}`}>{p.status}</span></td>
                      <td>
                        <button onClick={() => handleShowForm(p)} className="btn-action btn-edit">✏️</button>
                        <button onClick={() => handleDeletePaciente(p.id)} className="btn-action btn-delete">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-results-message">
                {searchTerm ? 'Nenhum paciente encontrado.' : 'Nenhum paciente cadastrado.'}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="paciente-form-container">
          <h3>{isEditing ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}</h3>
          <form onSubmit={handleSubmitForm} className="paciente-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="cpf">CPF*</label>
                <div className="cpf-input-wrapper">
                    <input
                        type="text"
                        name="cpf"
                        id="cpf"
                        placeholder="000.000.000-00"
                        value={formData.cpf} // formData.cpf já está mascarado pelo handleInputChange
                        onChange={handleInputChange}
                        onBlur={handleCPFBlur}
                        required
                        disabled={isEditing || isFetchingCPF} // Desabilita se estiver editando (CPF não deve mudar) ou buscando
                        maxLength="14"
                    />
                    {isFetchingCPF && <span className="cpf-loading-indicator">↻ Buscando...</span>}
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="nomeCompleto">Nome Completo*</label>
                <input type="text" name="nomeCompleto" id="nomeCompleto" value={formData.nomeCompleto} onChange={handleInputChange} required readOnly={isFetchingCPF && !!formData.nomeCompleto} />
              </div>
              <div className="form-group">
                <label htmlFor="dataNascimento">Data de Nascimento*</label>
                <input type="date" name="dataNascimento" id="dataNascimento" value={formData.dataNascimento} onChange={handleInputChange} required readOnly={isFetchingCPF && !!formData.dataNascimento} />
              </div>
              <div className="form-group">
                <label htmlFor="sexo">Sexo*</label>
                <select name="sexo" id="sexo" value={formData.sexo} onChange={handleInputChange} required disabled={isFetchingCPF}>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="rg">RG</label>
                <input type="text" name="rg" id="rg" value={formData.rg} onChange={handleInputChange} disabled={isFetchingCPF} />
              </div>
              <div className="form-group full-width">
                <label htmlFor="nomeDaMae">Nome da Mãe</label>
                <input type="text" name="nomeDaMae" id="nomeDaMae" value={formData.nomeDaMae} onChange={handleInputChange} disabled={isFetchingCPF} />
              </div>
               <div className="form-group">
                <label htmlFor="telefone">Telefone Principal</label>
                <input type="tel" name="telefone" id="telefone" placeholder="(00) 00000-0000" value={formData.telefone} onChange={handleInputChange} disabled={isFetchingCPF} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" name="email" id="email" placeholder="email@example.com" value={formData.email} onChange={handleInputChange} disabled={isFetchingCPF} />
              </div>
               <div className="form-group full-width">
                <label htmlFor="endereco">Endereço (Rua, Nº, Compl.)</label>
                <input type="text" name="endereco" id="endereco" value={formData.endereco} onChange={handleInputChange} disabled={isFetchingCPF} />
              </div>
               <div className="form-group">
                <label htmlFor="cep">CEP</label>
                <input type="text" name="cep" id="cep" placeholder="00000-000" value={formData.cep} onChange={handleInputChange} disabled={isFetchingCPF} />
              </div>
              <div className="form-group">
                <label htmlFor="bairro">Bairro</label>
                <input type="text" name="bairro" id="bairro" value={formData.bairro} onChange={handleInputChange} disabled={isFetchingCPF} />
              </div>
              <div className="form-group">
                <label htmlFor="cidade">Cidade</label>
                <input type="text" name="cidade" id="cidade" value={formData.cidade} onChange={handleInputChange} disabled={isFetchingCPF} />
              </div>
              <div className="form-group">
                <label htmlFor="uf">UF</label>
                <input type="text" name="uf" id="uf" maxLength="2" placeholder="GO" value={formData.uf} onChange={handleInputChange} disabled={isFetchingCPF} />
              </div>
              <div className="form-group">
                <label htmlFor="convenio">Convênio/Plano de Saúde</label>
                <input type="text" name="convenio" id="convenio" value={formData.convenio} onChange={handleInputChange} disabled={isFetchingCPF} />
              </div>
              <div className="form-group">
                <label htmlFor="numeroCarteirinha">Nº Carteirinha Convênio</label>
                <input type="text" name="numeroCarteirinha" id="numeroCarteirinha" value={formData.numeroCarteirinha} onChange={handleInputChange} disabled={isFetchingCPF} />
              </div>
              <div className="form-group full-width">
                <label htmlFor="alergias">Alergias Conhecidas</label>
                <textarea name="alergias" id="alergias" rows="3" value={formData.alergias} onChange={handleInputChange} disabled={isFetchingCPF}></textarea>
              </div>
              <div className="form-group full-width">
                <label htmlFor="observacoes">Observações Adicionais</label>
                <textarea name="observacoes" id="observacoes" rows="3" value={formData.observacoes} onChange={handleInputChange} disabled={isFetchingCPF}></textarea>
              </div>
               <div className="form-group">
                <label htmlFor="status">Status do Paciente*</label>
                <select name="status" id="status" value={formData.status} onChange={handleInputChange} required disabled={isFetchingCPF}>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Arquivado">Arquivado</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={isFetchingCPF}>{isEditing ? 'Salvar Alterações' : 'Salvar Paciente'}</button>
              <button type="button" onClick={handleHideForm} className="btn-cancel" disabled={isFetchingCPF}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default PacientesCadastro;