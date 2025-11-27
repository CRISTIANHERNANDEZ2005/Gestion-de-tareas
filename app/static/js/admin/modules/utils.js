/**
 * Módulo de utilidades comunes para el panel de administración
 * Contiene funciones reutilizables para validaciones, manejo de errores y operaciones comunes
 * 
 * @author Gestor de Tareas
 * @version 1.0
 */

/**
 * Muestra una notificación toast
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje (success, error, info, warning)
 */
export function mostrarNotificacion(mensaje, tipo = 'info') {
    // Verificar que el parámetro mensaje exista
    if (!mensaje) return;
    
    const contenedor = document.getElementById('notification');
    if (!contenedor) return;

    // Icono según el tipo
    let icono = '';
    switch (tipo) {
        case 'success':
            icono = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icono = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icono = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icono = '<i class="fas fa-info-circle"></i>';
    }

    contenedor.innerHTML = icono + mensaje;
    contenedor.className = `notification ${tipo} show`;
    
    // Auto cerrar después de 5 segundos
    setTimeout(() => {
        contenedor.classList.remove('show');
    }, 5000);
}

/**
 * Establece un botón en estado de carga
 * @param {HTMLElement} boton - Botón a modificar
 * @param {string} texto - Texto a mostrar durante la carga
 */
export function establecerBotonCargando(boton, texto) {
    // Verificar que el parámetro boton exista
    if (!boton) return;
    
    // Guardar el estado original
    boton.dataset.htmlOriginal = boton.innerHTML;
    boton.disabled = true;
    
    // Cambiar el contenido del botón para mostrar el estado de carga
    boton.innerHTML = `
        <span>${texto}</span>
        <i class="fas fa-spinner fa-spin"></i>
    `;
    
    // Agregar clase para estilos adicionales
    boton.classList.add('btn-loading');
}

/**
 * Restaura un botón a su estado normal
 * @param {HTMLElement} boton - Botón a restaurar
 * @param {string} textoOriginal - Texto original del botón
 */
export function restaurarBoton(boton, textoOriginal) {
    // Verificar que el parámetro boton exista
    if (!boton) return;
    
    // Restaurar el contenido original
    boton.innerHTML = textoOriginal || boton.dataset.htmlOriginal || boton.innerHTML;
    boton.disabled = false;
    
    // Remover clase de carga
    boton.classList.remove('btn-loading');
}

/**
 * Muestra un mensaje de error en un campo de formulario
 * @param {HTMLElement} input - Campo de entrada
 * @param {string} mensaje - Mensaje de error
 */
export function mostrarError(input, mensaje) {
    // Verificar que los parámetros existan
    if (!input || !mensaje) return;
    
    const grupoFormulario = input.closest('.form-group');
    if (!grupoFormulario) return;
    
    grupoFormulario.classList.add('error');

    // Actualizar el mensaje de error existente
    const mensajeError = grupoFormulario.querySelector('.error-message');
    if (mensajeError) {
        mensajeError.textContent = mensaje;
        // Agregar animación para hacer el error más visible
        mensajeError.style.animation = 'fadeIn 0.3s ease-out';
    }
}

/**
 * Limpia los mensajes de error de un campo de formulario
 * @param {HTMLElement} input - Campo de entrada
 */
export function limpiarError(input) {
    // Verificar que el parámetro exista
    if (!input) return;
    
    const grupoFormulario = input.closest('.form-group');
    if (grupoFormulario) {
        grupoFormulario.classList.remove('error');
        
        // Limpiar el contenido del mensaje de error
        const mensajeError = grupoFormulario.querySelector('.error-message');
        if (mensajeError) {
            mensajeError.textContent = '';
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
 * Valida que una contraseña tenga al menos 8 caracteres con mayúsculas, minúsculas y números
 * @param {string} contrasena - Contraseña a validar
 * @returns {boolean} - True si es válida, false si no lo es
 */
export function validarContrasena(contrasena) {
    // Verificar que el parámetro exista y no sea null/undefined
    if (!contrasena) return false;
    // Verificar que sea un string
    if (typeof contrasena !== 'string') return false;
    // Verificar que tenga al menos 8 caracteres, mayúsculas, minúsculas y números
    return contrasena.trim().length >= 8 &&
           /[A-Z]/.test(contrasena) &&
           /[a-z]/.test(contrasena) &&
           /\d/.test(contrasena);
}

/**
 * Obtiene el token de autenticación del administrador
 * @returns {string|null} - Token de autenticación o null si no existe
 */
export function obtenerTokenAutenticacion() {
    // Primero intentar obtener de las cookies
    const token = document.cookie.replace(
        /(?:(?:^|.*;\s*)admin_token\s*\=\s*([^;]*).*$)|^.*$/,
        "$1"
    );

    if (token) {
        return token;
    }

    // Si no hay en cookies, intentar obtener del localStorage
    return localStorage.getItem("admin_token");
}

/**
 * Cierra la sesión del administrador
 */
export function cerrarSesion() {
    // Eliminar token de cookie y localStorage
    document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("admin_token");
    localStorage.removeItem("administrador");

    // Redirigir al login
    window.location.href = "/admin/login";
}

/**
 * Verifica si un token de administrador es válido
 * @returns {Promise<boolean>} - Promise que resuelve a true si el token es válido, false si no
 */
export async function verificarTokenValido() {
    const token = obtenerTokenAutenticacion();
    
    if (!token) {
        return false;
    }
    
    try {
        // Hacer una llamada ligera a la API para verificar el token
        const respuesta = await fetch('/admin/api/perfil', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Si la respuesta es 200, el token es válido
        // Si es 401, el token es inválido
        return respuesta.status === 200;
    } catch (error) {
        console.error('Error al verificar token:', error);
        return false;
    }
}

/**
 * Actualiza la navegación según el estado de autenticación del administrador
 */
export async function actualizarNavegacion() {
    const elementoUserInfo = document.querySelector('.user-info');
    if (!elementoUserInfo) return;

    const esValido = await verificarTokenValido();
    
    if (!esValido) {
        // Token inválido, cerrar sesión
        cerrarSesion();
    }
}

/**
 * Formatea una fecha en formato legible en español
 * @param {string} cadenaFecha - Fecha en formato ISO
 * @returns {string} - Fecha formateada
 */
export function formatearFecha(cadenaFecha) {
    const fecha = new Date(cadenaFecha);
    return fecha.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

/**
 * Muestra el overlay de carga
 */
export function mostrarCargando() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

/**
 * Oculta el overlay de carga
 */
export function ocultarCargando() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}