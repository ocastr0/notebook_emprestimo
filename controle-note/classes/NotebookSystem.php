<?php
require_once 'config/database.php';

class NotebookSystem {
    private $conn;
    private $notebooks_table = "notebooks";
    private $emprestimos_table = "emprestimos";
    private $setores_table = "setores";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    // ========== NOTEBOOKS ==========
    public function getNotebooks() {
        $query = "SELECT * FROM " . $this->notebooks_table . " ORDER BY numero";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getNotebookById($id) {
        $query = "SELECT * FROM " . $this->notebooks_table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getNotebooksDisponiveis() {
        $query = "SELECT * FROM " . $this->notebooks_table . " WHERE status = 'disponivel' ORDER BY numero";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateNotebook($id, $data) {
        $query = "UPDATE " . $this->notebooks_table . " SET 
                  numero = :numero, serie = :serie, rfid = :rfid, 
                  modelo = :modelo, processador = :processador, 
                  memoria = :memoria, descricao = :descricao 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':numero', $data['numero']);
        $stmt->bindParam(':serie', $data['serie']);
        $stmt->bindParam(':rfid', $data['rfid']);
        $stmt->bindParam(':modelo', $data['modelo']);
        $stmt->bindParam(':processador', $data['processador']);
        $stmt->bindParam(':memoria', $data['memoria']);
        $stmt->bindParam(':descricao', $data['descricao']);
        $stmt->bindParam(':id', $id);
        
        return $stmt->execute();
    }

    public function addNotebook($data) {
        $query = "INSERT INTO " . $this->notebooks_table . " 
                  (numero, serie, rfid, modelo, processador, memoria, descricao) 
                  VALUES (:numero, :serie, :rfid, :modelo, :processador, :memoria, :descricao)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':numero', $data['numero']);
        $stmt->bindParam(':serie', $data['serie']);
        $stmt->bindParam(':rfid', $data['rfid']);
        $stmt->bindParam(':modelo', $data['modelo']);
        $stmt->bindParam(':processador', $data['processador']);
        $stmt->bindParam(':memoria', $data['memoria']);
        $stmt->bindParam(':descricao', $data['descricao']);
        
        return $stmt->execute();
    }

    // ========== EMPRÉSTIMOS ==========
    public function criarEmprestimo($data) {
        try {
            $this->conn->beginTransaction();
            
            // Inserir empréstimo
            $query_emp = "INSERT INTO " . $this->emprestimos_table . " 
                          (id, notebook_id, colaborador, setor, chamado, motivo, 
                           data_entrega, previsao_devolucao) 
                          VALUES (:id, :notebook_id, :colaborador, :setor, :chamado, 
                                  :motivo, :data_entrega, :previsao_devolucao)";
            
            $stmt_emp = $this->conn->prepare($query_emp);
            $stmt_emp->bindParam(':id', $data['id']);
            $stmt_emp->bindParam(':notebook_id', $data['notebook_id']);
            $stmt_emp->bindParam(':colaborador', $data['colaborador']);
            $stmt_emp->bindParam(':setor', $data['setor']);
            $stmt_emp->bindParam(':chamado', $data['chamado']);
            $stmt_emp->bindParam(':motivo', $data['motivo']);
            $stmt_emp->bindParam(':data_entrega', $data['data_entrega']);
            $stmt_emp->bindParam(':previsao_devolucao', $data['previsao_devolucao']);
            $stmt_emp->execute();
            
            // Atualizar notebook
            $query_nb = "UPDATE " . $this->notebooks_table . " SET 
                         status = 'emprestado', colaborador = :colaborador, 
                         setor = :setor, chamado = :chamado, 
                         data_entrega = :data_entrega, previsao_devolucao = :previsao_devolucao 
                         WHERE id = :id";
            
            $stmt_nb = $this->conn->prepare($query_nb);
            $stmt_nb->bindParam(':colaborador', $data['colaborador']);
            $stmt_nb->bindParam(':setor', $data['setor']);
            $stmt_nb->bindParam(':chamado', $data['chamado']);
            $stmt_nb->bindParam(':data_entrega', $data['data_entrega']);
            $stmt_nb->bindParam(':previsao_devolucao', $data['previsao_devolucao']);
            $stmt_nb->bindParam(':id', $data['notebook_id']);
            $stmt_nb->execute();
            
            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollback();
            return false;
        }
    }

    public function devolverNotebook($notebook_id, $observacoes = '') {
        try {
            $this->conn->beginTransaction();
            
            // Atualizar empréstimo
            $query_emp = "UPDATE " . $this->emprestimos_table . " SET 
                          status = 'devolvido', data_devolucao = NOW(), 
                          observacoes_devolucao = :observacoes 
                          WHERE notebook_id = :notebook_id AND status = 'ativo'";
            
            $stmt_emp = $this->conn->prepare($query_emp);
            $stmt_emp->bindParam(':observacoes', $observacoes);
            $stmt_emp->bindParam(':notebook_id', $notebook_id);
            $stmt_emp->execute();
            
            // Atualizar notebook
            $query_nb = "UPDATE " . $this->notebooks_table . " SET 
                         status = 'disponivel', colaborador = NULL, setor = NULL, 
                         chamado = NULL, data_entrega = NULL, previsao_devolucao = NULL 
                         WHERE id = :id";
            
            $stmt_nb = $this->conn->prepare($query_nb);
            $stmt_nb->bindParam(':id', $notebook_id);
            $stmt_nb->execute();
            
            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollback();
            return false;
        }
    }

    public function getEmprestimosAtivos() {
        $query = "SELECT e.*, n.numero as notebook_numero 
                  FROM " . $this->emprestimos_table . " e 
                  JOIN " . $this->notebooks_table . " n ON e.notebook_id = n.id 
                  WHERE e.status = 'ativo' 
                  ORDER BY e.data_entrega DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getEmprestimosHistorico($filtros = []) {
        $query = "SELECT e.*, n.numero as notebook_numero 
                  FROM " . $this->emprestimos_table . " e 
                  JOIN " . $this->notebooks_table . " n ON e.notebook_id = n.id WHERE 1=1";
        
        $params = [];
        
        if (!empty($filtros['nome'])) {
            $query .= " AND e.colaborador LIKE :nome";
            $params[':nome'] = '%' . $filtros['nome'] . '%';
        }
        
        if (!empty($filtros['setor'])) {
            $query .= " AND e.setor = :setor";
            $params[':setor'] = $filtros['setor'];
        }
        
        if (!empty($filtros['mes'])) {
            $query .= " AND DATE_FORMAT(e.data_entrega, '%Y-%m') = :mes";
            $params[':mes'] = $filtros['mes'];
        }
        
        $query .= " ORDER BY e.data_entrega DESC";
        
        $stmt = $this->conn->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getEmprestimoById($id) {
        $query = "SELECT e.*, n.numero as notebook_numero 
                  FROM " . $this->emprestimos_table . " e 
                  JOIN " . $this->notebooks_table . " n ON e.notebook_id = n.id 
                  WHERE e.id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ========== SETORES ==========
    public function getSetores() {
        $query = "SELECT * FROM " . $this->setores_table . " ORDER BY nome";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addSetor($nome) {
        $query = "INSERT INTO " . $this->setores_table . " (nome) VALUES (:nome)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nome', $nome);
        return $stmt->execute();
    }

    public function removeSetor($nome) {
        $query = "DELETE FROM " . $this->setores_table . " WHERE nome = :nome";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nome', $nome);
        return $stmt->execute();
    }

    // ========== ESTATÍSTICAS ==========
    public function getEstatisticas() {
        $stats = [];
        
        // Total notebooks
        $query = "SELECT COUNT(*) as total FROM " . $this->notebooks_table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['total_notebooks'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Disponíveis
        $query = "SELECT COUNT(*) as total FROM " . $this->notebooks_table . " WHERE status = 'disponivel'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['disponiveis'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Em uso
        $query = "SELECT COUNT(*) as total FROM " . $this->notebooks_table . " WHERE status = 'emprestado'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['em_uso'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        return $stats;
    }
}
?>
