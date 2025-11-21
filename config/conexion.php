<?php
// config/conexion.php

// Configuración de la base de datos
define('DB_HOST', 'localhost'); 
define('DB_USUARIO', 'root');   
define('DB_CONTRASENA', '');     
define('DB_NOMBRE', 'gestor_tareas_db');
define('DB_CHARSET', 'utf8mb4');


 $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NOMBRE . ";charset=" . DB_CHARSET;


 $opciones = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Lanza excepciones en caso de error
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Devuelve los resultados como arrays asociativos
    PDO::ATTR_EMULATE_PREPARES   => false,                  // Usa prepared statements nativos
];

try {
    // Crear una instancia de PDO
    $pdo = new PDO($dsn, DB_USUARIO, DB_CONTRASENA, $opciones);
} catch (PDOException $e) {
    // En caso de error, mostrar un mensaje y terminar el script
    // En un entorno de producción, esto debería registrarse en un archivo de log en lugar de mostrarse al usuario
    die("Error de conexión a la base de datos: " . $e->getMessage());
}