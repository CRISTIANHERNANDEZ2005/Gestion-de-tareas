<?php
/**
 * php/utils/validator.php
 * Utilidades para validación de datos en la aplicación.
 * 
 * @package GestorTareas
 */

/**
 * Validar que un valor es un número entero válido
 * 
 * @param mixed $value Valor a validar
 * @param string $fieldName Nombre del campo para mensajes de error
 * @return array Array con 'valid' (bool) y 'message' (string)
 */
function validateInteger($value, $fieldName = 'ID') {
    // Validar que el valor sea numérico y mayor que 0
    if (!is_numeric($value) || $value <= 0 || !filter_var($value, FILTER_VALIDATE_INT)) {
        return [
            'valid' => false,
            'message' => "$fieldName inválido."
        ];
    }
    
    return [
        'valid' => true,
        'message' => ''
    ];
}

/**
 * Validar que los campos requeridos no estén vacíos
 * 
 * @param array $fields Array asociativo con nombre_campo => valor
 * @return array Array con 'valid' (bool) y 'message' (string)
 */
function validateRequiredFields($fields) {
    foreach ($fields as $fieldName => $value) {
        if (empty($value)) {
            return [
                'valid' => false,
                'message' => "El campo $fieldName es obligatorio."
            ];
        }
    }
    
    return [
        'valid' => true,
        'message' => ''
    ];
}

/**
 * Validar la longitud de los campos
 * 
 * @param array $fields Array asociativo con nombre_campo => ['value', 'max_length']
 * @return array Array con 'valid' (bool) y 'message' (string)
 */
function validateFieldLengths($fields) {
    foreach ($fields as $fieldName => $fieldData) {
        $value = $fieldData['value'];
        $maxLength = $fieldData['max_length'];
        
        if (strlen($value) > $maxLength) {
            return [
                'valid' => false,
                'message' => "El campo $fieldName no puede exceder $maxLength caracteres."
            ];
        }
    }
    
    return [
        'valid' => true,
        'message' => ''
    ];
}
?>