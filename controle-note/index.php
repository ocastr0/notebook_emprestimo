<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Empréstimos - Notebooks</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        /* Reset e Base */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-orange: #FF6B35;
            --dark-orange: #E55100;
            --light-orange: #FFB74D;
            --black: #1a1a1a;
            --dark-gray: #2c2c2c;
            --medium-gray: #404040;
            --light-gray: #f5f5f5;
            --white: #ffffff;
            --success: #4CAF50;
            --warning: #FFC107;
            --danger: #F44336;
            --info: #2196F3;
            --shadow: 0 4px 20px rgba(0,0,0,0.1);
            --shadow-hover: 0 8px 30px rgba(0,0,0,0.15);
            --border-radius: 12px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, var(--black) 0%, var(--dark-gray) 100%);
            color: var(--white);
            min-height: 100vh;
            line-height: 1.6;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, var(--primary-orange) 0%, var(--dark-orange) 100%);
            border-radius: var(--border-radius);
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: var(--shadow);
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--white);
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .header-stats {
            display: flex;
            gap: 20px;
        }

        .stat-card {
            background: rgba(255,255,255,0.15);
            padding: 20px;
            border-radius: var(--border-radius);
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            min-width: 120px;
        }

        .stat-number {
            display: block;
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--white);
        }

        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
        }

        /* Navigation */
        .nav-tabs {
            display: flex;
            background: var(--dark-gray);
            border-radius: var(--border-radius);
            padding: 10px;
            margin-bottom: 30px;
            box-shadow: var(--shadow);
            gap: 5px;
        }

        .tab-btn {
            flex: 1;
            padding: 15px 20px;
            background: transparent;
            border: none;
            color: var(--white);
            cursor: pointer;
            border-radius: calc(var(--border-radius) - 5px);
            font-size: 1rem;
            font-weight: 600;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .tab-btn:hover {
            background: rgba(255,107,53,0.1);
            color: var(--primary-orange);
        }

        .tab-btn.active {
            background: var(--primary-orange);
            color: var(--white);
        }

        /* Tab Content */
        .tab-content {
            display: none;
            animation: fadeIn 0.3s ease-in-out;
        }

        .tab-content.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Dashboard */
        .dashboard-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
        }

        .notebooks-grid h2,
        .emprestimos-ativos h2 {
            color: var(--primary-orange);
            margin-bottom: 20px;
            font-size: 1.8rem;
            font-weight: 700;
        }

        .notebooks-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }

        .notebook-card {
            background: var(--dark-gray);
            border-radius: var(--border-radius);
            padding: 25px;
            text-align: center;
            transition: var(--transition);
            border: 2px solid transparent;
            position: relative;
            cursor: pointer;
        }

        .notebook-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primary-orange);
        }

        .notebook-card.disponivel {
            border-color: var(--success);
        }

        .notebook-card.disponivel::before {
            background: var(--success);
        }

        .notebook-card.emprestado {
            border-color: var(--danger);
        }

        .notebook-card.emprestado::before {
            background: var(--danger);
        }

        .notebook-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-hover);
        }

        .notebook-icon {
            font-size: 3.5rem;
            margin-bottom: 15px;
            color: var(--primary-orange);
        }

        .notebook-number {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 12px;
        }

        .notebook-status {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 15px;
            display: inline-block;
        }

        .status-disponivel {
            background: var(--success);
            color: var(--white);
        }

        .status-emprestado {
            background: var(--danger);
            color: var(--white);
        }

        .notebook-info {
            font-size: 0.95rem;
            opacity: 0.85;
            margin-bottom: 20px;
            line-height: 1.5;
        }

        .notebook-info strong {
            color: var(--primary-orange);
        }

        .notebook-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
        }

        /* Empréstimos Ativos */
        .emprestimos-list {
            background: var(--dark-gray);
            border-radius: var(--border-radius);
            padding: 25px;
            max-height: 650px;
            overflow-y: auto;
        }

        .emprestimo-item {
            background: rgba(255,107,53,0.1);
            border: 1px solid var(--primary-orange);
            border-radius: var(--border-radius);
            padding: 20px;
            margin-bottom: 15px;
            transition: var(--transition);
            cursor: pointer;
        }

        .emprestimo-item:hover {
            background: rgba(255,107,53,0.2);
            transform: translateX(5px);
        }

        .emprestimo-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }

        .emprestimo-notebook {
            font-weight: 700;
            color: var(--primary-orange);
            font-size: 1.1rem;
        }

        .emprestimo-status {
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .status-ativo {
            background: var(--warning);
            color: var(--black);
        }

        .status-atrasado {
            background: var(--danger);
            color: var(--white);
        }

        .emprestimo-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 0.9rem;
        }

        .emprestimo-info > div {
            display: flex;
            flex-direction: column;
        }

        .emprestimo-info strong {
            color: var(--light-orange);
            font-size: 0.8rem;
            text-transform: uppercase;
        }

        /* Formulário */
        .form-container {
            background: var(--dark-gray);
            border-radius: var(--border-radius);
            padding: 40px;
            max-width: 700px;
            margin: 0 auto;
            box-shadow: var(--shadow);
        }

        .form-container h2 {
            color: var(--primary-orange);
            margin-bottom: 30px;
            text-align: center;
            font-size: 2rem;
        }

        .form-group {
            margin-bottom: 25px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--primary-orange);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 15px;
            border: 2px solid var(--medium-gray);
            border-radius: var(--border-radius);
            background: var(--black);
            color: var(--white);
            font-size: 1rem;
            transition: var(--transition);
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary-orange);
            box-shadow: 0 0 0 3px rgba(255,107,53,0.1);
        }

        .form-group small {
            color: var(--light-orange);
            font-size: 0.8rem;
            margin-top: 5px;
            display: block;
        }

        .form-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }

        /* Botões */
        .btn-primary,
        .btn-secondary,
        .btn-success,
        .btn-danger,
        .btn-info,
        .btn-warning {
            padding: 12px 24px;
            border: none;
            border-radius: var(--border-radius);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background: var(--primary-orange);
            color: var(--white);
        }

        .btn-primary:hover {
            background: var(--dark-orange);
            transform: translateY(-2px);
        }

        .btn-secondary {
            background: var(--black);
            color: var(--white);
            border: 2px solid var(--primary-orange);
        }

        .btn-secondary:hover {
            background: var(--primary-orange);
        }

        .btn-danger {
            background: var(--danger);
            color: var(--white);
        }

        .btn-danger:hover {
            background: #d32f2f;
            transform: translateY(-2px);
        }

        .btn-success {
            background: var(--success);
            color: var(--white);
        }

        .btn-info {
            background: var(--info);
            color: var(--white);
        }

        .btn-warning {
            background: var(--warning);
            color: var(--black);
        }

        .btn-small {
            padding: 8px 16px;
            font-size: 0.9rem;
        }

        /* Loading */
        .loading {
            text-align: center;
            padding: 40px;
            color: var(--primary-orange);
        }

        .loading i {
            font-size: 2rem;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Toast */
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: var(--border-radius);
            color: var(--white);
            font-weight: 600;
            z-index: 1001;
            animation: toastSlideIn 0.3s ease-out;
        }

        .toast.success { background: var(--success); }
        .toast.error { background: var(--danger); }
        .toast.warning { background: var(--warning); color: var(--black); }

        @keyframes toastSlideIn {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
        }

        /* Responsividade */
        @media (max-width: 768px) {
            .container { padding: 15px; }
            .header { padding: 20px; }
            .header-content { flex-direction: column; text-align: center; }
            .header h1 { font-size: 2rem; }
            .nav-tabs { flex-direction: column; }
            .dashboard-grid { grid-template-columns: 1fr; }
            .notebooks-container { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="header-content">
                <h1><i class="fas fa-laptop"></i> Sistema de Empréstimos</h1>
                <div class="header-stats">
                    <div class="stat-card">
                        <span class="stat-number" id="disponiveisCount">-</span>
                        <span class="stat-label">Disponíveis</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number" id="emprestadosCount">-</span>
                        <span class="stat-label">Em Uso</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Navigation -->
        <nav class="nav-tabs">
            <button class="tab-btn active" data-tab="dashboard">
                <i class="fas fa-home"></i> Dashboard
            </button>
            <button class="tab-btn" data-tab="solicitar">
                <i class="fas fa-plus"></i> Nova Solicitação
            </button>
            <button class="tab-btn" data-tab="historico">
                <i class="fas fa-history"></i> Histórico
            </button>
        </nav>

        <!-- Dashboard Tab -->
        <div class="tab-content active" id="dashboard">
            <div class="dashboard-grid">
                <div class="notebooks-grid">
                    <h2><i class="fas fa-laptop"></i> Status dos Notebooks</h2>
                    <div class="notebooks-container" id="notebooksContainer">
                        <div class="loading">
                            <i class="fas fa-spinner"></i>
                            <p>Carregando notebooks...</p>
                        </div>
                    </div>
                </div>
                
                <div class="emprestimos-ativos">
                    <h2><i class="fas fa-clipboard-list"></i> Empréstimos Ativos</h2>
                    <div class="emprestimos-list" id="emprestimosAtivos">
                        <div class="loading">
                            <i class="fas fa-spinner"></i>
                            <p>Carregando empréstimos...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Solicitar Tab -->
        <div class="tab-content" id="solicitar">
            <div class="form-container">
                <h2>Nova Solicitação de Empréstimo</h2>
                <form id="formSolicitacao">
                    <div class="form-group">
                        <label for="nomeColaborador">Nome do Colaborador:</label>
                        <input type="text" id="nomeColaborador" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="setorColaborador">Setor:</label>
                        <select id="setorColaborador" required>
                            <option value="">Carregando setores...</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="notebookSelecionado">Notebook Desejado:</label>
                        <select id="notebookSelecionado" required>
                            <option value="">Carregando notebooks...</option>
                        </select>
                        <small>
                            <i class="fas fa-info-circle"></i> Apenas notebooks disponíveis são exibidos
                        </small>
                    </div>
                    
                    <div class="form-group">
                        <label for="numeroChamado">Número do Chamado:</label>
                        <input type="text" id="numeroChamado" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="motivoEmprestimo">Motivo do Empréstimo:</label>
                        <textarea id="motivoEmprestimo" rows="3" required placeholder="Descreva o motivo da solicitação..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="dataPrevisaoDevolucao">Previsão de Devolução:</label>
                        <input type="date" id="dataPrevisaoDevolucao" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-check"></i> Solicitar Empréstimo
                        </button>
                        <button type="reset" class="btn-secondary">
                            <i class="fas fa-times"></i> Limpar
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Histórico Tab -->
        <div class="tab-content" id="historico">
            <div style="background: var(--dark-gray); border-radius: var(--border-radius); padding: 30px; box-shadow: var(--shadow);">
                <h2 style="color: var(--primary-orange); margin-bottom: 30px; text-align: center; font-size: 2rem;">Histórico de Empréstimos</h2>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; padding: 20px; background: var(--black); border-radius: var(--border-radius);">
                    <input type="text" id="filtroNome" placeholder="Filtrar por nome..." style="width: 100%; padding: 15px; border: 2px solid var(--medium-gray); border-radius: var(--border-radius); background: var(--black); color: var(--white);">
                    <select id="filtroSetor" style="width: 100%; padding: 15px; border: 2px solid var(--medium-gray); border-radius: var(--border-radius); background: var(--black); color: var(--white);">
                        <option value="">Todos os setores</option>
                    </select>
                    <input type="month" id="filtroMes" style="width: 100%; padding: 15px; border: 2px solid var(--medium-gray); border-radius: var(--border-radius); background: var(--black); color: var(--white);">
                </div>
                
                <div style="overflow-x: auto; border-radius: var(--border-radius);">
                    <table style="width: 100%; border-collapse: collapse; background: var(--black); border-radius: var(--border-radius); overflow: hidden;">
                        <thead>
                            <tr style="background: var(--primary-orange);">
                                <th style="padding: 15px; text-align: left; font-weight: 700; color: var(--white);">Notebook</th>
                                <th style="padding: 15px; text-align: left; font-weight: 700; color: var(--white);">Colaborador</th>
                                <th style="padding: 15px; text-align: left; font-weight: 700; color: var(--white);">Setor</th>
                                <th style="padding: 15px; text-align: left; font-weight: 700; color: var(--white);">Chamado</th>
                                <th style="padding: 15px; text-align: left; font-weight: 700; color: var(--white);">Entrega</th>
                                <th style="padding: 15px; text-align: left; font-weight: 700; color: var(--white);">Devolução</th>
                                <th style="padding: 15px; text-align: left; font-weight: 700; color: var(--white);">Status</th>
                            </tr>
                        </thead>
                        <tbody id="historicoTableBody">
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 40px;">
                                    <div class="loading">
                                        <i class="fas fa-spinner"></i>
                                        <p>Carregando histórico...</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        class SistemaEmprestimos {
            constructor() {
                this.notebooks = [];
                this.emprestimos = [];
                this.setores = [];
                this.init();
            }

            async init() {
                this.setupEventListeners();
                this.setMinDate();
                await this.loadAllData();
                this.startAutoRefresh();
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

                // Filtros do histórico
                document.getElementById('filtroNome').addEventListener('input', () => this.renderHistorico());
                document.getElementById('filtroSetor').addEventListener('change', () => this.renderHistorico());
                document.getElementById('filtroMes').addEventListener('change', () => this.renderHistorico());
            }

            async loadAllData() {
                try {
                    await Promise.all([
                        this.loadNotebooks(),
                        this.loadEmprestimosAtivos(),
                        this.loadSetores(),
                        this.loadStats()
                    ]);
                    
                    this.renderDashboard();
                    this.renderHistorico();
                    this.updateNotebookOptions();
                    this.updateSetorOptions();
                } catch (error) {
                    console.error('Erro ao carregar dados:', error);
                    this.showToast('Erro ao carregar dados do servidor', 'error');
                }
            }

            async loadNotebooks() {
                const response = await fetch('api/notebooks.php');
                this.notebooks = await response.json();
            }

            async loadEmprestimosAtivos() {
                const response = await fetch('api/emprestimos.php?action=ativos');
                this.emprestimosAtivos = await response.json();
            }

            async loadSetores() {
                const response = await fetch('api/setores.php');
                this.setores = await response.json();
            }

            async loadStats() {
                const response = await fetch('api/stats.php');
                const stats = await response.json();
                
                document.getElementById('disponiveisCount').textContent = stats.disponiveis;
                document.getElementById('emprestadosCount').textContent = stats.em_uso;
            }

            async loadHistorico() {
                const nome = document.getElementById('filtroNome').value;
                const setor = document.getElementById('filtroSetor').value;
                const mes = document.getElementById('filtroMes').value;
                
                const params = new URLSearchParams();
                params.append('action', 'historico');
                if (nome) params.append('nome', nome);
                if (setor) params.append('setor', setor);
                if (mes) params.append('mes', mes);
                
                const response = await fetch(`api/emprestimos.php?${params}`);
                return await response.json();
            }

            switchTab(tabName) {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

                document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
                document.getElementById(tabName).classList.add('active');

                if (tabName === 'historico') {
                    this.renderHistorico();
                }
            }

            setMinDate() {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                document.getElementById('dataPrevisaoDevolucao').min = tomorrow.toISOString().split('T')[0];
            }

            updateNotebookOptions() {
                const select = document.getElementById('notebookSelecionado');
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
                const selects = ['setorColaborador', 'filtroSetor'];
                
                selects.forEach(selectId => {
                    const select = document.getElementById(selectId);
                    if (select) {
                        const valorAtual = select.value;
                        const placeholder = selectId === 'filtroSetor' ? 'Todos os setores' : 'Selecione o setor';
                        
                        select.innerHTML = `<option value="">${placeholder}</option>`;
                        this.setores.forEach(setor => {
                            const option = document.createElement('option');
                            option.value = setor.nome;
                            option.textContent = setor.nome;
                            select.appendChild(option);
                        });
                        select.value = valorAtual;
                    }
                });
            }

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

                const data = {
                    action: 'criar',
                    notebook_id: notebookId,
                    colaborador: nome,
                    setor: setor,
                    chamado: chamado,
                    motivo: motivo,
                    previsao_devolucao: previsaoDevolucao
                };

                try {
                    const response = await fetch('api/emprestimos.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                        document.getElementById('formSolicitacao').reset();
                        this.setMinDate();
                        this.showToast('Empréstimo criado com sucesso!', 'success');
                        this.switchTab('dashboard');
                        await this.loadAllData();
                    } else {
                        this.showToast('Erro ao criar empréstimo', 'error');
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    this.showToast('Erro de conexão', 'error');
                }
            }

            async devolverNotebook(notebookId) {
                if (!confirm('Confirma a devolução deste notebook?')) return;
                
                const observacoes = prompt('Observações (opcional):') || '';
                
                const data = {
                    action: 'devolver',
                    notebook_id: notebookId,
                    observacoes: observacoes
                };

                try {
                    const response = await fetch('api/emprestimos.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                        this.showToast('Notebook devolvido com sucesso!', 'success');
                        await this.loadAllData();
                    } else {
                        this.showToast('Erro ao devolver notebook', 'error');
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    this.showToast('Erro de conexão', 'error');
                }
            }

            renderDashboard() {
                // Renderizar notebooks
                const container = document.getElementById('notebooksContainer');
                if (this.notebooks.length === 0) {
                    container.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Carregando notebooks...</p></div>';
                    return;
                }

                container.innerHTML = this.notebooks.map(notebook => {
                    const isAtrasado = notebook.status === 'emprestado' && this.isAtrasado(notebook.previsao_devolucao);
                    
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
                                    <small>Devolução: ${this.formatDate(notebook.previsao_devolucao)}</small>
                                </div>
                            ` : '<div class="notebook-info">Pronto para empréstimo</div>'}
                            <div class="notebook-actions">
                                ${notebook.status === 'emprestado' ? `
                                    <button class="btn-danger btn-small" onclick="sistema.devolverNotebook(${notebook.id})">
                                        <i class="fas fa-undo"></i> Devolver
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('');

                // Renderizar empréstimos ativos
                const emprestimosContainer = document.getElementById('emprestimosAtivos');
                if (!this.emprestimosAtivos || this.emprestimosAtivos.length === 0) {
                    emprestimosContainer.innerHTML = `
                        <div style="text-align: center; padding: 40px; opacity: 0.7;">
                            <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 15px; color: var(--primary-orange);"></i>
                            <p>Nenhum empréstimo ativo</p>
                        </div>
                    `;
                } else {
                    emprestimosContainer.innerHTML = this.emprestimosAtivos.map(emprestimo => {
                        const previsao = new Date(emprestimo.previsao_devolucao);
                        const hoje = new Date();
                        const isAtrasado = previsao < hoje;
                        const diasRestantes = Math.ceil((previsao - hoje) / (1000 * 60 * 60 * 24));
                        
                        return `
                            <div class="emprestimo-item">
                                <div class="emprestimo-header">
                                    <span class="emprestimo-notebook">${emprestimo.notebook_numero}</span>
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
                                    <div><strong>Devolução</strong><span>${this.formatDate(emprestimo.previsao_devolucao)}</span></div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }

            async renderHistorico() {
                const tbody = document.getElementById('historicoTableBody');
                tbody.innerHTML = '<tr><td colspan="7"><div class="loading"><i class="fas fa-spinner"></i><p>Carregando...</p></div></td></tr>';
                
                try {
                    const historico = await this.loadHistorico();
                    
                    if (historico.length === 0) {
                        tbody.innerHTML = `
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 40px; opacity: 0.7;">
                                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; color: var(--primary-orange);"></i><br>
                                    Nenhum empréstimo encontrado
                                </td>
                            </tr>
                        `;
                    } else {
                        tbody.innerHTML = historico.map(emprestimo => {
                            let statusClass = 'status-ativo';
                            let statusText = 'Ativo';
                            
                            if (emprestimo.status === 'devolvido') {
                                statusClass = 'status-devolvido';
                                statusText = 'Devolvido';
                            } else if (emprestimo.status === 'ativo') {
                                const previsao = new Date(emprestimo.previsao_devolucao);
                                const hoje = new Date();
                                if (previsao < hoje) {
                                    statusClass = 'status-atrasado';
                                    statusText = 'Atrasado';
                                }
                            }

                            return `
                                <tr style="cursor: pointer;" onclick="this.style.background = this.style.background ? '' : 'var(--dark-gray)'">
                                    <td style="padding: 15px; border-bottom: 1px solid var(--medium-gray);"><strong>${emprestimo.notebook_numero}</strong></td>
                                    <td style="padding: 15px; border-bottom: 1px solid var(--medium-gray);">${emprestimo.colaborador}</td>
                                    <td style="padding: 15px; border-bottom: 1px solid var(--medium-gray);">${emprestimo.setor}</td>
                                    <td style="padding: 15px; border-bottom: 1px solid var(--medium-gray);">${emprestimo.chamado}</td>
                                    <td style="padding: 15px; border-bottom: 1px solid var(--medium-gray);">${this.formatDateTime(emprestimo.data_entrega)}</td>
                                    <td style="padding: 15px; border-bottom: 1px solid var(--medium-gray);">${emprestimo.data_devolucao ? this.formatDateTime(emprestimo.data_devolucao) : '-'}</td>
                                    <td style="padding: 15px; border-bottom: 1px solid var(--medium-gray);"><span style="padding: 6px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase;" class="${statusClass}">${statusText}</span></td>
                                </tr>
                            `;
                        }).join('');
                    }
                } catch (error) {
                    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--danger);">Erro ao carregar histórico</td></tr>';
                }
            }

            startAutoRefresh() {
                // Atualiza dados a cada 30 segundos
                setInterval(async () => {
                    await this.loadAllData();
                }, 30000);
            }

            isAtrasado(previsaoDevolucao) {
                if (!previsaoDevolucao) return false;
                const previsao = new Date(previsaoDevolucao);
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                previsao.setHours(0, 0, 0, 0);
                return previsao < hoje;
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
        }

        // Inicializar sistema
        let sistema;
        document.addEventListener('DOMContentLoaded', function() {
            sistema = new SistemaEmprestimos();
        });
    </script>
</body>
</html>
