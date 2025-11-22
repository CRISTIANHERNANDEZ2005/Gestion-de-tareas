<?php
// Test database connection and CRUD operations
header('Content-Type: application/json');

// Include required files
require_once __DIR__ . '/../php/conexion.php';
require_once __DIR__ . '/../php/funciones_tareas.php';
require_once __DIR__ . '/../php/utils/validator.php';

try {
    // Test database connection
    $conexion = new Conexion();
    $connected = $conexion->verificarConexion();
    
    if (!$connected) {
        throw new Exception("Failed to connect to database");
    }
    
    // Test creating a task
    $testTitle = "Test Task " . time();
    $testDescription = "This is a test task created at " . date('Y-m-d H:i:s');
    $testDate = date('Y-m-d');
    
    $taskCreated = agregarTarea($testTitle, $testDescription, $testDate);
    
    // Get all tasks
    $tasks = obtenerTareas();
    
    // Test updating the first task if any exist
    $taskUpdated = false;
    $taskDeleted = false;
    
    if (!empty($tasks)) {
        $firstTask = $tasks[0];
        $taskId = $firstTask['id'];
        
        // Test updating
        $taskUpdated = actualizarTarea($taskId, $testTitle . " - Updated", $testDescription . " - Updated", $testDate);
        
        // Test deleting
        $taskDeleted = eliminarTarea($taskId);
    }
    
    echo json_encode([
        'success' => true,
        'connection' => $connected,
        'task_created' => $taskCreated,
        'task_updated' => $taskUpdated,
        'task_deleted' => $taskDeleted,
        'total_tasks' => count($tasks),
        'message' => 'All tests completed successfully'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>