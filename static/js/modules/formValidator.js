/**
 * modules/formValidator.js
 * Maneja la validación de formularios de la aplicación.
 * 
 * @package GestorTareas
 */

/**
 * Muestra un mensaje de error debajo de un campo de formulario
 * @param {HTMLElement} input - Elemento de input donde mostrar el error
 * @param {string} mensaje - Mensaje de error a mostrar
 * @returns {void}
 */
export function mostrarError(input, mensaje) {
    const formGroup = input.parentElement;
    const small = formGroup.querySelector('small') || document.createElement('small');
    small.style.color = 'var(--color-error)';
    small.textContent = mensaje;
    small.style.transition = 'all 0.3s ease-in-out';
    small.style.opacity = '0';
    small.style.transform = 'translateY(-10px)';
    
    if (!formGroup.querySelector('small')) {
        // Configurar posición absoluta para el mensaje de error
        small.style.position = 'absolute';
        small.style.top = '100%';
        small.style.left = '0';
        small.style.marginTop = '5px';
        formGroup.style.position = 'relative';
        formGroup.appendChild(small);
        
        // Animar la aparición del mensaje de error
        setTimeout(() => {
            small.style.opacity = '1';
            small.style.transform = 'translateY(0)';
        }, 10);
    } else {
        // Actualizar el mensaje existente
        small.textContent = mensaje;
        // Reanimar si el mensaje cambia
        small.style.opacity = '0';
        small.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            small.style.opacity = '1';
            small.style.transform = 'translateY(0)';
        }, 10);
    }
    
    // Resaltar el campo con error
    input.style.borderColor = 'var(--color-error)';
    
    // Almacenar referencia al mensaje de error en el input para poder ocultarlo después
    input.errorElement = small;
}

/**
 * Limpia el mensaje de error de un campo específico
 * @param {HTMLElement} input - Elemento de input del cual limpiar los errores
 * @returns {void}
 */
export function limpiarError(input) {
    const formGroup = input.parentElement;
    const small = formGroup.querySelector('small');
    if (small) {
        // Animar la desaparición del mensaje de error con una transición más suave
        small.style.transition = 'all 0.3s ease-in-out';
        small.style.opacity = '0';
        small.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            // Verificar que el elemento aún exista antes de eliminarlo
            if (small.parentNode) {
                small.remove();
            }
        }, 300);
    }
    input.style.borderColor = '#ccc';
    
    // Eliminar referencia al mensaje de error
    if (input.errorElement) {
        delete input.errorElement;
    }
}

/**
 * Oculta todos los mensajes de error visibles en el formulario
 * @returns {void}
 */
export function ocultarMensajesErrorCampos() {
    // Ocultar todos los mensajes de error visibles con una animación profesional
    const errorMessages = document.querySelectorAll('.form-group small');
    errorMessages.forEach(function(small) {
        // Solo animar si el mensaje es visible
        if (small.style.opacity !== '0') {
            small.style.transition = 'all 0.3s ease-in-out';
            small.style.opacity = '0';
            small.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                // Verificar que el elemento aún exista antes de eliminarlo
                if (small.parentNode) {
                    small.remove();
                }
            }, 300);
        } else {
            // Si ya está oculto, simplemente eliminarlo
            if (small.parentNode) {
                small.remove();
            }
        }
    });
    
    // Restaurar bordes normales a todos los inputs con transición suave
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(function(input) {
        input.style.transition = 'border-color 0.3s ease-in-out';
        input.style.borderColor = '#ccc';
        
        // Eliminar referencia al mensaje de error
        if (input.errorElement) {
            delete input.errorElement;
        }
    });
}

/**
 * Valida un campo de texto según las opciones especificadas
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
    
    // Si el campo no es requerido y está vacío, pasar la validación
    if (!requerido && valor === '') {
        limpiarError(input);
        return true;
    }
    
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
 * Verifica si un título ya existe en la base de datos
 * @param {string} titulo - El título a verificar
 * @param {string} tareaId - El ID de la tarea actual (para edición)
 * @returns {Promise<boolean>} True si el título es único, False si ya existe
 */
export async function verificarTituloUnico(titulo, tareaId = null) {
    try {
        const formData = new FormData();
        formData.append('titulo', titulo);
        if (tareaId) {
            formData.append('tarea_id', tareaId);
        }
        
        const response = await fetch('/api/verificar-titulo', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.exito && data.duplicado) {
            return false; // El título ya existe
        }
        
        return true; // El título es único
    } catch (error) {
        console.error('Error al verificar título único:', error);
        return true; // En caso de error, asumimos que es único para no bloquear al usuario
    }
}

/**
 * Valida un campo de fecha
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
    
    // Si el campo no es requerido y está vacío, pasar la validación
    if (!requerido && valor === '') {
        limpiarError(input);
        return true;
    }
    
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
