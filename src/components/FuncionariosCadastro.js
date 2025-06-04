import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Para IDs únicos
import './FuncionariosCadastro.css'; // Criaremos este CSS

// Dados iniciais mockados (substitua por carregamento do localStorage/API no futuro)
const initialFuncionarios = [
  { id: uuidv4(), nome: 'Ana Silva', matricula: 'F001', cargo: 'Enfermeira Chefe', setor: 'Enfermaria A', status: 'Ativo' },
  { id: uuidv4(), nome: 'Carlos Souza', matricula: 'F002', cargo: 'Médico Clínico Geral', setor: 'Ambulatório', status: 'Ativo' },
  { id: uuidv4(), nome: 'Beatriz Costa', matricula: 'F003', cargo: 'Recepcionista', setor: 'Recepção Principal', status: 'Ativo' },
  { id: uuidv4(), nome: 'Daniel Almeida', matricula: 'F004', cargo: 'Técnico de Laboratório', setor: 'Laboratório', status: 'Férias' },
];

function FuncionariosCadastro() {
  const [funcionarios, setFuncionarios] = useState(() => {
    const savedFuncionarios = localStorage.getItem('erpFuncionarios');
    return savedFuncionarios ? JSON.parse(savedFuncionarios) : initialFuncionarios;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFuncionario, setCurrentFuncionario] = useState(null);

  // Novo estado para os campos do formulário
  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    matricula: '',
    cargo: '',
    setor: '',
    dataNascimento: '',
    cpf: '',
    rg: '',
    endereco: '',
    telefone: '',
    email: '',
    dataAdmissao: '',
    salario: '',
    status: 'Ativo', // 'Ativo', 'Inativo', 'Férias', etc.
  });

  useEffect(() => {
    localStorage.setItem('erpFuncionarios', JSON.stringify(funcionarios));
  }, [funcionarios]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleShowForm = (funcionario = null) => {
    if (funcionario) {
      setFormData({ ...funcionario }); // Preenche o formulário com os dados do funcionário para edição
      setIsEditing(true);
      setCurrentFuncionario(funcionario);
    } else {
      // Limpa o formulário para um novo cadastro
      setFormData({
        id: '', nome: '', matricula: '', cargo: '', setor: '', dataNascimento: '',
        cpf: '', rg: '', endereco: '', telefone: '', email: '',
        dataAdmissao: '', salario: '', status: 'Ativo',
      });
      setIsEditing(false);
      setCurrentFuncionario(null);
    }
    setShowForm(true);
  };

  const handleHideForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentFuncionario(null);
    // Limpar o formulário ao fechar
     setFormData({
        id: '', nome: '', matricula: '', cargo: '', setor: '', dataNascimento: '',
        cpf: '', rg: '', endereco: '', telefone: '', email: '',
        dataAdmissao: '', salario: '', status: 'Ativo',
      });
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (isEditing && currentFuncionario) {
      // Lógica de Edição
      setFuncionarios(
        funcionarios.map((func) =>
          func.id === currentFuncionario.id ? { ...formData, id: currentFuncionario.id } : func
        )
      );
    } else {
      // Lógica de Novo Cadastro
      // Validar se matrícula já existe (exemplo básico)
      if (funcionarios.some(f => f.matricula === formData.matricula && formData.matricula.trim() !== '')) {
        alert('Matrícula já cadastrada!');
        return;
      }
      const novoFuncionario = { ...formData, id: uuidv4() };
      setFuncionarios([...funcionarios, novoFuncionario]);
    }
    handleHideForm(); // Fecha o formulário e limpa os estados de edição
  };

  const handleDeleteFuncionario = (idToDelete) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
        setFuncionarios(funcionarios.filter(func => func.id !== idToDelete));
    }
  }

  const filteredFuncionarios = funcionarios.filter((func) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      func.nome.toLowerCase().includes(searchLower) ||
      func.matricula.toLowerCase().includes(searchLower) ||
      func.cargo.toLowerCase().includes(searchLower) ||
      func.setor.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="funcionarios-cadastro-container">
      {!showForm ? (
        <>
          <div className="toolbar">
            <input
              type="text"
              placeholder="Buscar por nome, matrícula, cargo..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => handleShowForm()} className="btn-new">
              + Novo Funcionário
            </button>
          </div>

          <div className="funcionarios-list">
            {filteredFuncionarios.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Matrícula</th>
                    <th>Cargo</th>
                    <th>Setor</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFuncionarios.map((func) => (
                    <tr key={func.id}>
                      <td>{func.nome}</td>
                      <td>{func.matricula}</td>
                      <td>{func.cargo}</td>
                      <td>{func.setor}</td>
                      <td><span className={`status-badge status-${func.status?.toLowerCase()}`}>{func.status}</span></td>
                      <td>
                        <button onClick={() => handleShowForm(func)} className="btn-action btn-edit">✏️</button>
                        <button onClick={() => handleDeleteFuncionario(func.id)} className="btn-action btn-delete">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-results-message">
                {searchTerm ? 'Nenhum funcionário encontrado com os critérios de busca.' : 'Nenhum funcionário cadastrado.'}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="funcionario-form-container">
          <h3>{isEditing ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}</h3>
          <form onSubmit={handleSubmitForm} className="funcionario-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nome">Nome Completo*</label>
                <input type="text" name="nome" id="nome" value={formData.nome} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="matricula">Matrícula*</label>
                <input type="text" name="matricula" id="matricula" value={formData.matricula} onChange={handleInputChange} required disabled={isEditing} />
              </div>
              <div className="form-group">
                <label htmlFor="cargo">Cargo*</label>
                <input type="text" name="cargo" id="cargo" value={formData.cargo} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="setor">Setor*</label>
                <input type="text" name="setor" id="setor" value={formData.setor} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="dataNascimento">Data de Nascimento</label>
                <input type="date" name="dataNascimento" id="dataNascimento" value={formData.dataNascimento} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="cpf">CPF</label>
                <input type="text" name="cpf" id="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="rg">RG</label>
                <input type="text" name="rg" id="rg" value={formData.rg} onChange={handleInputChange} />
              </div>
              <div className="form-group full-width">
                <label htmlFor="endereco">Endereço</label>
                <input type="text" name="endereco" id="endereco" value={formData.endereco} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <input type="tel" name="telefone" id="telefone" placeholder="(00) 00000-0000" value={formData.telefone} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="dataAdmissao">Data de Admissão*</label>
                <input type="date" name="dataAdmissao" id="dataAdmissao" value={formData.dataAdmissao} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="salario">Salário (R$)</label>
                <input type="number" step="0.01" name="salario" id="salario" placeholder="2500.00" value={formData.salario} onChange={handleInputChange} />
              </div>
               <div className="form-group">
                <label htmlFor="status">Status*</label>
                <select name="status" id="status" value={formData.status} onChange={handleInputChange} required>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Férias">Férias</option>
                    <option value="Licença">Licença</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">{isEditing ? 'Salvar Alterações' : 'Salvar Funcionário'}</button>
              <button type="button" onClick={handleHideForm} className="btn-cancel">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default FuncionariosCadastro;