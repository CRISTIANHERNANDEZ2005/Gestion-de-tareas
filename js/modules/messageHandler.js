/**
 * modules/messageHandler.js
 * Maneja la funcionalidad de mensajes y notificaciones de la aplicación.
 * 
 * @package GestorTareas
 */

/**
 * Funcionalidad para cerrar mensajes de notificación
 * @returns {void}
 */
export function cerrarMensaje() {
    const mensajeContainer = document.getElementById('mensaje-container');
    if (mensajeContainer) {
        // Agregar clase para animación de salida
        mensajeContainer.classList.add('ocultar');
        
        // Esperar a que termine la transición antes de ocultar completamente
        setTimeout(function() {
            mensajeContainer.style.display = 'none';
            // Limpiar el parámetro de mensaje de la URL cuando el usuario cierra el mensaje
            limpiarParametroMensaje();
        }, 300); // Debe coincidir con la duración de la transición en CSS
    }
}

/**
 * Función para eliminar el parámetro de mensaje de la URL
 * @returns {void}
 */
export function limpiarParametroMensaje() {
    // Solo ejecutar en el navegador (cliente-side)
    if (typeof window !== 'undefined' && window.history && window.location) {
        const url = new URL(window.location);
        // Si hay un parámetro de mensaje en la URL
        if (url.searchParams.has('mensaje')) {
            // Eliminar el parámetro de mensaje
            url.searchParams.delete('mensaje');
            // Actualizar la URL sin recargar la página
            window.history.replaceState({}, document.title, url.toString());
        }
    }
}

/**
 * Función para ocultar automáticamente los mensajes de éxito después de 5 segundos
 * @returns {void}
 */
export function ocultarMensajeAutomaticamente() {
    const mensajeContainer = document.getElementById('mensaje-container');
    if (mensajeContainer) {
        const tipoMensaje = mensajeContainer.getAttribute('data-tipo');
        const mensajeTexto = mensajeContainer.querySelector('.mensaje-texto').textContent;
        
        // Crear una clave única para este mensaje
        const mensajeKey = 'autoHide_' + encodeURIComponent(mensajeTexto);
        
        // Solo ocultar automáticamente mensajes de éxito
        if (tipoMensaje === 'exito') {
            // Verificar si ya hemos auto-ocultado este mensaje específico
            if (!sessionStorage.getItem(mensajeKey)) {
                // Marcar que vamos a auto-ocultar este mensaje
                sessionStorage.setItem(mensajeKey, 'true');
                
                setTimeout(function() {
                    // Agregar clase para animación de salida
                    mensajeContainer.classList.add('ocultar');
                    
                    // Esperar a que termine la transición antes de ocultar completamente
                    setTimeout(function() {
                        mensajeContainer.style.display = 'none';
                        // Limpiar el parámetro de mensaje de la URL cuando se oculta automáticamente
                        limpiarParametroMensaje();
                    }, 300); // Debe coincidir con la duración de la transición en CSS
                }, 5000); // 5 segundos
            }
        }
    }
}

/**
 * Limpiar sessionStorage de auto-hide cuando no hay mensaje visible
 * @returns {void}
 */
export function limpiarSessionStorage() {
    // Limpiar todas las claves de autoHide antiguas
    Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('autoHide_')) {
            sessionStorage.removeItem(key);
        }
    });
}

/**
 * Mostrar un mensaje flotante en la esquina superior derecha
 * @param {string} mensaje - El texto del mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje ('exito' o 'error')
 * @returns {void}
 */
export function mostrarMensajeFlotante(mensaje, tipo = 'exito') {
    // Eliminar cualquier mensaje flotante existente
    const mensajeExistente = document.querySelector('.floating-message');
    if (mensajeExistente) {
        mensajeExistente.remove();
    }
    
    // Crear el elemento del mensaje flotante
    const mensajeFlotante = document.createElement('div');
    mensajeFlotante.className = `floating-message ${tipo}`;
    mensajeFlotante.id = 'mensaje-flotante';
    
    // Crear el contenido del mensaje
    mensajeFlotante.innerHTML = `
        <span class="mensaje-texto">${mensaje}</span>
        <button type="button" class="cerrar-mensaje" id="cerrar-mensaje-flotante">×</button>
    `;
    
    // Agregar el mensaje al cuerpo del documento
    document.body.appendChild(mensajeFlotante);
    
    // Mostrar el mensaje con animación
    setTimeout(() => {
        mensajeFlotante.classList.add('mostrar');
    }, 10);
    
    // Configurar el botón de cierre
    const cerrarBtn = mensajeFlotante.querySelector('#cerrar-mensaje-flotante');
    if (cerrarBtn) {
        cerrarBtn.addEventListener('click', function() {
            mensajeFlotante.classList.remove('mostrar');
            mensajeFlotante.classList.add('ocultar');
            setTimeout(() => {
                mensajeFlotante.remove();
            }, 300);
        });
    }
    
    // Ocultar automáticamente los mensajes de éxito después de 5 segundos
    if (tipo === 'exito') {
        setTimeout(() => {
            if (mensajeFlotante && mensajeFlotante.parentNode) {
                mensajeFlotante.classList.remove('mostrar');
                mensajeFlotante.classList.add('ocultar');
                setTimeout(() => {
                    mensajeFlotante.remove();
                }, 300);
            }
        }, 5000);
    }
}