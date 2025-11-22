<?php
// Configuración para SQLite
// Detectar si estamos en Vercel o en entorno local
if (isset($_ENV['VERCEL']) && $_ENV['VERCEL'] === '1') {
    // En Vercel, usar el directorio temporal para la base de datos
    $dbPath = '/tmp/gestor_tareas.sqlite';
    
    // Asegurarse de que el directorio existe en Vercel
    $dir = dirname($dbPath);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    
    // Si el archivo de base de datos no existe, copiarlo desde el directorio del proyecto si existe
    if (!file_exists($dbPath)) {
        $sourceDb = __DIR__ . '/../gestor_tareas.sqlite';
        if (file_exists($sourceDb)) {
            copy($sourceDb, $dbPath);
        }
    }
} else {
    // En entorno local, usar la ruta relativa
    $dbPath = __DIR__ . '/../gestor_tareas.sqlite';
}

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
    // En un proyecto real, aquí se registraría el error en un log
    // y se mostraría un mensaje genérico al usuario.
    die("Error de conexión a la base de datos SQLite: " . $e->getMessage());
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