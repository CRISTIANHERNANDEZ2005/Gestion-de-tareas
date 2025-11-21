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
 * Clase para manejar la conexión a la base de datos SQLite
 */
class Conexion {
    /** @var string Ruta al archivo de base de datos SQLite */
    private $db_path;
    
    /**
     * Constructor para inicializar la ruta de la base de datos
     * Usa /tmp para compatibilidad con Vercel
     */
    public function __construct() {
        // Para Vercel, usar el directorio /tmp que es escribible
        $tmpDir = '/tmp';
        if (defined('VERCEL') && VERCEL) {
            $this->db_path = $tmpDir . '/gestor_tareas.sqlite';
        } else {
            // Para entornos locales
            $this->db_path = __DIR__ . '/../gestor_tareas.sqlite';
        }
    }

    /** @var PDO|null Conexión a la base de datos */
    public $conexion;

    /**
     * Método para conectar a la base de datos SQLite
     * 
     * @return bool True si la conexión fue exitosa, False en caso contrario
     */
    public function conectar() {
        try {
            // Crear directorio para la base de datos si no existe
            $dbDir = dirname($this->db_path);
            if (!is_dir($dbDir)) {
                mkdir($dbDir, 0755, true);
            }
            
            // Crear una nueva instancia de PDO para SQLite
            $this->conexion = new PDO("sqlite:" . $this->db_path);
            
            // Establecer el modo de error de PDO a excepción
            $this->conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Establecer el modo de recuperación a asociativo por defecto
            $this->conexion->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            // Crear la tabla si no existe
            $this->crearTablaSiNoExiste();
            
        } catch (PDOException $e) {
            // Registrar el error en un log
            error_log("Error de conexión a la base de datos SQLite: " . $e->getMessage());
            // Devolver false para indicar fallo en la conexión
            return false;
        }
        return true;
    }
    
    /**
     * Método para crear la tabla tareas si no existe
     * 
     * @return void
     */
    private function crearTablaSiNoExiste() {
        $sql = "CREATE TABLE IF NOT EXISTS tareas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT UNIQUE NOT NULL,
            descripcion TEXT,
            fecha_limite DATE,
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        
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