/**
 * Módulo de utilidades comunes para la aplicación
 * Contiene funciones reutilizables para validaciones, manejo de errores y operaciones comunes
 */

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje (success, error, info)
 */
export function mostrarToast(message, type = 'info') {
    // Verificar que el parámetro message exista
    if (!message) return;
    
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Establece un botón en estado de carga
 * @param {HTMLElement} button - Botón a modificar
 * @param {string} text - Texto a mostrar durante la carga
 */
export function setButtonLoading(button, text) {
    // Verificar que el parámetro button exista
    if (!button) return;
    
    // Guardar el estado original
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    
    // Cambiar el contenido del botón para mostrar el estado de carga
    button.innerHTML = `
        <span class="btn-spinner"></span>
        ${text}
    `;
    
    // Agregar clase para estilos adicionales
    button.classList.add('btn-loading');
}

/**
 * Restaura un botón a su estado normal
 * @param {HTMLElement} button - Botón a restaurar
 * @param {string} originalText - Texto original del botón
 */
export function setButtonNormal(button, originalText) {
    // Verificar que el parámetro button exista
    if (!button) return;
    
    // Restaurar el contenido original
    button.innerHTML = originalText || button.dataset.originalHtml || button.innerHTML;
    button.disabled = false;
    
    // Remover clase de carga
    button.classList.remove('btn-loading');
}

/**
 * Muestra un mensaje de error en un campo de formulario
 * @param {HTMLElement} input - Campo de entrada
 * @param {string} mensaje - Mensaje de error
 */
export function mostrarError(input, mensaje) {
    // Verificar que los parámetros existan
    if (!input || !mensaje) return;
    
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.add('error');

    // Crear o actualizar el mensaje de error
    let errorMsg = formGroup.querySelector('.error-msg');
    if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'error-msg';
        errorMsg.textContent = mensaje;
        
        // Encontrar el input-wrapper y colocar el error inmediatamente después
        const inputWrapper = formGroup.querySelector('.input-wrapper');
        if (inputWrapper) {
            // Insertar el mensaje de error inmediatamente después del input-wrapper
            inputWrapper.insertAdjacentElement('afterend', errorMsg);
        } else {
            // Si no hay input-wrapper, insertar al final del form-group
            formGroup.appendChild(errorMsg);
        }
    } else {
        errorMsg.textContent = mensaje;
    }
    
    // Agregar animación para hacer el error más visible
    errorMsg.style.animation = 'fadeIn 0.3s ease-out';
}

/**
 * Limpia los mensajes de error de un campo de formulario
 * @param {HTMLElement} input - Campo de entrada
 */
export function limpiarError(input) {
    // Verificar que el parámetro exista
    if (!input) return;
    
    const formGroup = input.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error');
        
        // Remover el mensaje de error completamente
        const errorMsg = formGroup.querySelector('.error-msg');
        if (errorMsg) {
            errorMsg.remove();
        }
    }
}

/**
 * Valida que la identificación tenga al menos 8 dígitos y contenga solo números
 * @param {string} identificacion - Identificación a validar
 * @returns {boolean} - True si es válida, false si no lo es
 */
export function validarIdentificacion(identificacion) {
    // Verificar que el parámetro exista y no sea null/undefined
    if (!identificacion) return false;
    // Verificar que sea un string
    if (typeof identificacion !== 'string') return false;
    // Verificar que tenga al menos 8 dígitos y contenga solo números
    return /^\d{8,}$/.test(identificacion.trim());
}

/**
 * Valida que un nombre tenga al menos 2 caracteres
 * @param {string} nombre - Nombre a validar
 * @returns {boolean} - True si es válido, false si no lo es
 */
export function validarNombre(nombre) {
    // Verificar que el parámetro exista y no sea null/undefined
    if (!nombre) return false;
    // Verificar que sea un string
    if (typeof nombre !== 'string') return false;
    // Verificar que tenga al menos 2 caracteres
    return nombre.trim().length >= 2;
}

/**
 * Valida que una contraseña tenga al menos 6 caracteres
 * @param {string} contrasena - Contraseña a validar
 * @returns {boolean} - True si es válida, false si no lo es
 */
export function validarContrasena(contrasena) {
    // Verificar que el parámetro exista y no sea null/undefined
    if (!contrasena) return false;
    // Verificar que sea un string
    if (typeof contrasena !== 'string') return false;
    // Verificar que tenga al menos 6 caracteres
    return contrasena.trim().length >= 6;
}

/**
 * Valida que una fecha sea futura
 * @param {string} fechaStr - Fecha en formato 'YYYY-MM-DD'
 * @returns {boolean} - True si es futura, false si no lo es
 */
export function validarFechaFutura(fechaStr) {
    // Verificar que el parámetro exista y no sea null/undefined
    if (!fechaStr) return false;
    // Verificar que sea un string
    if (typeof fechaStr !== 'string') return false;
    
    const fechaIngresada = new Date(fechaStr);
    // Verificar que la fecha sea válida
    if (isNaN(fechaIngresada.getTime())) return false;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Reset time part for comparison
    
    // Comparar solo las fechas, no las horas
    const fechaIngresadaSoloFecha = new Date(fechaIngresada.getFullYear(), fechaIngresada.getMonth(), fechaIngresada.getDate());
    
    return fechaIngresadaSoloFecha >= hoy;
}

/**
 * Cierra la sesión del usuario
 */
export function logout() {
    // Verificar que localStorage esté disponible
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    }
    
    // Eliminar la cookie también
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Redirigir a la página principal
    if (typeof window !== 'undefined') {
        window.location.href = '/';
    }
}

/**
 * Verifica si el token almacenado es válido y limpia el estado si no lo es
 * @returns {Promise<boolean>} - Promise que resuelve a true si el token es válido, false si no
 */
export async function verificarYLimpiarAutenticacion() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return false;
    }
    
    try {
        // Hacer una llamada ligera a la API para verificar el token
        const response = await fetch('/auth/perfil', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Si la respuesta no es 200, el token es inválido
        if (response.status !== 200) {
            // Limpiar el estado de autenticación
            logout();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error al verificar token:', error);
        // Limpiar el estado de autenticación en caso de error
        logout();
        return false;
    }
}