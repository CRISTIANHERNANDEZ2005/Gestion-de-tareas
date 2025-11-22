<?php
// Test script using the updated connection logic from conexion.php

// Load environment variables from .env file if it exists
if (file_exists(__DIR__ . '/.env')) {
    $env = file_get_contents(__DIR__ . '/.env');
    $lines = explode("\n", $env);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value));
        }
    }
}

// Simulate Vercel environment
$_ENV['VERCEL'] = '1';

$DATABASE_URL = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL');
if (!$DATABASE_URL) {
    die("Error: No se encontró la variable de entorno DATABASE_URL");
}

echo "Using DATABASE_URL: " . $DATABASE_URL . "\n";

try {
    // Parsear la URL de conexión de PostgreSQL
    $url = parse_url($DATABASE_URL);
    
    $host = $url['host'];
    $port = $url['port'] ?? '5432';
    $dbname = ltrim($url['path'], '/');
    $user = $url['user'];
    $password = $url['pass'];
    
    // Usar directamente los parámetros de la URL
    $query = isset($url['query']) ? '?' . $url['query'] : '';
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname$query";
    
    echo "DSN: " . $dsn . "\n";
    
    $opciones = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    $conexion = new PDO($dsn, $user, $password, $opciones);
    echo "Connected to PostgreSQL database successfully!\n";
    
    // Test query
    $stmt = $conexion->query("SELECT version()");
    $version = $stmt->fetchColumn();
    echo "PostgreSQL version: " . $version . "\n";
    
} catch (PDOException $e) {
    echo "Failed to connect to PostgreSQL: " . $e->getMessage() . "\n";
}
?>