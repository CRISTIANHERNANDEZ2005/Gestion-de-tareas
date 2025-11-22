<?php
/**
 * Migration script to transfer data from SQLite to PostgreSQL
 * This script should be run once after setting up PostgreSQL
 */

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

// First connect to SQLite (source)
$sqlite_dbPath = __DIR__ . '/gestor_tareas.sqlite';
if (!file_exists($sqlite_dbPath)) {
    echo "SQLite database file not found. Nothing to migrate.\n";
    exit(0);
}

try {
    $sqlite_dsn = "sqlite:" . $sqlite_dbPath;
    $sqlite_options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];
    $sqlite_conn = new PDO($sqlite_dsn, null, null, $sqlite_options);
    echo "Connected to SQLite database successfully.\n";
} catch (PDOException $e) {
    die("Failed to connect to SQLite: " . $e->getMessage() . "\n");
}

// Then connect to PostgreSQL (destination)
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
    
    // Construct DSN with proper parameter handling
    $dsn_params = [
        "host=$host",
        "port=$port",
        "dbname=$dbname"
    ];
    
    // Add SSL mode
    $dsn_params[] = "sslmode=require";
    
    // Add endpoint option
    $endpointId = explode('.', $host)[0];
    $dsn_params[] = "options='--endpoint=" . $endpointId . "'";
    
    $dsn = "pgsql:" . implode(";", $dsn_params);
    
    echo "DSN: " . $dsn . "\n";
    
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];
    
    $postgres_conn = new PDO($dsn, $user, $password, $options);
    echo "Connected to PostgreSQL database successfully.\n";
} catch (PDOException $e) {
    die("Failed to connect to PostgreSQL: " . $e->getMessage() . "\n");
}

try {
    // Fetch all tasks from SQLite
    $stmt = $sqlite_conn->query("SELECT id, titulo, descripcion, fecha_limite, creado_en FROM tareas");
    $tasks = $stmt->fetchAll();
    
    echo "Found " . count($tasks) . " tasks in SQLite database.\n";
    
    // Insert tasks into PostgreSQL
    $insert_sql = "INSERT INTO tareas (id, titulo, descripcion, fecha_limite, creado_en) VALUES (:id, :titulo, :descripcion, :fecha_limite, :creado_en)";
    $insert_stmt = $postgres_conn->prepare($insert_sql);
    
    $inserted_count = 0;
    foreach ($tasks as $task) {
        // Handle date conversion if needed
        $fecha_limite = $task['fecha_limite'] ? date('Y-m-d', strtotime($task['fecha_limite'])) : null;
        $creado_en = $task['creado_en'] ? date('Y-m-d H:i:s', strtotime($task['creado_en'])) : null;
        
        $insert_stmt->execute([
            ':id' => $task['id'],
            ':titulo' => $task['titulo'],
            ':descripcion' => $task['descripcion'],
            ':fecha_limite' => $fecha_limite,
            ':creado_en' => $creado_en
        ]);
        $inserted_count++;
    }
    
    echo "Successfully migrated $inserted_count tasks to PostgreSQL.\n";
    
} catch (PDOException $e) {
    die("Error during migration: " . $e->getMessage() . "\n");
}

echo "Migration completed successfully!\n";
?>