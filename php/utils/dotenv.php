<?php
/**
 * php/utils/dotenv.php
 * Utilidad para cargar variables de entorno desde un archivo .env
 * 
 * @package GestorTareas
 */

/**
 * Cargar variables de entorno desde un archivo .env
 * 
 * @param string $path Ruta al archivo .env
 * @return void
 */
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Saltar comentarios y líneas vacías
        if (strpos($line, '#') === 0 || empty(trim($line))) {
            continue;
        }
        
        // Separar la clave y el valor
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        
        // Remover comillas si están presentes
        $value = trim($value, '"\'');
        
        // Establecer la variable de entorno
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
        putenv("$key=$value");
    }
}
?>