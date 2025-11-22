<?php
header('Content-Type: application/json');
require_once 'conexion.php';
require_once 'utils.php';

if (!esSolicitudPost()) {
    enviarRespuestaError('Método no permitido.');
}

$id = validarId($_POST['id'] ?? '');

try {
    $sql = "DELETE FROM tareas WHERE id = :id";
    $parametros = [':id' => $id];
    
    $stmt = ejecutarConsulta($conexion, $sql, $parametros);

    if ($stmt->rowCount() > 0) {
        enviarRespuestaExito('Tarea eliminada correctamente.');
    } else {
        enviarRespuestaError('No se encontró la tarea para eliminar.');
    }
} catch (PDOException $e) {
    enviarRespuestaError('Error al eliminar la tarea: ' . $e->getMessage());
}
?>