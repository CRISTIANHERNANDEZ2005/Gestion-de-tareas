<?php
// Endpoint para inicializar la base de datos en Vercel
header('Content-Type: application/json');

require_once '../php/conexion.php';

try {
    // La conexión ya crea la tabla si no existe, así que solo necesitamos confirmar que funciona
    $sql = "SELECT COUNT(*) as count FROM tareas";
    $stmt = ejecutarConsulta($conexion, $sql);
    $result = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'Base de datos inicializada correctamente',
        'taskCount' => $result['count']
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al inicializar la base de datos: ' . $e->getMessage()
    ]);
}
?>