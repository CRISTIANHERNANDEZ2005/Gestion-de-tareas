<?php
// Configuración para múltiples bases de datos
// Detectar si estamos en Vercel o en entorno local
if (isset($_ENV['VERCEL']) && $_ENV['VERCEL'] === '1') {
    // En Vercel, usar PostgreSQL
    // Usar la variable de entorno DATABASE_URL proporcionada por Neon.tech
    $DATABASE_URL = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL');
    
    if (!$DATABASE_URL) {
        die("Error: No se encontró la variable de entorno DATABASE_URL");
    }
    
    try {
        // Parsear la URL de conexión de PostgreSQL
        $url = parse_url($DATABASE_URL);
        
        $host = $url['host'];
        $port = $url['port'] ?? '5432';
        $dbname = ltrim($url['path'], '/');
        $user = $url['user'];
        $password = $url['pass'];
        
        // Construir DSN para PostgreSQL con parámetros adecuados para Neon.tech
        $dsn_params = [
            "host=$host",
            "port=$port",
            "dbname=$dbname",
            "sslmode=require"
        ];
        
        // Extraer el endpoint ID del host para Neon.tech
        if (strpos($host, '.neon.') !== false) {
            $endpoint_parts = explode('.', $host);
            if (count($endpoint_parts) >= 3) {
                $endpoint_id = $endpoint_parts[0]; // ep-winter-cake-a86i83s2
                $dsn_params[] = "options='--endpoint=" . $endpoint_id . "'";
            }
        }
        
        $dsn = "pgsql:" . implode(";", $dsn_params);
        
        $opciones = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        $conexion = new PDO($dsn, $user, $password, $opciones);
        
        // Crear la tabla si no existe
        $sql = "CREATE TABLE IF NOT EXISTS tareas (
            id SERIAL PRIMARY KEY,
            titulo VARCHAR(255) UNIQUE NOT NULL,
            descripcion TEXT,
            fecha_limite DATE,
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $conexion->exec($sql);
        
    } catch (PDOException $e) {
        die("Error de conexión a la base de datos PostgreSQL: " . $e->getMessage());
    }
} else {
    // En entorno local, usar SQLite
    $dbPath = __DIR__ . '/../gestor_tareas.sqlite';
    
    // Verificar si el archivo de base de datos existe, si no, crearlo
    $crearTabla = !file_exists($dbPath);
    
    try {
        // Crear conexión PDO a SQLite
        $dsn = "sqlite:" . $dbPath;
        $opciones = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $conexion = new PDO($dsn, null, null, $opciones);
        
        // Crear la tabla si es una nueva base de datos
        if ($crearTabla) {
            $sql = "CREATE TABLE IF NOT EXISTS tareas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT UNIQUE NOT NULL,
                descripcion TEXT,
                fecha_limite DATE,
                creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
            )";
            $conexion->exec($sql);
        }
    } catch (PDOException $e) {
        die("Error de conexión a la base de datos SQLite: " . $e->getMessage());
    }
}

/**
 * Prepara y ejecuta una consulta SQL
 * @param PDO $conexion Conexión a la base de datos
 * @param string $sql Consulta SQL a ejecutar
 * @param array $parametros Parámetros para la consulta
 * @return PDOStatement Resultado de la consulta
 */
function ejecutarConsulta($conexion, $sql, $parametros = []) {
    try {
        $stmt = $conexion->prepare($sql);
        
        foreach ($parametros as $clave => $valor) {
            $tipo = PDO::PARAM_STR;
            
            if (is_int($valor)) {
                $tipo = PDO::PARAM_INT;
            } elseif (is_bool($valor)) {
                $tipo = PDO::PARAM_BOOL;
            }
            
            $stmt->bindValue($clave, $valor, $tipo);
        }
        
        $stmt->execute();
        return $stmt;
    } catch (PDOException $e) {
        enviarRespuestaError('Error en la consulta: ' . $e->getMessage());
    }
}
?>