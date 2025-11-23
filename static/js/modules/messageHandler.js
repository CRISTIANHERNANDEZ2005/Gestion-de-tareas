/**
 * modules/messageHandler.js
 * Maneja la funcionalidad de mensajes y notificaciones de la aplicación.
 * 
 * @package GestorTareas
 */

/**
 * Muestra un mensaje flotante en la esquina superior derecha
 * @param {string} mensaje - El texto del mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje ('exito' o 'error')
 * @returns {void}
 */
export function mostrarMensajeFlotante(mensaje, tipo = 'exito') {
    // Eliminar cualquier mensaje flotante existente
    const mensajeExistente = document.querySelector('.floating-message');
    if (mensajeExistente) {
        removeElementSafely(mensajeExistente, 300);
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
            removeElementSafely(mensajeFlotante, 300);
        });
    }
    
    // Ocultar automáticamente los mensajes de éxito después de 5 segundos
    if (tipo === 'exito') {
        setTimeout(() => {
            if (mensajeFlotante && mensajeFlotante.parentNode) {
                mensajeFlotante.classList.remove('mostrar');
                mensajeFlotante.classList.add('ocultar');
                removeElementSafely(mensajeFlotante, 300);
            }
        }, 5000);
    }
}

/**
 * Elimina un elemento del DOM de forma segura con animación
 * @param {HTMLElement} element - Elemento a eliminar
 * @param {number} duration - Duración de la animación en milisegundos
 * @returns {void}
 */
export function removeElementSafely(element, duration = 300) {
    if (!element || !element.parentNode) return;
    
    // Aplicar animación de salida
    element.style.transition = `all ${duration}ms ease-in-out`;
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';
    
    // Eliminar elemento después de la transición
    setTimeout(() => {
        if (element.parentNode) {
            element.remove();
        }
    }, duration);
}
