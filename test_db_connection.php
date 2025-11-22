<?php
// Test script to verify database connection
// Load environment variables from .env file if it exists
if (file_exists(__DIR__ . '/.env')) {
    $env = file_get_contents(__DIR__ . '/.env');
    $lines = explode("\n", $env);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Simulate Vercel environment to force PostgreSQL connection
$_ENV['VERCEL'] = '1';

// Debug: Show if DATABASE_URL is set
echo "DATABASE_URL is set: " . (isset($_ENV['DATABASE_URL']) ? 'Yes' : 'No') . "\n";
if (isset($_ENV['DATABASE_URL'])) {
    echo "DATABASE_URL value: " . $_ENV['DATABASE_URL'] . "\n";
}

// Include required functions
require_once 'php/conexion.php';

// Define the missing function for testing purposes
function enviarRespuestaError($mensaje) {
    throw new Exception($mensaje);
}

try {
    // Check which database we're using
    if (isset($_ENV['VERCEL']) && $_ENV['VERCEL'] === '1') {
        echo "Using PostgreSQL (Vercel environment)\n";
        $sql = "SELECT version() as db_version";
    } else {
        echo "Using SQLite (Local environment)\n";
        $sql = "SELECT sqlite_version() as db_version";
    }
    
    $stmt = ejecutarConsulta($conexion, $sql);
    $result = $stmt->fetch();
    
    echo "Database connection successful!\n";
    echo "Database version: " . ($result['db_version'] ?? 'Unknown') . "\n";
    
    // Test table creation
    $sql = "SELECT COUNT(*) as count FROM tareas";
    $stmt = ejecutarConsulta($conexion, $sql);
    $result = $stmt->fetch();
    
    echo "Tareas table exists with " . $result['count'] . " records\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>