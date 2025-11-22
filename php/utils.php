<?php
/**
 * utils.php
 * Funciones utilitarias comunes para la aplicación.
 * 
 * @package GestorTareas
 */

/**
 * Verifica si la solicitud es de tipo POST
 * @return bool True si es POST, false en caso contrario
 */
function esSolicitudPost() {
    return $_SERVER['REQUEST_METHOD'] === 'POST';
}

/**
 * Envía una respuesta JSON de error
 * @param string $mensaje Mensaje de error
 * @param int $codigo Código de error HTTP (opcional)
 * @return void
 */
function enviarRespuestaError($mensaje, $codigo = 400) {
    http_response_code($codigo);
    echo json_encode(['exito' => false, 'mensaje' => $mensaje]);
    exit;
}

/**
 * Envía una respuesta JSON de éxito
 * @param string $mensaje Mensaje de éxito
 * @param array $datos Datos adicionales (opcional)
 * @return void
 */
function enviarRespuestaExito($mensaje, $datos = []) {
    $respuesta = array_merge(['exito' => true, 'mensaje' => $mensaje], $datos);
    echo json_encode($respuesta);
    exit;
}

/**
 * Envía una respuesta JSON genérica
 * @param array $datos Datos a enviar
 * @return void
 */
function enviarRespuesta($datos) {
    echo json_encode($datos);
    exit;
}

/**
 * Valida y limpia un valor de entrada
 * @param string $clave Clave del array $_POST
 * @param bool $requerido Si el valor es requerido
 * @return string Valor limpio o cadena vacía
 */
function obtenerValorLimpio($clave, $requerido = false) {
    $valor = trim($_POST[$clave] ?? '');
    
    if ($requerido && empty($valor)) {
        enviarRespuestaError("El campo {$clave} es obligatorio.");
    }
    
    return $valor;
}

/**
 * Valida un ID numérico
 * @param string $id ID a validar
 * @return int ID validado
 */
function validarId($id) {
    if (empty($id) || !is_numeric($id)) {
        enviarRespuestaError('ID no válido.');
    }
    
    return (int)$id;
}

/**
 * Maneja errores de base de datos específicos
 * @param PDOException $e Excepción capturada
 * @param string $accion Acción que se estaba realizando
 * @return void
 */
function manejarErrorBaseDatos($e, $accion) {
    // Verificar si es un error de duplicado
    if ($e->getCode() == 23000) {
        enviarRespuestaError('Ya existe una tarea con ese título. Por favor, elige un título diferente.');
    } else {
        enviarRespuestaError("Error al {$accion}: " . $e->getMessage());
    }
}
?>