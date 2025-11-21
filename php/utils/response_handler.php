<?php
/**
 * php/utils/response_handler.php
 * Manejador de respuestas HTTP para la aplicación.
 * 
 * @package GestorTareas
 */

/**
 * Redirigir con un mensaje
 * 
 * @param string $message Mensaje a mostrar
 * @param string $redirectUrl URL de redirección (por defecto index.html)
 * @return void
 */
function redirectWithMessage($message, $redirectUrl = 'index.html') {
    header("Location: $redirectUrl?mensaje=" . urlencode($message));
    exit();
}

/**
 * Enviar una respuesta JSON
 * 
 * @param array $data Datos a enviar
 * @param int $statusCode Código de estado HTTP
 * @return void
 */
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

/**
 * Determinar si la solicitud es AJAX
 * 
 * @return bool True si es una solicitud AJAX, False en caso contrario
 */
function isAjaxRequest() {
    return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}
?>