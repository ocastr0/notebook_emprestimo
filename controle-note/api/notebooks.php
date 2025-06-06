<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../classes/NotebookSystem.php';

$system = new NotebookSystem();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] == 'disponiveis') {
            echo json_encode($system->getNotebooksDisponiveis());
        } elseif (isset($_GET['id'])) {
            echo json_encode($system->getNotebookById($_GET['id']));
        } else {
            echo json_encode($system->getNotebooks());
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['action']) && $data['action'] == 'add') {
            $result = $system->addNotebook($data);
            echo json_encode(['success' => $result]);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $result = $system->updateNotebook($data['id'], $data);
        echo json_encode(['success' => $result]);
        break;
}
?>
