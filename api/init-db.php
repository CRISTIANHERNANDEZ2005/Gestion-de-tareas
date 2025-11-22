<?php
// Endpoint para inicializar la base de datos en Vercel
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../php/conexion.php';

try {
    // La conexión ya crea la tabla si no existe, así que solo necesitamos confirmar que funciona
    $sql = "SELECT COUNT(*) as count FROM tareas";
    $stmt = ejecutarConsulta($conexion, $sql);
    $result = $stmt->fetch();
    
    // Determine which database type we're using
    $dbType = (isset($_ENV['VERCEL']) && $_ENV['VERCEL'] === '1') ? 'PostgreSQL' : 'SQLite';
    
    echo json_encode([
        'success' => true,
        'message' => 'Base de datos inicializada correctamente',
        'taskCount' => $result['count'],
        'databaseType' => $dbType
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al inicializar la base de datos: ' . $e->getMessage()
    ]);
}
?>