<?php
// Display database information and test connection
header('Content-Type: text/plain');

require_once __DIR__ . '/../php/conexion.php';

echo "=== Database Connection Test ===\n\n";

try {
    $conexion = new Conexion();
    echo "Database Path: " . $conexion->db_path . "\n";
    echo "Database Directory: " . dirname($conexion->db_path) . "\n\n";
    
    // Check directory and file permissions
    $dbDir = dirname($conexion->db_path);
    echo "Directory exists: " . (is_dir($dbDir) ? "YES" : "NO") . "\n";
    echo "Directory writable: " . (is_writable($dbDir) ? "YES" : "NO") . "\n";
    echo "File exists: " . (file_exists($conexion->db_path) ? "YES" : "NO") . "\n";
    if (file_exists($conexion->db_path)) {
        echo "File writable: " . (is_writable($conexion->db_path) ? "YES" : "NO") . "\n";
    }
    
    echo "\n=== Testing Connection ===\n";
    $connected = $conexion->verificarConexion();
    echo "Connection successful: " . ($connected ? "YES" : "NO") . "\n";
    
    if ($connected) {
        echo "\n=== Testing Table Creation ===\n";
        // Try to create table
        $conexion->conectar();
        $sql = "CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, test TEXT)";
        $result = $conexion->conexion->exec($sql);
        echo "Table creation result: " . ($result !== false ? "SUCCESS" : "FAILED") . "\n";
        
        // Try to insert a test record
        echo "\n=== Testing Data Insertion ===\n";
        $sql = "INSERT OR REPLACE INTO test_table (id, test) VALUES (1, 'Test record at " . date('Y-m-d H:i:s') . "')";
        $result = $conexion->conexion->exec($sql);
        echo "Data insertion result: " . ($result !== false ? "SUCCESS" : "FAILED") . "\n";
        
        // Try to read the test record
        echo "\n=== Testing Data Retrieval ===\n";
        $sql = "SELECT * FROM test_table WHERE id = 1";
        $stmt = $conexion->conexion->query($sql);
        if ($stmt) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                echo "Data retrieval result: SUCCESS\n";
                print_r($row);
            } else {
                echo "Data retrieval result: NO DATA FOUND\n";
            }
        } else {
            echo "Data retrieval result: FAILED\n";
        }
        
        // Try to delete the test record
        echo "\n=== Testing Data Deletion ===\n";
        $sql = "DELETE FROM test_table WHERE id = 1";
        $result = $conexion->conexion->exec($sql);
        echo "Data deletion result: " . ($result !== false ? "SUCCESS" : "FAILED") . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Test Completed ===\n";
?>