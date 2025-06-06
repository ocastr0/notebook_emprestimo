<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../classes/NotebookSystem.php';

$system = new NotebookSystem();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] == 'ativos') {
            echo json_encode($system->getEmprestimosAtivos());
        } elseif (isset($_GET['action']) && $_GET['action'] == 'historico') {
            $filtros = [];
            if (isset($_GET['nome'])) $filtros['nome'] = $_GET['nome'];
            if (isset($_GET['setor'])) $filtros['setor'] = $_GET['setor'];
            if (isset($_GET['mes'])) $filtros['mes'] = $_GET['mes'];
            
            echo json_encode($system->getEmprestimosHistorico($filtros));
        } elseif (isset($_GET['id'])) {
            echo json_encode($system->getEmprestimoById($_GET['id']));
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['action']) && $data['action'] == 'criar') {
            $emprestimo_data = [
                'id' => time() * 1000,
                'notebook_id' => $data['notebook_id'],
                'colaborador' => $data['colaborador'],
                'setor' => $data['setor'],
                'chamado' => $data['chamado'],
                'motivo' => $data['motivo'],
                'data_entrega' => date('Y-m-d H:i:s'),
                'previsao_devolucao' => $data['previsao_devolucao']
            ];
            
            $result = $system->criarEmprestimo($emprestimo_data);
            echo json_encode(['success' => $result]);
        } elseif (isset($data['action']) && $data['action'] == 'devolver') {
            $result = $system->devolverNotebook($data['notebook_id'], $data['observacoes']);
            echo json_encode(['success' => $result]);
        }
        break;
}
?>
