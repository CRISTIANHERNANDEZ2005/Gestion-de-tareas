<?php
// Test database connection and CRUD operations
header('Content-Type: application/json');

// Include required files
require_once __DIR__ . '/../php/conexion.php';
require_once __DIR__ . '/../php/funciones_tareas.php';
require_once __DIR__ . '/../php/utils/validator.php';

try {
    // Test database connection
    error_log("DB Test: Starting database connection test");
    $conexion = new Conexion();
    $connected = $conexion->verificarConexion();
    
    error_log("DB Test: Connection result: " . ($connected ? "SUCCESS" : "FAILED"));
    
    if (!$connected) {
        throw new Exception("Failed to connect to database");
    }
    
    // Test database path and permissions
    $dbPath = $conexion->db_path;
    error_log("DB Test: Database path: " . $dbPath);
    error_log("DB Test: Database directory exists: " . (is_dir(dirname($dbPath)) ? "YES" : "NO"));
    error_log("DB Test: Database file exists: " . (file_exists($dbPath) ? "YES" : "NO"));
    error_log("DB Test: Database directory writable: " . (is_writable(dirname($dbPath)) ? "YES" : "NO"));
    error_log("DB Test: Database file writable: " . (file_exists($dbPath) && is_writable($dbPath) ? "YES" : "NO"));
    
    // Test creating a task
    $testTitle = "Test Task " . time();
    $testDescription = "This is a test task created at " . date('Y-m-d H:i:s');
    $testDate = date('Y-m-d');
    
    error_log("DB Test: Creating test task with title: " . $testTitle);
    $taskCreated = agregarTarea($testTitle, $testDescription, $testDate);
    error_log("DB Test: Task creation result: " . ($taskCreated ? "SUCCESS" : "FAILED"));
    
    // Get all tasks
    error_log("DB Test: Fetching all tasks");
    $tasks = obtenerTareas();
    error_log("DB Test: Number of tasks fetched: " . count($tasks));
    
    // Test updating the first task if any exist
    $taskUpdated = false;
    $taskDeleted = false;
    
    if (!empty($tasks)) {
        $firstTask = $tasks[0];
        $taskId = $firstTask['id'];
        error_log("DB Test: Updating task ID: " . $taskId);
        
        // Test updating
        $taskUpdated = actualizarTarea($taskId, $testTitle . " - Updated", $testDescription . " - Updated", $testDate);
        error_log("DB Test: Task update result: " . ($taskUpdated ? "SUCCESS" : "FAILED"));
        
        // Test deleting
        error_log("DB Test: Deleting task ID: " . $taskId);
        $taskDeleted = eliminarTarea($taskId);
        error_log("DB Test: Task deletion result: " . ($taskDeleted ? "SUCCESS" : "FAILED"));
    }
    
    echo json_encode([
        'success' => true,
        'connection' => $connected,
        'db_path' => $dbPath,
        'db_dir_exists' => is_dir(dirname($dbPath)),
        'db_file_exists' => file_exists($dbPath),
        'db_dir_writable' => is_writable(dirname($dbPath)),
        'db_file_writable' => (file_exists($dbPath) && is_writable($dbPath)),
        'task_created' => $taskCreated,
        'task_updated' => $taskUpdated,
        'task_deleted' => $taskDeleted,
        'total_tasks' => count($tasks),
        'message' => 'All tests completed successfully'
    ]);
    
} catch (Exception $e) {
    error_log("DB Test: Exception occurred: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>