<?php
header('Content-Type: application/json');
require_once 'conexion.php';
require_once 'utils.php';

if (!esSolicitudPost()) {
    enviarRespuestaError('Método no permitido.');
}

$titulo = obtenerValorLimpio('titulo', true);
$tarea_id = obtenerValorLimpio('tarea_id');

try {
    // If we're editing a task, exclude the current task from the check
    if (!empty($tarea_id)) {
        $sql = "SELECT COUNT(*) FROM tareas WHERE titulo = :titulo AND id != :tarea_id";
        $parametros = [
            ':titulo' => $titulo,
            ':tarea_id' => $tarea_id
        ];
    } else {
        $sql = "SELECT COUNT(*) FROM tareas WHERE titulo = :titulo";
        $parametros = [':titulo' => $titulo];
    }
    
    $stmt = ejecutarConsulta($conexion, $sql, $parametros);
    $count = $stmt->fetchColumn();

    enviarRespuesta(['exito' => true, 'duplicado' => $count > 0]);
} catch (PDOException $e) {
    enviarRespuestaError('Error al verificar el título: ' . $e->getMessage());
}
?>