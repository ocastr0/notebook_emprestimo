<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../classes/NotebookSystem.php';

$system = new NotebookSystem();
echo json_encode($system->getEstatisticas());
?>
