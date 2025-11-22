<?php
header('Content-Type: application/json');
require_once 'conexion.php';

try {
    $sql = "SELECT id, titulo, descripcion, fecha_limite FROM tareas ORDER BY fecha_limite ASC";
    $stmt = ejecutarConsulta($conexion, $sql);
    $tareas = $stmt->fetchAll();
    
    // Format the date for each task to ensure consistency
    foreach ($tareas as &$tarea) {
        // Handle date formatting for both SQLite and PostgreSQL
        if ($tarea['fecha_limite']) {
            $tarea['fecha_limite'] = date('Y-m-d', strtotime($tarea['fecha_limite']));
        }
    }
    
    echo json_encode($tareas);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error al obtener las tareas: ' . $e->getMessage()]);
}
?>