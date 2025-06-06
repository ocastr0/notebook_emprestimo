class SistemaEmprestimos {
    constructor() {
        // 🔥 CONFIGURAÇÃO FIREBASE - SUBSTITUA PELOS SEUS DADOS
        const firebaseConfig = {
            apiKey: "AIzaSyA-MT3SU98q0RZhEMh1IEpmgEaGXZPpKAQ",
            authDomain: "notebook-emprestimo.firebaseapp.com",
            databaseURL: "https://notebook-emprestimo-default-rtdb.firebaseio.com",
            projectId: "notebook-emprestimo",
            storageBucket: "notebook-emprestimo.firebasestorage.app",
            messagingSenderId: "1007063409338",
            appId: "1:1007063409338:web:5538614ffa1eaf315e5883",
            measurementId: "G-56H4W8HG9Z"
        };

        // Inicializar Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        this.db = firebase.database();
        
        this.notebooks = [];
        this.emprestimos = [];
        this.setores = [];
        this.currentMonth = new Date();
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadDataFromFirebase();
        this.setupRealtimeListeners();
        this.renderAll();
        this.setMinDate();
    }

    // Carrega dados iniciais do Firebase
    async loadDataFromFirebase() {
        try {
            // Carrega notebooks
            const notebooksSnapshot = await this.db.ref('notebooks').once('value');
            this.notebooks = notebooksSnapshot.val() || this.getDefaultNotebooks();
            
            // Carrega empréstimos
            const emprestimosSnapshot = await this.db.ref('emprestimos').once('value');
            this.emprestimos = Object.values(emprestimosSnapshot.val() || {});
            
            // Carrega setores
            const setoresSnapshot = await this.db.ref('setores').once('value');
            this.setores = setoresSnapshot.val() || this.getDefaultSetores();
            
            // Se não há dados, inicializa com padrão
            if (!notebooksSnapshot.exists()) {
                await this.saveNotebooksToFirebase();
            }
            if (!setoresSnapshot.exists()) {
                await this.db.ref('setores').set(this.setores);
            }
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.showToast('Erro ao carregar dados do servidor', 'error');
            this.loadLocalData(); // Fallback para localStorage
        }
    }

    // Configura listeners em tempo real
    setupRealtimeListeners() {
        // Listener para notebooks
        this.db.ref('notebooks').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                this.notebooks = Array.isArray(data) ? data : Object.values(data);
                this.renderDashboard();
                this.renderListaNotebooksEdicao();
                this.updateNotebookOptions();
                this.updateStats();
            }
        });

        // Listener para empréstimos
        this.db.ref('emprestimos').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                this.emprestimos = Array.isArray(data) ? data : Object.values(data);
                this.renderDashboard();
                this.renderCalendario();
                this.renderHistorico();
                this.updateStats();
            }
        });

        // Listener para setores
        this.db.ref('setores').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                this.setores = Array.isArray(data) ? data : data;
                this.renderSetores();
                this.updateSetorOptions();
            }
        });
    }

    // Salva notebooks no Firebase
    async saveNotebooksToFirebase() {
        try {
            await this.db.ref('notebooks').set(this.notebooks);
        } catch (error) {
            console.error('Erro ao salvar notebooks:', error);
            this.showToast('Erro ao salvar no servidor', 'error');
        }
    }

    // Salva empréstimo no Firebase
    async saveEmprestimoToFirebase(emprestimo) {
        try {
            await this.db.ref(`emprestimos/${emprestimo.id}`).set(emprestimo);
        } catch (error) {
            console.error('Erro ao salvar empréstimo:', error);
            this.showToast('Erro ao salvar empréstimo', 'error');
        }
    }

    // Salva setores no Firebase
    async saveSetoresToFirebase() {
        try {
            await this.db.ref('setores').set(this.setores);
        } catch (error) {
            console.error('Erro ao salvar setores:', error);
            this.showToast('Erro ao salvar setores', 'error');
        }
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

        // Reset do formulário
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

        // Filtros do histórico
        document.getElementById('filtroNome').addEventListener('input', () => this.renderHistorico());
        document.getElementById('filtroSetor').addEventListener('change', () => this.renderHistorico());
        document.getElementById('filtroMes').addEventListener('change', () => this.renderHistorico());

        // Modal
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        document.getElementById('confirmarDevolucao').addEventListener('click', () => {
            this.confirmarDevolucao();
        });

        // Fechar modal ao clicar fora
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Tecla ESC para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Adicionar setor com Enter
        document.getElementById('novoSetor').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.adicionarSetor();
            }
        });

        // Event listeners para edição de notebooks
        document.getElementById('salvarEdicaoNotebook').addEventListener('click', () => {
            this.salvarEdicaoNotebook();
        });

        document.getElementById('gerarNotebooksLote').addEventListener('click', () => {
            this.gerarNotebooksLote();
        });

        // Event listeners para novas funcionalidades
        document.getElementById('salvarEdicaoMassa').addEventListener('click', () => {
            this.salvarEdicaoMassa();
        });

        document.getElementById('confirmarAdicionarNotebook').addEventListener('click', () => {
            this.confirmarAdicionarNotebook();
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

    updateSetorOptions() {
        // Atualiza select de setores no formulário
        const selectSetor = document.getElementById('setorColaborador');
        if (selectSetor) {
            const valorAtual = selectSetor.value;
            selectSetor.innerHTML = '<option value="">Selecione o setor</option>';
            this.setores.forEach(setor => {
                const option = document.createElement('option');
                option.value = setor;
                option.textContent = setor;
                selectSetor.appendChild(option);
            });
            selectSetor.value = valorAtual;
        }

        // Atualiza filtro de setores no histórico
        const filtroSetor = document.getElementById('filtroSetor');
        if (filtroSetor) {
            const valorAtual = filtroSetor.value;
            filtroSetor.innerHTML = '<option value="">Todos os setores</option>';
            this.setores.forEach(setor => {
                const option = document.createElement('option');
                option.value = setor;
                option.textContent = setor;
                filtroSetor.appendChild(option);
            });
            filtroSetor.value = valorAtual;
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

    // Atualiza a função criarSolicitacao para usar Firebase
    async criarSolicitacao() {
        const nome = document.getElementById('nomeColaborador').value.trim();
        const setor = document.getElementById('setorColaborador').value;
        const notebookId = parseInt(document.getElementById('notebookSelecionado').value);
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

        const notebookSelecionado = this.notebooks.find(nb => nb.id === notebookId && nb.status === 'disponivel');
        if (!notebookSelecionado) {
            this.showToast('O notebook selecionado não está mais disponível!', 'error');
            this.updateNotebookOptions();
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

        // Atualiza notebook
        notebookSelecionado.status = 'emprestado';
        notebookSelecionado.colaborador = nome;
        notebookSelecionado.setor = setor;
        notebookSelecionado.chamado = chamado;
        notebookSelecionado.dataEntrega = agora.toISOString();
        notebookSelecionado.previsaoDevolucao = previsaoDevolucao;

        try {
            // Salva no Firebase
            await this.saveNotebooksToFirebase();
            await this.saveEmprestimoToFirebase(emprestimo);
            
            document.getElementById('formSolicitacao').reset();
            this.setMinDate();
            this.showToast(`Notebook ${notebookSelecionado.numero} emprestado com sucesso para ${nome}!`, 'success');
            this.switchTab('dashboard');
        } catch (error) {
            this.showToast('Erro ao processar empréstimo', 'error');
        }
    }

    renderDashboard() {
        const container = document.getElementById('notebooksContainer');
        container.innerHTML = this.notebooks.map(notebook => {
            const isAtrasado = notebook.status === 'emprestado' && this.isAtrasado(notebook.previsaoDevolucao);
            
            return `
                <div class="notebook-card ${notebook.status}" onclick="sistema.mostrarDetalhesNotebook(${notebook.id})">
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
                            <button class="btn-danger btn-small" onclick="event.stopPropagation(); sistema.abrirModalDevolucao(${notebook.id})">
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
                    <div class="emprestimo-item" onclick="sistema.mostrarDetalhesEmprestimo(${emprestimo.id})">
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
                         title="${emp.colaborador} - ${notebook ? notebook.numero : 'N/A'} - ${emp.chamado}"
                         onclick="sistema.mostrarDetalhesEmprestimo(${emp.id})">
                        ${nomeAbrev} - ${notebook ? notebook.numero : 'N/A'}
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

    renderHistorico() {
        const filtroNome = document.getElementById('filtroNome').value.toLowerCase();
        const filtroSetor = document.getElementById('filtroSetor').value;
        const filtroMes = document.getElementById('filtroMes').value;

        let emprestimosFiltered = [...this.emprestimos];

        // Aplica filtros
        if (filtroNome.trim()) {
            emprestimosFiltered = emprestimosFiltered.filter(emp => 
                emp.colaborador.toLowerCase().includes(filtroNome)
            );
        }

        if (filtroSetor) {
            emprestimosFiltered = emprestimosFiltered.filter(emp => emp.setor === filtroSetor);
        }

        if (filtroMes) {
            emprestimosFiltered = emprestimosFiltered.filter(emp => {
                const dataEntrega = new Date(emp.dataEntrega);
                const mesAno = `${dataEntrega.getFullYear()}-${(dataEntrega.getMonth() + 1).toString().padStart(2, '0')}`;
                return mesAno === filtroMes;
            });
        }

        // Ordena por data mais recente
        emprestimosFiltered.sort((a, b) => new Date(b.dataEntrega) - new Date(a.dataEntrega));

        const tbody = document.getElementById('historicoTableBody');
        
        if (emprestimosFiltered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; opacity: 0.7;">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; color: var(--primary-orange);"></i><br>
                        Nenhum empréstimo encontrado
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = emprestimosFiltered.map(emprestimo => {
                const notebook = this.notebooks.find(nb => nb.id === emprestimo.notebookId);
                let statusClass = 'status-ativo';
                let statusText = 'Ativo';
                
                if (emprestimo.status === 'devolvido') {
                    statusClass = 'status-devolvido';
                    statusText = 'Devolvido';
                } else if (emprestimo.status === 'ativo') {
                    const previsao = new Date(emprestimo.previsaoDevolucao);
                    const hoje = new Date();
                    if (previsao < hoje) {
                        statusClass = 'status-atrasado';
                        statusText = 'Atrasado';
                    }
                }

                return `
                    <tr onclick="sistema.mostrarDetalhesEmprestimo(${emprestimo.id})">
                        <td><strong>${notebook ? notebook.numero : 'N/A'}</strong></td>
                        <td>${emprestimo.colaborador}</td>
                        <td>${emprestimo.setor}</td>
                        <td>${emprestimo.chamado}</td>
                        <td>${this.formatDateTime(emprestimo.dataEntrega)}</td>
                        <td>${emprestimo.dataDevolucao ? this.formatDateTime(emprestimo.dataDevolucao) : '-'}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    </tr>
                `;
            }).join('');
        }
    }

    renderSetores() {
        const container = document.getElementById('setoresList');
        container.innerHTML = this.setores.map(setor => `
            <div class="setor-item">
                <span>${setor}</span>
                <button class="setor-remove" onclick="sistema.removerSetor('${setor}')" title="Remover setor">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

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

    async adicionarSetor() {
        const input = document.getElementById('novoSetor');
        const novoSetor = input.value.trim();

        if (!novoSetor) {
            this.showToast('Digite o nome do setor!', 'error');
            return;
        }

        if (this.setores.includes(novoSetor)) {
            this.showToast('Este setor já existe!', 'warning');
            return;
        }

        this.setores.push(novoSetor);
        await this.saveSetoresToFirebase();
        input.value = '';
        this.showToast('Setor adicionado com sucesso!', 'success');
    }

    async removerSetor(setor) {
        if (confirm(`Tem certeza que deseja remover o setor "${setor}"?`)) {
            this.setores = this.setores.filter(s => s !== setor);
            await this.saveSetoresToFirebase();
            this.showToast('Setor removido com sucesso!', 'success');
        }
    }

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

    mostrarDetalhesEmprestimo(emprestimoId) {
        const emprestimo = this.emprestimos.find(emp => emp.id === emprestimoId);
        const notebook = this.notebooks.find(nb => nb.id === emprestimo.notebookId);

        let detalhesHtml = `
            <div class="detalhe-item">
                <span class="detalhe-label">Notebook:</span>
                <span class="detalhe-valor">${notebook ? notebook.numero : 'N/A'}</span>
            </div>
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
            <div class="detalhe-item">
                <span class="detalhe-label">Status:</span>
                <span class="detalhe-valor">
                    <span class="status-badge ${emprestimo.status === 'devolvido' ? 'status-devolvido' : this.isAtrasado(emprestimo.previsaoDevolucao) ? 'status-atrasado' : 'status-ativo'}">
                        ${emprestimo.status === 'devolvido' ? 'Devolvido' : this.isAtrasado(emprestimo.previsaoDevolucao) ? 'Atrasado' : 'Ativo'}
                    </span>
                </span>
            </div>
        `;

        if (emprestimo.dataDevolucao) {
            detalhesHtml += `
                <div class="detalhe-item">
                    <span class="detalhe-label">Data Devolução:</span>
                    <span class="detalhe-valor">${this.formatDateTime(emprestimo.dataDevolucao)}</span>
                </div>
            `;
        }

        if (emprestimo.observacoesDevolucao) {
            detalhesHtml += `
                <div class="detalhe-item">
                    <span class="detalhe-label">Observações:</span>
                    <span class="detalhe-valor">${emprestimo.observacoesDevolucao}</span>
                </div>
            `;
        }

        document.getElementById('detalhesEmprestimo').innerHTML = detalhesHtml;
        document.getElementById('modalDetalhes').classList.add('active');
    }

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

    async salvarEdicaoNotebook() {
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

        await this.saveNotebooksToFirebase();
        this.closeModal();
        this.showToast('Notebook atualizado com sucesso!', 'success');
    }

    abrirModalGerarLote() {
        document.getElementById('modalGerarLote').classList.add('active');
    }

    async gerarNotebooksLote() {
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
        await this.saveNotebooksToFirebase();
        this.closeModal();
        this.showToast('Notebooks gerados com sucesso!', 'success');
    }

    abrirModalEdicaoMassa() {
        this.renderListaEdicaoMassa();
        document.getElementById('modalEdicaoMassa').classList.add('active');
    }

    renderListaEdicaoMassa() {
        const container = document.getElementById('listaEdicaoMassa');
        if (!container) return;

        container.innerHTML = this.notebooks.map((notebook, index) => `
            <div style="display: grid; grid-template-columns: 150px 1fr 1fr 1fr; gap: 15px; align-items: center; padding: 15px; margin-bottom: 10px; background: var(--dark-gray); border-radius: 8px; border-left: 4px solid ${notebook.status === 'disponivel' ? 'var(--success)' : 'var(--danger)'};">
                <div>
                    <strong style="color: var(--primary-orange);">${notebook.numero}</strong><br>
                    <small style="color: ${notebook.status === 'disponivel' ? 'var(--success)' : 'var(--danger)'};">
                        ${notebook.status === 'disponivel' ? 'Disponível' : 'Em Uso'}
                    </small>
                </div>
                <div>
                    <label style="font-size: 0.8rem; color: var(--light-orange);">Série:</label>
                    <input type="text" 
                           class="massa-serie" 
                           data-notebook-id="${notebook.id}"
                           value="${notebook.serie}" 
                           ${notebook.status !== 'disponivel' ? 'disabled' : ''}
                           style="width: 100%; padding: 8px; border: 1px solid var(--medium-gray); border-radius: 4px; background: ${notebook.status !== 'disponivel' ? 'var(--medium-gray)' : 'var(--black)'}; color: var(--white); font-size: 0.9rem;">
                </div>
                <div>
                    <label style="font-size: 0.8rem; color: var(--light-orange);">RFID:</label>
                    <input type="text" 
                           class="massa-rfid" 
                           data-notebook-id="${notebook.id}"
                           value="${notebook.rfid}" 
                           ${notebook.status !== 'disponivel' ? 'disabled' : ''}
                           style="width: 100%; padding: 8px; border: 1px solid var(--medium-gray); border-radius: 4px; background: ${notebook.status !== 'disponivel' ? 'var(--medium-gray)' : 'var(--black)'}; color: var(--white); font-size: 0.9rem;">
                </div>
                <div>
                    <label style="font-size: 0.8rem; color: var(--light-orange);">Modelo:</label>
                    <input type="text" 
                           class="massa-modelo" 
                           data-notebook-id="${notebook.id}"
                           value="${notebook.modelo || ''}" 
                           ${notebook.status !== 'disponivel' ? 'disabled' : ''}
                           style="width: 100%; padding: 8px; border: 1px solid var(--medium-gray); border-radius: 4px; background: ${notebook.status !== 'disponivel' ? 'var(--medium-gray)' : 'var(--black)'}; color: var(--white); font-size: 0.9rem;"
                           placeholder="Ex: Dell Latitude">
                </div>
            </div>
        `).join('');
    }

    aplicarPadrao() {
        if (!confirm('Aplicar numeração sequencial automática para série e RFID?')) {
            return;
        }

        document.querySelectorAll('.massa-serie').forEach((input, index) => {
            if (!input.disabled) {
                input.value = `${Math.floor(Math.random() * 9000) + 1000}DD3`;
            }
        });

        document.querySelectorAll('.massa-rfid').forEach((input, index) => {
            if (!input.disabled) {
                input.value = `RF${(300000 + parseInt(input.dataset.notebookId)).toString()}`;
            }
        });

        this.showToast('Padrão aplicado! Revise os dados antes de salvar.', 'success');
    }

    async salvarEdicaoMassa() {
        if (!confirm('Salvar todas as alterações? Esta ação não pode ser desfeita.')) {
            return;
        }

        let alteracoes = 0;

        // Coleta todos os valores
        const novosDados = {};
        document.querySelectorAll('.massa-serie').forEach(input => {
            if (!input.disabled) {
                novosDados[input.dataset.notebookId] = {
                    serie: input.value.trim(),
                    rfid: document.querySelector(`.massa-rfid[data-notebook-id="${input.dataset.notebookId}"]`).value.trim(),
                    modelo: document.querySelector(`.massa-modelo[data-notebook-id="${input.dataset.notebookId}"]`).value.trim()
                };
            }
        });

        // Validações
        const series = Object.values(novosDados).map(d => d.serie).filter(s => s);
        const rfids = Object.values(novosDados).map(d => d.rfid).filter(r => r);
        
        if (series.length !== new Set(series).size) {
            this.showToast('Erro: Existem números de série duplicados!', 'error');
            return;
        }
        
        if (rfids.length !== new Set(rfids).size) {
            this.showToast('Erro: Existem RFIDs duplicados!', 'error');
            return;
        }

        // Aplica as alterações
        Object.keys(novosDados).forEach(notebookId => {
            const notebook = this.notebooks.find(nb => nb.id == notebookId);
            const dados = novosDados[notebookId];
            
            if (notebook && notebook.status === 'disponivel') {
                if (dados.serie) notebook.serie = dados.serie;
                if (dados.rfid) notebook.rfid = dados.rfid;
                if (dados.modelo) notebook.modelo = dados.modelo;
                alteracoes++;
            }
        });

        await this.saveNotebooksToFirebase();
        this.closeModal();
        this.showToast(`${alteracoes} notebooks atualizados com sucesso!`, 'success');
    }

    abrirModalAdicionarNotebook() {
        // Sugere próximo número disponível
        const maiorNumero = Math.max(...this.notebooks.map(nb => {
            const match = nb.numero.match(/(\d+)$/);
            return match ? parseInt(match[1]) : 0;
        }));
        
        document.getElementById('novoNumero').value = `EMPRESTIMO_${(maiorNumero + 1).toString().padStart(2, '0')}`;
        document.getElementById('novaSerie').value = '';
        document.getElementById('novoRfid').value = '';
        document.getElementById('novoModelo').value = '';
        document.getElementById('novoProcessador').value = '';
        document.getElementById('novaMemoria').value = '';
        document.getElementById('novaDescricao').value = '';
        
        document.getElementById('modalAdicionarNotebook').classList.add('active');
    }

    async confirmarAdicionarNotebook() {
        const numero = document.getElementById('novoNumero').value.trim();
        const serie = document.getElementById('novaSerie').value.trim();
        const rfid = document.getElementById('novoRfid').value.trim();
        const modelo = document.getElementById('novoModelo').value.trim();
        const processador = document.getElementById('novoProcessador').value.trim();
        const memoria = document.getElementById('novaMemoria').value.trim();
        const descricao = document.getElementById('novaDescricao').value.trim();

        // Validações
        if (!numero || !serie || !rfid) {
            this.showToast('Número, Série e RFID são obrigatórios!', 'error');
            return;
        }

        // Verifica duplicatas
        const numeroExistente = this.notebooks.find(nb => nb.numero === numero);
        const rfidExistente = this.notebooks.find(nb => nb.rfid === rfid);

        if (numeroExistente) {
            this.showToast('Já existe um notebook com este número!', 'error');
            return;
        }

        if (rfidExistente) {
            this.showToast('Já existe um notebook com este RFID!', 'error');
            return;
        }

        // Cria novo ID
        const novoId = Math.max(...this.notebooks.map(nb => nb.id)) + 1;

        // Adiciona novo notebook
        const novoNotebook = {
            id: novoId,
            numero: numero,
            serie: serie,
            rfid: rfid,
            modelo: modelo,
            processador: processador,
            memoria: memoria,
            descricao: descricao,
            dataCadastro: new Date().toISOString(),
            status: 'disponivel',
            colaborador: null,
            setor: null,
            chamado: null,
            dataEntrega: null,
            previsaoDevolucao: null
        };

        this.notebooks.push(novoNotebook);
        await this.saveNotebooksToFirebase();
        this.closeModal();
        this.showToast(`Notebook ${numero} adicionado com sucesso!`, 'success');
    }

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

    importarConfiguracao(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
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
                    await this.saveSetoresToFirebase();
                }

                await this.saveNotebooksToFirebase();
                this.showToast('Configuração importada com sucesso!', 'success');
            } catch (error) {
                this.showToast('Erro ao importar configuração!', 'error');
            }
        };
        
        reader.readAsText(file);
        input.value = ''; // Limpa o input
    }

    async resetarNotebooks() {
        if (!confirm('Tem certeza? Esta ação irá resetar todos os notebooks disponíveis para o padrão.')) {
            return;
        }

        // Preserva notebooks em uso
        const notebooksEmUso = this.notebooks.filter(nb => nb.status === 'emprestado');
        
        // Recria notebooks padrão
        this.notebooks = this.getDefaultNotebooks();
        
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

        await this.saveNotebooksToFirebase();
        this.showToast('Notebooks resetados para o padrão!', 'success');
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

    // Atualiza função de devolução
    async confirmarDevolucao() {
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

        try {
            await this.saveNotebooksToFirebase();
            await this.saveEmprestimoToFirebase(emprestimo);
            
            this.closeModal();
            this.showToast(`Notebook ${notebook.numero} devolvido com sucesso!`, 'success');
        } catch (error) {
            this.showToast('Erro ao processar devolução', 'error');
        }
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.getElementById('observacoesDevolucao').value = '';
    }

    updateStats() {
        const disponiveisCount = this.notebooks.filter(nb => nb.status === 'disponivel').length;
        const emprestadosCount = this.notebooks.filter(nb => nb.status === 'emprestado').length;
        const totalCount = this.notebooks.length;
        
        document.getElementById('disponiveisCount').textContent = disponiveisCount;
        document.getElementById('emprestadosCount').textContent = emprestadosCount;
        
        // Atualiza contadores na aba setores se existirem
        const totalEl = document.getElementById('totalNotebooks');
        const disponiveisEl = document.getElementById('disponiveis');
        const emUsoEl = document.getElementById('emUso');
        
        if (totalEl) totalEl.textContent = totalCount;
        if (disponiveisEl) disponiveisEl.textContent = disponiveisCount;
        if (emUsoEl) emUsoEl.textContent = emprestadosCount;
    }

    // Fallback para localStorage se Firebase falhar
    loadLocalData() {
        this.notebooks = JSON.parse(localStorage.getItem('notebooks')) || this.getDefaultNotebooks();
        this.emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];
        this.setores = JSON.parse(localStorage.getItem('setores')) || this.getDefaultSetores();
    }

    getDefaultNotebooks() {
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
        return notebooks;
    }

    getDefaultSetores() {
        return [
            "Dados Mestre",
            "Customer Service", 
            "T.I",
            "CD VERA CRUZ",
            "Suprimentos",
            "ADM RH",
            "Logística",
            "Controladoria Fiscal"
        ];
    }

    renderAll() {
        this.renderDashboard();
        this.renderCalendario();
        this.renderHistorico();
        this.renderSetores();
        this.renderListaNotebooksEdicao();
        this.updateNotebookOptions();
        this.updateSetorOptions();
        this.updateStats();
    }

    isAtrasado(previsaoDevolucao) {
        if (!previsaoDevolucao) return false;
        const previsao = new Date(previsaoDevolucao);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        previsao.setHours(0, 0, 0, 0);
        return previsao < hoje;
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

    formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR') + ' às ' + 
               date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    }
}
