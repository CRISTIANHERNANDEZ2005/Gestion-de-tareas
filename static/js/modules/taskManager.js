/**
 * modules/taskManager.js
 * Maneja la funcionalidad de gestión de tareas de la aplicación.
 * 
 * @package GestorTareas
 */

import { mostrarMensajeFlotante } from './messageHandler.js';

/**
 * Variable global para almacenar el ID de la tarea a eliminar
 * Se utiliza en la funcionalidad de eliminación de tareas
 * @type {number|null}
 */
let idTareaAEliminar = null;

/**
 * Actualiza una tarea mediante una llamada AJAX
 * @param {number} taskId - El ID de la tarea a actualizar
 * @param {FormData} formData - Los datos de la tarea a actualizar
 * @returns {Promise<Object>} La respuesta del servidor
 */
export async function actualizarTarea(taskId, formData) {
    try {
        const response = await fetch(`/api/tareas/${taskId}`, {
            method: 'PUT',
            body: formData
        });
        const data = await response.json();
        
        if (data.exito) {
            // Dispatch event to refresh task list
            window.dispatchEvent(new CustomEvent('taskUpdated'));
            // Show success message
            mostrarMensajeFlotante('Tarea actualizada correctamente.', 'exito');
        } else {
            // Show error message
            mostrarMensajeFlotante('Error al actualizar la tarea: ' + data.mensaje, 'error');
        }
        
        return data;
    } catch (error) {
        console.error('Error al actualizar la tarea:', error);
        mostrarMensajeFlotante('Error al actualizar la tarea: ' + error.message, 'error');
        throw error;
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
        // Enviar solicitud de eliminación mediante fetch
        fetch('/api/tareas/' + getIdTareaAEliminar(), {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.exito) {
                // En lugar de recargar la página, actualizar la lista de tareas
                window.dispatchEvent(new CustomEvent('taskDeleted'));
                
                // Verificar si estamos editando la tarea que se está eliminando
                const inputIdTarea = document.getElementById('tarea-id');
                if (inputIdTarea && inputIdTarea.value == getIdTareaAEliminar()) {
                    // Si estamos editando la tarea eliminada, cancelar la edición
                    window.dispatchEvent(new CustomEvent('cancelEdit'));
                }
                
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
