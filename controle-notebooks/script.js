class SistemaEmprestimos {
    constructor() {
        this.notebooks = this.initializeNotebooks();
        this.emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];
        this.currentMonth = new Date();
        this.init();
    }

    initializeNotebooks() {
    const savedNotebooks = JSON.parse(localStorage.getItem('notebooks'));
    if (savedNotebooks) return savedNotebooks;

    const notebooks = [];
    for (let i = 1; i <= 15; i++) {
        notebooks.push({
            id: i,
            numero: `EMPRESTIMO_${i.toString().padStart(2, '0')}`,
            serie: `${Math.floor(Math.random() * 9000) + 1000}DD3`,
            rfid: `${200794 + i}`,
            modelo: '',
            processador: '',
            memoria: '',
            descricao: '',
            dataCadastro: new Date().toISOString(),
            status: 'disponivel',
            colaborador: null,
            setor: null,
            chamado: null,
            dataEntrega: null,
            previsaoDevolucao: null
        });
    }
    
    localStorage.setItem('notebooks', JSON.stringify(notebooks));
    return notebooks;
}

    // Função para mostrar detalhes com botão de edição
mostrarDetalhesNotebook(notebookId) {
    const notebook = this.notebooks.find(nb => nb.id === notebookId);
    const emprestimo = this.emprestimos.find(emp => 
        emp.notebookId === notebookId && emp.status === 'ativo'
    );

    let detalhesHtml = `
        <div class="detalhe-item">
            <span class="detalhe-label">Notebook:</span>
            <span class="detalhe-valor">${notebook.numero}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Série:</span>
            <span class="detalhe-valor">${notebook.serie}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">RFID:</span>
            <span class="detalhe-valor">${notebook.rfid}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Status:</span>
            <span class="detalhe-valor">
                <span class="status-badge status-${notebook.status}">
                    ${notebook.status === 'disponivel' ? 'Disponível' : 'Em Uso'}
                </span>
            </span>
        </div>
    `;

    if (notebook.modelo) {
        detalhesHtml += `
            <div class="detalhe-item">
                <span class="detalhe-label">Modelo:</span>
                <span class="detalhe-valor">${notebook.modelo}</span>
            </div>
        `;
    }

    if (notebook.processador) {
        detalhesHtml += `
            <div class="detalhe-item">
                <span class="detalhe-label">Processador:</span>
                <span class="detalhe-valor">${notebook.processador}</span>
            </div>
        `;
    }

    if (notebook.memoria) {
        detalhesHtml += `
            <div class="detalhe-item">
                <span class="detalhe-label">Memória:</span>
                <span class="detalhe-valor">${notebook.memoria}</span>
            </div>
        `;
    }

    if (notebook.descricao) {
        detalhesHtml += `
            <div class="detalhe-item">
                <span class="detalhe-label">Descrição:</span>
                <span class="detalhe-valor">${notebook.descricao}</span>
            </div>
        `;
    }

    if (emprestimo) {
        detalhesHtml += `
            <hr style="margin: 20px 0; border: 1px solid var(--medium-gray);">
            <h4 style="color: var(--primary-orange); margin-bottom: 15px;">Empréstimo Atual</h4>
            <div class="detalhe-item">
                <span class="detalhe-label">Colaborador:</span>
                <span class="detalhe-valor">${emprestimo.colaborador}</span>
            </div>
            <div class="detalhe-item">
                <span class="detalhe-label">Setor:</span>
                <span class="detalhe-valor">${emprestimo.setor}</span>
            </div>
            <div class="detalhe-item">
                <span class="detalhe-label">Chamado:</span>
                <span class="detalhe-valor">${emprestimo.chamado}</span>
            </div>
            <div class="detalhe-item">
                <span class="detalhe-label">Motivo:</span>
                <span class="detalhe-valor">${emprestimo.motivo}</span>
            </div>
            <div class="detalhe-item">
                <span class="detalhe-label">Data Entrega:</span>
                <span class="detalhe-valor">${this.formatDateTime(emprestimo.dataEntrega)}</span>
            </div>
            <div class="detalhe-item">
                <span class="detalhe-label">Previsão Devolução:</span>
                <span class="detalhe-valor">${this.formatDate(emprestimo.previsaoDevolucao)}</span>
            </div>
        `;
    }

    // Adiciona botão de edição se disponível
    if (notebook.status === 'disponivel') {
        detalhesHtml += `
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--medium-gray);">
                <button class="btn-primary" onclick="sistema.abrirModalEditarNotebook(${notebook.id})" style="margin-right: 10px;">
                    <i class="fas fa-edit"></i> Editar Notebook
                </button>
            </div>
        `;
    }

    document.getElementById('detalhesEmprestimo').innerHTML = detalhesHtml;
    document.getElementById('modalDetalhes').classList.add('active');
}

// Função para abrir modal de edição
abrirModalEditarNotebook(notebookId) {
    const notebook = this.notebooks.find(nb => nb.id === notebookId);
    if (!notebook || notebook.status !== 'disponivel') {
        this.showToast('Apenas notebooks disponíveis podem ser editados!', 'error');
        return;
    }

    // Preenche os campos do formulário
    document.getElementById('editNumero').value = notebook.numero;
    document.getElementById('editSerie').value = notebook.serie;
    document.getElementById('editRfid').value = notebook.rfid;
    document.getElementById('editDescricao').value = notebook.descricao || '';
    document.getElementById('editModelo').value = notebook.modelo || '';
    document.getElementById('editProcessador').value = notebook.processador || '';
    document.getElementById('editMemoria').value = notebook.memoria || '';

    // Fecha modal de detalhes e abre modal de edição
    this.closeModal();
    document.getElementById('modalEditarNotebook').classList.add('active');
    document.getElementById('modalEditarNotebook').dataset.notebookId = notebookId;
}

// Função para salvar edição
salvarEdicaoNotebook() {
    const notebookId = parseInt(document.getElementById('modalEditarNotebook').dataset.notebookId);
    const notebook = this.notebooks.find(nb => nb.id === notebookId);

    if (!notebook) {
        this.showToast('Notebook não encontrado!', 'error');
        return;
    }

    const novoNumero = document.getElementById('editNumero').value.trim();
    const novaSerie = document.getElementById('editSerie').value.trim();
    const novoRfid = document.getElementById('editRfid').value.trim();
    const novaDescricao = document.getElementById('editDescricao').value.trim();
    const novoModelo = document.getElementById('editModelo').value.trim();
    const novoProcessador = document.getElementById('editProcessador').value.trim();
    const novaMemoria = document.getElementById('editMemoria').value.trim();

    // Validações
    if (!novoNumero || !novaSerie || !novoRfid) {
        this.showToast('Número, Série e RFID são obrigatórios!', 'error');
        return;
    }

    // Verifica duplicatas
    const numeroExistente = this.notebooks.find(nb => nb.id !== notebookId && nb.numero === novoNumero);
    const rfidExistente = this.notebooks.find(nb => nb.id !== notebookId && nb.rfid === novoRfid);

    if (numeroExistente) {
        this.showToast('Já existe um notebook com este número!', 'error');
        return;
    }

    if (rfidExistente) {
        this.showToast('Já existe um notebook com este RFID!', 'error');
        return;
    }

    // Atualiza o notebook
    notebook.numero = novoNumero;
    notebook.serie = novaSerie;
    notebook.rfid = novoRfid;
    notebook.descricao = novaDescricao;
    notebook.modelo = novoModelo;
    notebook.processador = novoProcessador;
    notebook.memoria = novaMemoria;

    this.saveData();
    this.closeModal();
    this.renderDashboard();
    this.renderListaNotebooksEdicao();
    this.updateNotebookOptions();

    this.showToast('Notebook atualizado com sucesso!', 'success');
}

// Função para renderizar lista de notebooks para edição
renderListaNotebooksEdicao() {
    const container = document.getElementById('listaNotebooksEdicao');
    if (!container) return;

    container.innerHTML = this.notebooks.map(notebook => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin-bottom: 10px; background: var(--dark-gray); border-radius: 8px; border-left: 4px solid ${notebook.status === 'disponivel' ? 'var(--success)' : 'var(--danger)'};">
            <div>
                <strong style="color: var(--primary-orange);">${notebook.numero}</strong><br>
                <small>Série: ${notebook.serie} | RFID: ${notebook.rfid}</small><br>
                <small style="color: ${notebook.status === 'disponivel' ? 'var(--success)' : 'var(--danger)'};">
                    ${notebook.status === 'disponivel' ? 'Disponível' : `Em uso - ${notebook.colaborador}`}
                </small>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn-info btn-small" onclick="sistema.mostrarDetalhesNotebook(${notebook.id})" title="Ver detalhes">
                    <i class="fas fa-eye"></i>
                </button>
                ${notebook.status === 'disponivel' ? `
                    <button class="btn-primary btn-small" onclick="sistema.abrirModalEditarNotebook(${notebook.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Função para abrir modal de geração em lote
abrirModalGerarLote() {
    document.getElementById('modalGerarLote').classList.add('active');
}

// Função para gerar notebooks em lote
gerarNotebooksLote() {
    const prefixoNumero = document.getElementById('prefixoNumero').value.trim();
    const prefixoRfid = document.getElementById('prefixoRfid').value.trim();
    const numeroInicial = parseInt(document.getElementById('numeroInicial').value);
    const rfidInicial = parseInt(document.getElementById('rfidInicial').value);
    const sufixoSerie = document.getElementById('sufixoSerie').value.trim();

    if (!prefixoNumero || !prefixoRfid || !numeroInicial || !rfidInicial || !sufixoSerie) {
        this.showToast('Todos os campos são obrigatórios!', 'error');
        return;
    }

    if (!confirm('Tem certeza? Esta ação irá recriar todos os notebooks disponíveis.')) {
        return;
    }

    // Preserva notebooks em uso
    const notebooksEmUso = this.notebooks.filter(nb => nb.status === 'emprestado');
    
    // Recria apenas os disponíveis
    let novoId = 1;
    const novosNotebooks = [];

    for (let i = 1; i <= 15; i++) {
        const notebookEmUso = notebooksEmUso.find(nb => nb.id === i);
        
        if (notebookEmUso) {
            novosNotebooks.push(notebookEmUso);
        } else {
            novosNotebooks.push({
                id: i,
                numero: `${prefixoNumero}${(numeroInicial + i - 1).toString().padStart(2, '0')}`,
                serie: `${Math.floor(Math.random() * 9000) + 1000}${sufixoSerie}`,
                rfid: `${prefixoRfid}${rfidInicial + i - 1}`,
                modelo: '',
                processador: '',
                memoria: '',
                descricao: '',
                dataCadastro: new Date().toISOString(),
                status: 'disponivel',
                colaborador: null,
                setor: null,
                chamado: null,
                dataEntrega: null,
                previsaoDevolucao: null
            });
        }
    }

    this.notebooks = novosNotebooks;
    this.saveData();
    this.closeModal();
    this.renderDashboard();
    this.renderListaNotebooksEdicao();
    this.updateNotebookOptions();
    this.updateStats();

    this.showToast('Notebooks gerados com sucesso!', 'success');
}

// Função para exportar configuração
exportarConfiguracao() {
    const config = {
        notebooks: this.notebooks.map(nb => ({
            numero: nb.numero,
            serie: nb.serie,
            rfid: nb.rfid,
            modelo: nb.modelo || '',
            processador: nb.processador || '',
            memoria: nb.memoria || '',
            descricao: nb.descricao || ''
        })),
        setores: this.setores,
        dataExportacao: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `config_notebooks_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    this.showToast('Configuração exportada com sucesso!', 'success');
}

// Função para importar configuração
importarConfiguracao(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const config = JSON.parse(e.target.result);
            
            if (!config.notebooks || !Array.isArray(config.notebooks)) {
                this.showToast('Arquivo de configuração inválido!', 'error');
                return;
            }

            if (!confirm('Importar configuração? Isto irá substituir os notebooks disponíveis.')) {
                return;
            }

            // Preserva notebooks em uso
            const notebooksEmUso = this.notebooks.filter(nb => nb.status === 'emprestado');
            
            // Aplica configuração importada
            this.notebooks = this.notebooks.map((notebook, index) => {
                if (notebook.status === 'emprestado') {
                    return notebook; // Mantém notebooks em uso
                } else if (config.notebooks[index]) {
                    const configNotebook = config.notebooks[index];
                    return {
                        ...notebook,
                        numero: configNotebook.numero,
                        serie: configNotebook.serie,
                        rfid: configNotebook.rfid,
                        modelo: configNotebook.modelo || '',
                        processador: configNotebook.processador || '',
                        memoria: configNotebook.memoria || '',
                        descricao: configNotebook.descricao || ''
                    };
                }
                return notebook;
            });

            if (config.setores) {
                this.setores = config.setores;
            }

            this.saveData();
            this.renderDashboard();
            this.renderListaNotebooksEdicao();
            this.renderSetores();
            this.updateNotebookOptions();
            this.updateSetorOptions();
            
            this.showToast('Configuração importada com sucesso!', 'success');
        } catch (error) {
            this.showToast('Erro ao importar configuração!', 'error');
        }
    };
    
    reader.readAsText(file);
    input.value = ''; // Limpa o input
}

// Função para resetar notebooks
resetarNotebooks() {
    if (!confirm('Tem certeza? Esta ação irá resetar todos os notebooks disponíveis para o padrão.')) {
        return;
    }

    // Remove apenas notebooks disponíveis do localStorage e recria
    localStorage.removeItem('notebooks');
    this.notebooks = this.initializeNotebooks();
    
    // Restaura empréstimos ativos
    const emprestimosAtivos = this.emprestimos.filter(emp => emp.status === 'ativo');
    emprestimosAtivos.forEach(emp => {
        const notebook = this.notebooks.find(nb => nb.id === emp.notebookId);
        if (notebook) {
            notebook.status = 'emprestado';
            notebook.colaborador = emp.colaborador;
            notebook.setor = emp.setor;
            notebook.chamado = emp.chamado;
            notebook.dataEntrega = emp.dataEntrega;
            notebook.previsaoDevolucao = emp.previsaoDevolucao;
        }
    });

    this.saveData();
    this.renderDashboard();
    this.renderListaNotebooksEdicao();
    this.updateNotebookOptions();
    this.updateStats();
    
    this.showToast('Notebooks resetados para o padrão!', 'success');
}


    init() {
    this.setupEventListeners();
    this.renderDashboard();
    this.renderCalendario();
    this.renderHistorico();
    this.renderSetores();
    this.updateStats();
    this.setMinDate();
    this.updateNotebookOptions();
    this.updateSetorOptions();
    this.renderListaNotebooksEdicao(); // ← ADICIONE ESTA LINHA
}


    setupEventListeners() {
        // Navegação entre tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.closest('.tab-btn').dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Formulário
        document.getElementById('formSolicitacao').addEventListener('submit', (e) => {
            e.preventDefault();
            this.criarSolicitacao();
        });

        // Reset do formulário - atualiza opções de notebooks
        document.getElementById('formSolicitacao').addEventListener('reset', () => {
            setTimeout(() => this.updateNotebookOptions(), 100);
        });

        // Calendário
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
            this.renderCalendario();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
            this.renderCalendario();
        });

        // Modal
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        document.getElementById('confirmarDevolucao').addEventListener('click', () => {
            this.confirmarDevolucao();
        });

                // Event listeners para edição de notebooks
        document.getElementById('salvarEdicaoNotebook').addEventListener('click', () => {
            this.salvarEdicaoNotebook();
        });

        document.getElementById('gerarNotebooksLote').addEventListener('click', () => {
            this.gerarNotebooksLote();
        });
    }

    setMinDate() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('dataPrevisaoDevolucao').min = tomorrow.toISOString().split('T')[0];
    }

    updateNotebookOptions() {
        const select = document.getElementById('notebookSelecionado');
        if (!select) return;

        const notebooksDisponiveis = this.notebooks.filter(nb => nb.status === 'disponivel');
        
        select.innerHTML = '<option value="">Selecione um notebook disponível</option>';
        
        if (notebooksDisponiveis.length === 0) {
            select.innerHTML = '<option value="">Nenhum notebook disponível</option>';
            select.disabled = true;
        } else {
            select.disabled = false;
            notebooksDisponiveis.forEach(notebook => {
                const option = document.createElement('option');
                option.value = notebook.id;
                option.textContent = `${notebook.numero} (Série: ${notebook.serie})`;
                select.appendChild(option);
            });
        }
    }

    switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');

    switch(tabName) {
        case 'calendario':
            this.renderCalendario();
            break;
        case 'solicitar':
            this.updateNotebookOptions();
            break;
        case 'historico':
            this.renderHistorico();
            break;
        case 'setores':
            this.renderSetores();
            this.renderListaNotebooksEdicao();
            break;
    }
}


    criarSolicitacao() {
        const nome = document.getElementById('nomeColaborador').value.trim();
        const setor = document.getElementById('setorColaborador').value;
        const notebookId = document.getElementById('notebookSelecionado').value;
        const chamado = document.getElementById('numeroChamado').value.trim();
        const motivo = document.getElementById('motivoEmprestimo').value.trim();
        const previsaoDevolucao = document.getElementById('dataPrevisaoDevolucao').value;

        // Validações
        if (!nome || !setor || !notebookId || !chamado || !motivo || !previsaoDevolucao) {
            this.showToast('Todos os campos são obrigatórios!', 'error');
            return;
        }
        

        if (nome.length < 2) {
            this.showToast('Nome deve ter pelo menos 2 caracteres!', 'error');
            return;
        }

        if (chamado.length < 3) {
            this.showToast('Número do chamado deve ter pelo menos 3 caracteres!', 'error');
            return;
        }

        if (motivo.length < 10) {
            this.showToast('Motivo deve ter pelo menos 10 caracteres!', 'error');
            return;
        }

        // Verifica se o notebook selecionado ainda está disponível
        const notebookSelecionado = this.notebooks.find(nb => nb.id == notebookId && nb.status === 'disponivel');
        if (!notebookSelecionado) {
            this.showToast('O notebook selecionado não está mais disponível!', 'error');
            this.updateNotebookOptions();
            return;
        }

        // Verifica se a data não é muito distante (máximo 3 meses)
        const previsaoDate = new Date(previsaoDevolucao);
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        
        if (previsaoDate > maxDate) {
            this.showToast('Data de devolução não pode ser superior a 3 meses!', 'warning');
            return;
        }

        const agora = new Date();
        const emprestimo = {
            id: Date.now(),
            notebookId: notebookSelecionado.id,
            colaborador: nome,
            setor: setor,
            chamado: chamado,
            motivo: motivo,
            dataEntrega: agora.toISOString(),
            previsaoDevolucao: previsaoDevolucao,
            status: 'ativo'
        };

        // Atualiza o notebook selecionado
        notebookSelecionado.status = 'emprestado';
        notebookSelecionado.colaborador = nome;
        notebookSelecionado.setor = setor;
        notebookSelecionado.chamado = chamado;
        notebookSelecionado.dataEntrega = agora.toISOString();
        notebookSelecionado.previsaoDevolucao = previsaoDevolucao;

        this.emprestimos.push(emprestimo);
        this.saveData();

        // Limpa formulário e atualiza opções
        document.getElementById('formSolicitacao').reset();
        this.setMinDate();
        this.updateNotebookOptions();

        this.showToast(`Notebook ${notebookSelecionado.numero} emprestado com sucesso para ${nome}!`, 'success');
        this.renderDashboard();
        this.updateStats();
        this.switchTab('dashboard');
    }

    renderDashboard() {
        const container = document.getElementById('notebooksContainer');
        container.innerHTML = this.notebooks.map(notebook => {
            const isAtrasado = notebook.status === 'emprestado' && this.isAtrasado(notebook.previsaoDevolucao);
            
            return `
                <div class="notebook-card ${notebook.status}">
                    <div class="notebook-icon">
                        <i class="fas fa-laptop"></i>
                    </div>
                    <div class="notebook-number">${notebook.numero}</div>
                    <div class="notebook-status status-${notebook.status}">
                        ${notebook.status === 'disponivel' ? 'Disponível' : 'Em Uso'}
                        ${isAtrasado ? ' (Atrasado)' : ''}
                    </div>
                    ${notebook.status === 'emprestado' ? `
                        <div class="notebook-info">
                            <strong>${notebook.colaborador}</strong><br>
                            <span style="color: var(--light-orange);">${notebook.setor}</span><br>
                            <small>Chamado: ${notebook.chamado}</small><br>
                            <small>Devolução: ${this.formatDate(notebook.previsaoDevolucao)}</small>
                        </div>
                    ` : '<div class="notebook-info">Pronto para empréstimo</div>'}
                    <div class="notebook-actions">
                        ${notebook.status === 'emprestado' ? `
                            <button class="btn-danger btn-small" onclick="sistema.abrirModalDevolucao(${notebook.id})">
                                <i class="fas fa-undo"></i> Devolver
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Empréstimos ativos
        const ativos = this.emprestimos.filter(emp => emp.status === 'ativo');
        const emprestimosContainer = document.getElementById('emprestimosAtivos');
        
        if (ativos.length === 0) {
            emprestimosContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; opacity: 0.7;">
                    <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 15px; color: var(--primary-orange);"></i>
                    <p>Nenhum empréstimo ativo</p>
                </div>
            `;
        } else {
            emprestimosContainer.innerHTML = ativos.map(emprestimo => {
                const notebook = this.notebooks.find(nb => nb.id === emprestimo.notebookId);
                const previsao = new Date(emprestimo.previsaoDevolucao);
                const hoje = new Date();
                const isAtrasado = previsao < hoje;
                const diasRestantes = Math.ceil((previsao - hoje) / (1000 * 60 * 60 * 24));
                
                return `
                    <div class="emprestimo-item">
                        <div class="emprestimo-header">
                            <span class="emprestimo-notebook">${notebook ? notebook.numero : 'N/A'}</span>
                            <span class="emprestimo-status ${isAtrasado ? 'status-atrasado' : 'status-ativo'}">
                                ${isAtrasado ? `Atrasado (${Math.abs(diasRestantes)} dias)` : 
                                  diasRestantes === 0 ? 'Vence Hoje' :
                                  diasRestantes === 1 ? 'Vence Amanhã' :
                                  `${diasRestantes} dias restantes`}
                            </span>
                        </div>
                        <div class="emprestimo-info">
                            <div><strong>Colaborador</strong><span>${emprestimo.colaborador}</span></div>
                            <div><strong>Setor</strong><span>${emprestimo.setor}</span></div>
                            <div><strong>Chamado</strong><span>${emprestimo.chamado}</span></div>
                            <div><strong>Devolução</strong><span>${this.formatDate(emprestimo.previsaoDevolucao)}</span></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    renderCalendario() {
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        
        document.getElementById('currentMonth').textContent = 
            `${monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;

        const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let html = '';
        dayNames.forEach(day => {
            html += `<div class="calendario-day header">${day}</div>`;
        });

        const currentDate = new Date(startDate);
        for (let i = 0; i < 42; i++) {
            const isCurrentMonth = currentDate.getMonth() === this.currentMonth.getMonth();
            const isToday = currentDate.toDateString() === new Date().toDateString();
            
            let classes = 'calendario-day';
            if (!isCurrentMonth) classes += ' outro-mes';
            if (isToday) classes += ' hoje';

            // Verifica empréstimos com devolução neste dia
            const emprestimosHoje = this.emprestimos.filter(emp => {
                if (emp.status !== 'ativo') return false;
                const previsao = new Date(emp.previsaoDevolucao);
                return previsao.toDateString() === currentDate.toDateString();
            });

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const currentDateCopy = new Date(currentDate);
            currentDateCopy.setHours(0, 0, 0, 0);

            if (emprestimosHoje.length > 0) {
                if (currentDateCopy < hoje) {
                    classes += ' atrasado';
                } else {
                    classes += ' devolucao';
                }
            }

            let eventosHtml = '';
            emprestimosHoje.forEach(emp => {
                const notebook = this.notebooks.find(nb => nb.id === emp.notebookId);
                const nomeAbrev = emp.colaborador.split(' ')[0];
                eventosHtml += `
                    <div class="calendario-evento" 
                         title="${emp.colaborador} - ${notebook ? notebook.numero : 'N/A'} - ${emp.chamado}">
                        ${nomeAbrev}
                    </div>
                `;
            });

            html += `
                <div class="${classes}" title="${currentDate.toLocaleDateString('pt-BR')}">
                    <div>${currentDate.getDate()}</div>
                    ${eventosHtml}
                </div>
            `;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        document.getElementById('calendarioGrid').innerHTML = html;
    }

    abrirModalDevolucao(notebookId) {
        const notebook = this.notebooks.find(nb => nb.id === notebookId);
        if (!notebook || notebook.status !== 'emprestado') {
            this.showToast('Notebook não encontrado ou não está emprestado!', 'error');
            return;
        }

        document.getElementById('notebookDevolucao').textContent = notebook.numero;
        document.getElementById('modalDevolucao').classList.add('active');
        document.getElementById('modalDevolucao').dataset.notebookId = notebookId;
    }

    confirmarDevolucao() {
        const notebookId = parseInt(document.getElementById('modalDevolucao').dataset.notebookId);
        const observacoes = document.getElementById('observacoesDevolucao').value || '';
        
        const notebook = this.notebooks.find(nb => nb.id === notebookId);
        const emprestimo = this.emprestimos.find(emp => 
            emp.notebookId === notebookId && emp.status === 'ativo'
        );

        if (!notebook || !emprestimo) {
            this.showToast('Erro ao processar devolução!', 'error');
            return;
        }

        const agora = new Date();
        
        emprestimo.status = 'devolvido';
        emprestimo.dataDevolucao = agora.toISOString();
        emprestimo.observacoesDevolucao = observacoes;

        notebook.status = 'disponivel';
        notebook.colaborador = null;
        notebook.setor = null;
        notebook.chamado = null;
        notebook.dataEntrega = null;
        notebook.previsaoDevolucao = null;

        this.saveData();
        this.closeModal();
        this.renderDashboard();
        this.updateStats();
        this.updateNotebookOptions(); // Atualiza as opções disponíveis
        this.showToast(`Notebook ${notebook.numero} devolvido com sucesso!`, 'success');
    }

    closeModal() {
        document.getElementById('modalDevolucao').classList.remove('active');
        document.getElementById('observacoesDevolucao').value = '';
    }

    updateStats() {
        const disponiveisCount = this.notebooks.filter(nb => nb.status === 'disponivel').length;
        const emprestadosCount = this.notebooks.filter(nb => nb.status === 'emprestado').length;
        
        document.getElementById('disponiveisCount').textContent = disponiveisCount;
        document.getElementById('emprestadosCount').textContent = emprestadosCount;
    }

    isAtrasado(previsaoDevolucao) {
        if (!previsaoDevolucao) return false;
        const previsao = new Date(previsaoDevolucao);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        previsao.setHours(0, 0, 0, 0);
        return previsao < hoje;
    }

    saveData() {
        localStorage.setItem('notebooks', JSON.stringify(this.notebooks));
        localStorage.setItem('emprestimos', JSON.stringify(this.emprestimos));
    }

    showToast(message, type = 'success') {
        document.querySelectorAll('.toast').forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    }
}

// Inicializa o sistema
let sistema;
document.addEventListener('DOMContentLoaded', function() {
    sistema = new SistemaEmprestimos();
});
