/**
 * modules/formValidator.js
 * Maneja la validación de formularios de la aplicación.
 * 
 * @package GestorTareas
 */

/**
 * Función para mostrar un error en un campo específico
 * @param {HTMLElement} input - Elemento de input donde mostrar el error
 * @param {string} mensaje - Mensaje de error a mostrar
 * @returns {void}
 */
export function mostrarError(input, mensaje) {
    const formGroup = input.parentElement;
    const small = formGroup.querySelector('small') || document.createElement('small');
    small.style.color = 'var(--color-error)';
    small.textContent = mensaje;
    small.style.transition = 'opacity 0.3s ease-in-out';
    small.style.opacity = '0';
    
    if (!formGroup.querySelector('small')) {
        formGroup.appendChild(small);
        // Animar la aparición del mensaje de error
        setTimeout(() => {
            small.style.opacity = '1';
        }, 10);
    } else {
        small.textContent = mensaje;
    }
    
    input.style.borderColor = 'var(--color-error)';
    
    // Almacenar referencia al mensaje de error en el input para poder ocultarlo después
    input.errorElement = small;
}

/**
 * Función para limpiar los errores de un campo
 * @param {HTMLElement} input - Elemento de input del cual limpiar los errores
 * @returns {void}
 */
export function limpiarError(input) {
    const formGroup = input.parentElement;
    const small = formGroup.querySelector('small');
    if (small) {
        // Animar la desaparición del mensaje de error
        small.style.opacity = '0';
        setTimeout(() => {
            small.remove();
        }, 300); // Debe coincidir con la duración de la transición en CSS
    }
    input.style.borderColor = '#ccc';
    
    // Eliminar referencia al mensaje de error
    if (input.errorElement) {
        delete input.errorElement;
    }
}

/**
 * Función para ocultar todos los mensajes de error de los campos
 * @returns {void}
 */
export function ocultarMensajesErrorCampos() {
    // Ocultar todos los mensajes de error visibles
    const errorMessages = document.querySelectorAll('.form-group small');
    errorMessages.forEach(function(small) {
        small.style.opacity = '0';
        setTimeout(() => {
            small.remove();
        }, 300);
    });
    
    // Restaurar bordes normales a todos los inputs
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(function(input) {
        input.style.borderColor = '#ccc';
    });
}

/**
 * Función para validar un campo de texto
 * @param {HTMLElement} input - Elemento de input a validar
 * @param {Object} opciones - Opciones de validación
 * @param {boolean} opciones.requerido - Si el campo es requerido
 * @param {number} opciones.longitudMin - Longitud mínima del campo
 * @param {number} opciones.longitudMax - Longitud máxima del campo
 * @param {string} opciones.mensajeRequerido - Mensaje para campo requerido
 * @param {string} opciones.mensajeMin - Mensaje para longitud mínima
 * @param {string} opciones.mensajeMax - Mensaje para longitud máxima
 * @returns {boolean} True si la validación pasa, False en caso contrario
 */
export function validarCampoTexto(input, opciones) {
    const valor = input.value.trim();
    const { 
        requerido = true, 
        longitudMin = 0, 
        longitudMax = Infinity,
        mensajeRequerido = 'Este campo es obligatorio.',
        mensajeMin = `Este campo debe tener al menos ${longitudMin} caracteres.`,
        mensajeMax = `Este campo no puede exceder ${longitudMax} caracteres.`
    } = opciones;
    
    // Validar si es requerido
    if (requerido && valor === '') {
        mostrarError(input, mensajeRequerido);
        return false;
    }
    
    // Validar longitud mínima
    if (valor.length > 0 && valor.length < longitudMin) {
        mostrarError(input, mensajeMin);
        return false;
    }
    
    // Validar longitud máxima
    if (valor.length > longitudMax) {
        mostrarError(input, mensajeMax);
        return false;
    }
    
    // Si pasa todas las validaciones, limpiar errores
    limpiarError(input);
    return true;
}

/**
 * Función para validar una fecha
 * @param {HTMLElement} input - Elemento de input de fecha a validar
 * @param {Object} opciones - Opciones de validación
 * @param {boolean} opciones.requerido - Si el campo es requerido
 * @param {string} opciones.mensajeRequerido - Mensaje para campo requerido
 * @param {string} opciones.mensajePasado - Mensaje para fecha pasada
 * @returns {boolean} True si la validación pasa, False en caso contrario
 */
export function validarFecha(input, opciones) {
    const valor = input.value;
    const { 
        requerido = true,
        mensajeRequerido = 'La fecha es obligatoria.',
        mensajePasado = 'La fecha no puede ser en el pasado.'
    } = opciones;
    
    // Validar si es requerido
    if (requerido && valor === '') {
        mostrarError(input, mensajeRequerido);
        return false;
    }
    
    // Validar que no sea una fecha pasada
    if (valor !== '') {
        const fechaIngresada = new Date(valor);
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0); // Ignorar la hora para la comparación

        if (fechaIngresada < fechaActual) {
            mostrarError(input, mensajePasado);
            return false;
        }
    }
    
    // Si pasa todas las validaciones, limpiar errores
    limpiarError(input);
    return true;
}