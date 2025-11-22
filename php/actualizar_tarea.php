<?php
header('Content-Type: application/json');
require_once 'conexion.php';
require_once 'utils.php';

if (!esSolicitudPost()) {
    enviarRespuestaError('Método no permitido.');
}

$id = obtenerValorLimpio('tarea_id', true);
$titulo = obtenerValorLimpio('titulo', true);
$descripcion = obtenerValorLimpio('descripcion');
$fecha_limite = obtenerValorLimpio('fecha_limite', true);

try {
    $sql = "UPDATE tareas SET titulo = :titulo, descripcion = :descripcion, fecha_limite = :fecha_limite WHERE id = :id";
    $parametros = [
        ':id' => $id,
        ':titulo' => $titulo,
        ':descripcion' => $descripcion,
        ':fecha_limite' => $fecha_limite
    ];
    
    ejecutarConsulta($conexion, $sql, $parametros);

    enviarRespuestaExito('Tarea actualizada correctamente.');
} catch (PDOException $e) {
    manejarErrorBaseDatos($e, 'actualizar la tarea');
}
?>