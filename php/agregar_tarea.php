<?php
header('Content-Type: application/json');
require_once 'conexion.php';
require_once 'utils.php';

if (!esSolicitudPost()) {
    enviarRespuestaError('Método no permitido.');
}

$titulo = obtenerValorLimpio('titulo', true);
$descripcion = obtenerValorLimpio('descripcion');
$fecha_limite = obtenerValorLimpio('fecha_limite', true);

try {
    $sql = "INSERT INTO tareas (titulo, descripcion, fecha_limite) VALUES (:titulo, :descripcion, :fecha_limite)";
    $parametros = [
        ':titulo' => $titulo,
        ':descripcion' => $descripcion,
        ':fecha_limite' => $fecha_limite
    ];
    
    ejecutarConsulta($conexion, $sql, $parametros);

    enviarRespuestaExito('Tarea agregada correctamente.');
} catch (PDOException $e) {
    manejarErrorBaseDatos($e, 'agregar la tarea');
}
?>