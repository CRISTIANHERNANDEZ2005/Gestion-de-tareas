<?php
/**
 * php/funciones_tareas.php
 * Funciones para realizar operaciones CRUD en la tabla 'tareas'.
 * 
 * @package GestorTareas
 */

require_once 'conexion.php';
require_once 'utils/validator.php';

/**
 * Agrega una nueva tarea a la base de datos
 * 
 * @param string $titulo Título de la tarea
 * @param string $descripcion Descripción de la tarea
 * @param string $fecha_limite Fecha límite para completar la tarea (formato YYYY-MM-DD)
 * @return bool True si la tarea se agregó correctamente, False en caso contrario
 */
function agregarTarea($titulo, $descripcion, $fecha_limite) {
    // Validación básica de seguridad
    $requiredValidation = validateRequiredFields([
        'titulo' => $titulo,
        'fecha_limite' => $fecha_limite
    ]);
    
    if (!$requiredValidation['valid']) {
        error_log("Error en agregarTarea: " . $requiredValidation['message']);
        return false;
    }
    
    // Validación básica de longitud
    $lengthValidation = validateFieldLengths([
        'titulo' => ['value' => $titulo, 'max_length' => 100],
        'descripcion' => ['value' => $descripcion, 'max_length' => 1000]
    ]);
    
    if (!$lengthValidation['valid']) {
        error_log("Error en agregarTarea: " . $lengthValidation['message']);
        return false;
    }
    
    // Validar que el título sea único
    if (existeTituloTarea($titulo)) {
        error_log("Error en agregarTarea: El título '$titulo' ya está en uso.");
        return false;
    }
    
    $conexion_db = new Conexion();
    $sql = "INSERT INTO tareas (titulo, descripcion, fecha_limite) VALUES (:titulo, :descripcion, :fecha_limite)";
    $params = [
        ':titulo' => ['value' => $titulo, 'type' => PDO::PARAM_STR],
        ':descripcion' => ['value' => $descripcion, 'type' => PDO::PARAM_STR],
        ':fecha_limite' => ['value' => $fecha_limite, 'type' => PDO::PARAM_STR]
    ];
    
    $stmt = $conexion_db->ejecutarConsulta($sql, $params);
    if ($stmt === false) {
        return false;
    }
    
    return $stmt->rowCount() > 0;
}

/**
 * Obtiene todas las tareas de la base de datos ordenadas por fecha de creación
 * 
 * @return array Array asociativo con todas las tareas, o array vacío si no hay tareas o hay un error
 */
function obtenerTareas() {
    $conexion_db = new Conexion();
    $sql = "SELECT * FROM tareas ORDER BY creado_en DESC";
    
    $stmt = $conexion_db->ejecutarConsulta($sql);
    if ($stmt === false) {
        return [];
    }
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Obtiene una tarea específica por su ID
 * 
 * @param int $id ID de la tarea a buscar
 * @return array|bool Array asociativo con los datos de la tarea si se encuentra, False en caso contrario
 */
function obtenerTareaPorId($id) {
    // Validar que el ID sea un número entero válido
    $idValidation = validateInteger($id, 'ID de tarea');
    if (!$idValidation['valid']) {
        error_log("Error en obtenerTareaPorId: " . $idValidation['message']);
        return false;
    }
    
    $conexion_db = new Conexion();
    $sql = "SELECT * FROM tareas WHERE id = :id";
    $params = [
        ':id' => ['value' => $id, 'type' => PDO::PARAM_INT]
    ];
    
    $stmt = $conexion_db->ejecutarConsulta($sql, $params);
    if ($stmt === false) {
        return false;
    }
    
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Actualiza una tarea existente en la base de datos
 * 
 * @param int $id ID de la tarea a actualizar
 * @param string $titulo Nuevo título de la tarea
 * @param string $descripcion Nueva descripción de la tarea
 * @param string $fecha_limite Nueva fecha límite de la tarea (formato YYYY-MM-DD)
 * @return bool True si la tarea se actualizó correctamente, False en caso contrario
 */
function actualizarTarea($id, $titulo, $descripcion, $fecha_limite) {
    // Validar que los parámetros requeridos no estén vacíos
    $requiredValidation = validateRequiredFields([
        'id' => $id,
        'titulo' => $titulo,
        'fecha_limite' => $fecha_limite
    ]);
    
    if (!$requiredValidation['valid']) {
        error_log("Error en actualizarTarea: " . $requiredValidation['message']);
        return false;
    }
    
    // Validar que el ID sea un número entero
    $idValidation = validateInteger($id, 'ID de tarea');
    if (!$idValidation['valid']) {
        error_log("Error en actualizarTarea: " . $idValidation['message']);
        return false;
    }
    
    // Validación básica de longitud
    $lengthValidation = validateFieldLengths([
        'titulo' => ['value' => $titulo, 'max_length' => 100],
        'descripcion' => ['value' => $descripcion, 'max_length' => 1000]
    ]);
    
    if (!$lengthValidation['valid']) {
        error_log("Error en actualizarTarea: " . $lengthValidation['message']);
        return false;
    }
    
    // Validar que el título sea único (excepto para la tarea actual)
    if (existeTituloTareaExcluyendoId($titulo, $id)) {
        error_log("Error en actualizarTarea: El título '$titulo' ya está en uso.");
        return false;
    }
    
    $conexion_db = new Conexion();
    $sql = "UPDATE tareas SET titulo = :titulo, descripcion = :descripcion, fecha_limite = :fecha_limite WHERE id = :id";
    $params = [
        ':id' => ['value' => $id, 'type' => PDO::PARAM_INT],
        ':titulo' => ['value' => $titulo, 'type' => PDO::PARAM_STR],
        ':descripcion' => ['value' => $descripcion, 'type' => PDO::PARAM_STR],
        ':fecha_limite' => ['value' => $fecha_limite, 'type' => PDO::PARAM_STR]
    ];
    
    $stmt = $conexion_db->ejecutarConsulta($sql, $params);
    if ($stmt === false) {
        return false;
    }
    
    return $stmt->rowCount() > 0;
}

/**
 * Elimina una tarea de la base de datos por su ID
 * 
 * @param int $id ID de la tarea a eliminar
 * @return bool True si la tarea se eliminó correctamente, False en caso contrario
 */
function eliminarTarea($id) {
    // Validar que el ID sea un número entero válido
    $idValidation = validateInteger($id, 'ID de tarea');
    if (!$idValidation['valid']) {
        error_log("Error en eliminarTarea: " . $idValidation['message']);
        return false;
    }
    
    $conexion_db = new Conexion();
    $sql = "DELETE FROM tareas WHERE id = :id";
    $params = [
        ':id' => ['value' => $id, 'type' => PDO::PARAM_INT]
    ];
    
    $stmt = $conexion_db->ejecutarConsulta($sql, $params);
    if ($stmt === false) {
        return false;
    }
    
    return $stmt->rowCount() > 0;
}

/**
 * Verifica si ya existe una tarea con el mismo título
 * 
 * @param string $titulo Título a verificar
 * @return bool True si el título ya existe, False en caso contrario
 */
function existeTituloTarea($titulo) {
    $conexion_db = new Conexion();
    $sql = "SELECT COUNT(*) FROM tareas WHERE titulo = :titulo";
    $params = [
        ':titulo' => ['value' => $titulo, 'type' => PDO::PARAM_STR]
    ];
    
    $stmt = $conexion_db->ejecutarConsulta($sql, $params);
    if ($stmt === false) {
        return false;
    }
    
    $count = $stmt->fetchColumn();
    return $count > 0;
}

/**
 * Verifica si ya existe una tarea con el mismo título, excluyendo una ID específica
 * 
 * @param string $titulo Título a verificar
 * @param int $id_excluido ID de la tarea a excluir de la verificación
 * @return bool True si el título ya existe en otra tarea, False en caso contrario
 */
function existeTituloTareaExcluyendoId($titulo, $id_excluido) {
    $conexion_db = new Conexion();
    $sql = "SELECT COUNT(*) FROM tareas WHERE titulo = :titulo AND id != :id";
    $params = [
        ':titulo' => ['value' => $titulo, 'type' => PDO::PARAM_STR],
        ':id' => ['value' => $id_excluido, 'type' => PDO::PARAM_INT]
    ];
    
    $stmt = $conexion_db->ejecutarConsulta($sql, $params);
    if ($stmt === false) {
        return false;
    }
    
    $count = $stmt->fetchColumn();
    return $count > 0;
}
?>