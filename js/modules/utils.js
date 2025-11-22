/**
 * modules/utils.js
 * Utilidades comunes para la aplicación.
 * 
 * @package GestorTareas
 */

/**
 * Anima la entrada de un elemento con transición suave
 * @param {HTMLElement} element - Elemento a animar
 * @param {Object} options - Opciones de animación
 * @param {number} options.duration - Duración de la animación en milisegundos
 * @param {string} options.property - Propiedad CSS a animar
 * @param {string} options.fromValue - Valor inicial de la propiedad
 * @param {string} options.toValue - Valor final de la propiedad
 * @returns {void}
 */
export function animateIn(element, options = {}) {
    const {
        duration = 300,
        property = 'opacity',
        fromValue = '0',
        toValue = '1'
    } = options;
    
    // Establecer valor inicial
    element.style[property] = fromValue;
    element.style.transition = `${property} ${duration}ms ease-in-out`;
    
    // Forzar reflow
    element.offsetHeight;
    
    // Aplicar valor final
    element.style[property] = toValue;
}

/**
 * Anima la salida de un elemento con transición suave y lo elimina del DOM
 * @param {HTMLElement} element - Elemento a animar y eliminar
 * @param {Object} options - Opciones de animación
 * @param {number} options.duration - Duración de la animación en milisegundos
 * @param {string} options.property - Propiedad CSS a animar
 * @param {string} options.toValue - Valor final de la propiedad
 * @param {Function} callback - Función a ejecutar después de eliminar el elemento
 * @returns {void}
 */
export function animateOutAndRemove(element, options = {}, callback = null) {
    const {
        duration = 300,
        property = 'opacity',
        toValue = '0'
    } = options;
    
    if (!element || !element.parentNode) {
        if (callback) callback();
        return;
    }
    
    // Establecer transición
    element.style.transition = `${property} ${duration}ms ease-in-out`;
    
    // Forzar reflow
    element.offsetHeight;
    
    // Aplicar valor final
    element.style[property] = toValue;
    
    // Eliminar elemento después de la transición
    setTimeout(() => {
        if (element.parentNode) {
            element.remove();
        }
        if (callback) callback();
    }, duration);
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

/**
 * Verifica si un elemento existe en el DOM antes de manipularlo
 * @param {string} selector - Selector CSS del elemento
 * @returns {HTMLElement|null} Elemento encontrado o null si no existe
 */
export function getElementSafely(selector) {
    try {
        return document.querySelector(selector);
    } catch (error) {
        console.warn(`Error al buscar elemento con selector: ${selector}`, error);
        return null;
    }
}