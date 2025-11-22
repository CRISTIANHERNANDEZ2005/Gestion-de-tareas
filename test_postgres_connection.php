<?php
// Simple script to test PostgreSQL connection directly

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

$DATABASE_URL = getenv('DATABASE_URL');
if (!$DATABASE_URL) {
    die("Error: DATABASE_URL environment variable not set\n");
}

echo "Using DATABASE_URL: " . $DATABASE_URL . "\n";

try {
    $url = parse_url($DATABASE_URL);
    $host = $url['host'];
    $port = $url['port'] ?? '5432';
    $dbname = ltrim($url['path'], '/');
    $user = $url['user'];
    $password = $url['pass'];
    
    // Simple connection without additional parameters
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require";
    
    echo "DSN: " . $dsn . "\n";
    
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];
    
    $pdo = new PDO($dsn, $user, $password, $options);
    echo "Connected to PostgreSQL database successfully!\n";
    
    // Test query
    $stmt = $pdo->query("SELECT version()");
    $version = $stmt->fetchColumn();
    echo "PostgreSQL version: " . $version . "\n";
    
} catch (PDOException $e) {
    echo "Failed to connect to PostgreSQL: " . $e->getMessage() . "\n";
}
?>