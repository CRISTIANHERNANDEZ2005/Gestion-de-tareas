<?php
/**
 * php/conexion.php
 * Archivo para gestionar la conexión a la base de datos SQLite usando PDO.
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
    /** @var string Ruta al archivo de base de datos SQLite */
    private $db_path;
    
    /**
     * Constructor para inicializar la ruta de la base de datos
     */
    public function __construct() {
        $this->db_path = $_ENV['SQLITE_DB_PATH'] ?? __DIR__ . '/../db/gestor_tareas.db';
        
        // Crear directorio de base de datos si no existe
        $db_dir = dirname($this->db_path);
        if (!is_dir($db_dir)) {
            mkdir($db_dir, 0755, true);
        }
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
            // Crear una nueva instancia de PDO para SQLite
            $this->conexion = new PDO("sqlite:" . $this->db_path);
            
            // Establecer el modo de error de PDO a excepción
            $this->conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Establecer opciones para SQLite
            $this->conexion->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            // Crear tablas si no existen
            $this->crearTablasSiNoExisten();
            
        } catch (PDOException $e) {
            // Registrar el error en un log
            error_log("Error de conexión a la base de datos SQLite: " . $e->getMessage());
            // Devolver false para indicar fallo en la conexión
            return false;
        }
        return true;
    }
    
    /**
     * Crear las tablas necesarias si no existen
     * 
     * @return void
     */
    private function crearTablasSiNoExisten() {
        $sql = "
            CREATE TABLE IF NOT EXISTS tareas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT UNIQUE NOT NULL,
                descripcion TEXT,
                fecha_limite DATE,
                creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ";
        
        $this->conexion->exec($sql);
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
                // Para SQLite, necesitamos ajustar algunos tipos
                $type = $value['type'] ?? PDO::PARAM_STR;
                $stmt->bindValue($key, $value['value'], $type);
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