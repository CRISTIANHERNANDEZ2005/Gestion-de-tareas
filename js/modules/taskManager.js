/**
 * modules/taskManager.js
 * Maneja la funcionalidad de gestión de tareas de la aplicación.
 * 
 * @package GestorTareas
 */

/**
 * Variable global para almacenar el ID de la tarea a eliminar
 * Se utiliza en la funcionalidad de eliminación de tareas
 * @type {number|null}
 */
let idTareaAEliminar = null;

/**
 * Función para mostrar el modal de confirmación de eliminación
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
 * Función para ocultar el modal de confirmación de eliminación
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
 * Función para eliminar una tarea
 * Crea un formulario dinámicamente y lo envía para eliminar la tarea
 * @returns {void}
 */
export function eliminarTarea() {
    if (idTareaAEliminar !== null) {
        // Crear un formulario dinámicamente y enviarlo
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = window.location.pathname;
        
        const accionInput = document.createElement('input');
        accionInput.type = 'hidden';
        accionInput.name = 'accion';
        accionInput.value = 'eliminar';
        form.appendChild(accionInput);
        
        const idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.name = 'id';
        idInput.value = idTareaAEliminar;
        form.appendChild(idInput);
        
        document.body.appendChild(form);
        form.submit();
    }
}

/**
 * Getter para obtener el ID de la tarea a eliminar
 * @returns {number|null} El ID de la tarea a eliminar
 */
export function getIdTareaAEliminar() {
    return idTareaAEliminar;
}

/**
 * Setter para establecer el ID de la tarea a eliminar
 * @param {number|null} id - El ID de la tarea a eliminar
 */
export function setIdTareaAEliminar(id) {
    idTareaAEliminar = id;
}