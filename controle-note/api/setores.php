<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../classes/NotebookSystem.php';

$system = new NotebookSystem();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        echo json_encode($system->getSetores());
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $result = $system->addSetor($data['nome']);
        echo json_encode(['success' => $result]);
        break;
        
    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $result = $system->removeSetor($data['nome']);
        echo json_encode(['success' => $result]);
        break;
}
?>
