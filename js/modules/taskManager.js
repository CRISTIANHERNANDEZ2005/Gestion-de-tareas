/**
 * modules/taskManager.js
 * Maneja la funcionalidad de gestión de tareas de la aplicación.
 * 
 * @package GestorTareas
 */

import { removeElementSafely } from './utils.js';
import { mostrarMensajeFlotante } from './messageHandler.js';

/**
 * Variable global para almacenar el ID de la tarea a eliminar
 * Se utiliza en la funcionalidad de eliminación de tareas
 * @type {number|null}
 */
let idTareaAEliminar = null;

/**
 * Muestra el modal de confirmación de eliminación
 * @param {number} id - ID de la tarea a eliminar
 * @returns {void}
 */
export function mostrarModalEliminacion(id) {
    idTareaAEliminar = id;
    const modal = document.getElementById('modal-eliminacion');
    if (modal) {
        modal.classList.add('mostrar');
    }
}

/**
 * Oculta el modal de confirmación de eliminación
 * @returns {void}
 */
export function ocultarModalEliminacion() {
    const modal = document.getElementById('modal-eliminacion');
    if (modal) {
        modal.classList.remove('mostrar');
    }
    idTareaAEliminar = null;
}

/**
 * Elimina una tarea mediante una llamada AJAX
 * En lugar de redirigir a index.php, ahora hace una llamada AJAX
 * @returns {void}
 */
export function eliminarTarea() {
    if (getIdTareaAEliminar() !== null) {
        // Crear FormData para enviar la solicitud de eliminación
        const formData = new FormData();
        formData.append('id', getIdTareaAEliminar());
        
        // Enviar solicitud de eliminación mediante fetch
        fetch('php/eliminar_tarea.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.exito) {
                // En lugar de recargar la página, actualizar la lista de tareas
                // Dispatch a custom event to refresh the task list
                window.dispatchEvent(new CustomEvent('taskDeleted'));
                // Mostrar mensaje de éxito
                mostrarMensajeFlotante('Tarea eliminada correctamente.', 'exito');
            } else {
                // Mostrar mensaje de error
                console.error('Error al eliminar la tarea:', data.mensaje);
                mostrarMensajeFlotante('Error al eliminar la tarea: ' + data.mensaje, 'error');
            }
        })
        .catch(error => {
            console.error('Error al eliminar la tarea:', error);
            mostrarMensajeFlotante('Error al eliminar la tarea: ' + error.message, 'error');
        });
    }
}

/**
 * Obtiene el ID de la tarea a eliminar
 * @returns {number|null} El ID de la tarea a eliminar
 */
export function getIdTareaAEliminar() {
    return idTareaAEliminar;
}

/**
 * Establece el ID de la tarea a eliminar
 * @param {number|null} id - El ID de la tarea a eliminar
 */
export function setIdTareaAEliminar(id) {
    idTareaAEliminar = id;
}