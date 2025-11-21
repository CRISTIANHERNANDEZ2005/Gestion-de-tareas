<?php
/**
 * php/conexion.php
 * Archivo para gestionar la conexión a la base de datos MySQL usando PDO.
 * 
 * @package GestorTareas
 */

// Cargar variables de entorno
require_once 'utils/dotenv.php';
loadEnv(__DIR__ . '/../.env');

/**
 * Clase para manejar la conexión a la base de datos
 */
class Conexion {
    /** @var string Host de la base de datos */
    private $host;
    
    /** @var string Nombre de la base de datos */
    private $nombre_db;
    
    /** @var string Usuario de la base de datos */
    private $usuario;
    
    /** @var string Contraseña de la base de datos */
    private $contrasena;
    
    /**
     * Constructor para inicializar las variables de conexión
     */
    public function __construct() {
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->nombre_db = $_ENV['DB_NAME'] ?? 'gestor_tareas_db';
        $this->usuario = $_ENV['DB_USER'] ?? 'root';
        $this->contrasena = $_ENV['DB_PASS'] ?? '';
    }

    /** @var PDO|null Conexión a la base de datos */
    public $conexion;

    /**
     * Método para conectar a la base de datos
     * 
     * @return bool True si la conexión fue exitosa, False en caso contrario
     */
    public function conectar() {
        try {
            
            // Crear una nueva instancia de PDO
            $this->conexion = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->nombre_db,
                $this->usuario,
                $this->contrasena
            );
            
            // Establecer el modo de error de PDO a excepción
            $this->conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Establecer el juego de caracteres a UTF-8
            $this->conexion->exec("SET CHARACTER SET utf8mb4");

        } catch (PDOException $e) {
            // Registrar el error en un log
            error_log("Error de conexión a la base de datos: " . $e->getMessage());
            // Devolver false para indicar fallo en la conexión
            return false;
        }
        return true;
    }

    /**
     * Método para desconectar de la base de datos
     * 
     * @return void
     */
    public function desconectar() {
        $this->conexion = null;
    }
    
    /**
     * Método para ejecutar una consulta con manejo de errores
     * 
     * @param string $sql Sentencia SQL a ejecutar
     * @param array $params Parámetros para la consulta (opcional)
     * @return PDOStatement|false Objeto PDOStatement si la consulta fue exitosa, False en caso contrario
     */
    public function ejecutarConsulta($sql, $params = []) {
        if (!$this->conectar()) {
            error_log("Error en ejecutarConsulta: No se pudo conectar a la base de datos");
            return false;
        }
        
        try {
            $stmt = $this->conexion->prepare($sql);
            
            // Vincular parámetros si se proporcionan
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value['value'], $value['type']);
            }
            
            $stmt->execute();
            $this->desconectar();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error en ejecutarConsulta: " . $e->getMessage());
            $this->desconectar();
            return false;
        }
    }
    
    /**
     * Verificar si la base de datos está disponible
     * 
     * @return bool True si la base de datos está disponible, False en caso contrario
     */
    public function verificarConexion() {
        return $this->conectar();
    }
}
?>