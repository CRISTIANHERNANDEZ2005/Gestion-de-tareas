// Importar módulos
import { 
    mostrarError, 
    limpiarError, 
    ocultarMensajesErrorCampos, 
    validarCampoTexto, 
    validarFecha,
    verificarTituloUnico
} from './modules/formValidator.js';

import { 
    mostrarMensajeFlotante
} from './modules/messageHandler.js';

import { 
    ocultarModalEliminacion, 
    eliminarTarea,
    setIdTareaAEliminar,
    actualizarTarea
} from './modules/taskManager.js';

/**
 * Inicializa la aplicación cuando el DOM está completamente cargado
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM ---
    const formulario = document.getElementById('formulario-tarea');
    const listaTareasContenedor = document.getElementById('lista-tareas');
    const formTitle = document.getElementById('form-title');
    const submitButtonText = document.getElementById('submit-button-text');
    const botonCancelarEdicion = document.getElementById('boton-cancelar-edicion');
    const inputIdTarea = document.getElementById('tarea-id');
    const accionInput = document.getElementById('accion');
    const tituloInput = document.getElementById('titulo');
    const descripcionInput = document.getElementById('descripcion');
    const fechaLimiteInput = document.getElementById('fecha_limite');
    
    // Modal elements
    const modalEliminacion = document.getElementById('modal-eliminacion');
    const cerrarModalEliminacionBtn = document.getElementById('cerrar-modal-eliminacion');
    const cancelarEliminacion = document.getElementById('cancelar-eliminacion');
    const confirmarEliminacion = document.getElementById('confirmar-eliminacion');
    
    // --- Event Listeners ---
    formulario.addEventListener('submit', manejarEnvioFormulario);
    botonCancelarEdicion.addEventListener('click', cancelarEdicion);
    listaTareasContenedor.addEventListener('click', manejarClickLista);
    
    // Agregar event listeners para ocultar errores al escribir
    tituloInput.addEventListener('input', () => {
        limpiarError(tituloInput);
    });
    
    descripcionInput.addEventListener('input', () => {
        limpiarError(descripcionInput);
    });
    
    fechaLimiteInput.addEventListener('input', () => {
        limpiarError(fechaLimiteInput);
    });
    
    // Modal event listeners
    cerrarModalEliminacionBtn.addEventListener('click', ocultarModalEliminacion);
    cancelarEliminacion.addEventListener('click', ocultarModalEliminacion);
    confirmarEliminacion.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        eliminarTarea();
        ocultarModalEliminacion();
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modalEliminacion) {
            ocultarModalEliminacion();
        }
    });

    window.addEventListener('taskDeleted', () => {
        cargarYMostrarTareas();
    });

    window.addEventListener('taskUpdated', () => {
        cargarYMostrarTareas();
    });

    // --- Funciones Principales ---
    /**
     * Maneja el envío del formulario para agregar o actualizar una tarea.
     * @param {Event} event - El evento de submit del formulario.
     */
    async function manejarEnvioFormulario(event) {
        event.preventDefault();

        if (!(await validarFormulario())) {
            return;
        }

        const formData = new FormData(formulario);
        const tareaId = formData.get('tarea_id');
        const accion = formData.get('accion');

        try {
            let resultado;
            if (accion === 'editar' && tareaId) {
                // Update existing task
                resultado = await actualizarTarea(parseInt(tareaId), formData);
            } else {
                // Create new task
                const response = await fetch('/api/tareas', {
                    method: 'POST',
                    body: formData
                });
                resultado = await response.json();
            }

            if (resultado.exito) {
                mostrarMensajeFlotante(tareaId ? '¡Tarea actualizada exitosamente!' : '¡Tarea agregada exitosamente!', 'exito');
                formulario.reset();
                cancelarEdicion();
                cargarYMostrarTareas();
            } else {
                mostrarMensajeFlotante('Error: ' + resultado.mensaje, 'error');
            }
        } catch (error) {
            console.error('Error al guardar la tarea:', error);
            mostrarMensajeFlotante('Ocurrió un error al guardar la tarea.', 'error');
        }
    }

    /**
     * Carga las tareas desde el servidor y las muestra en la lista.
     */
    async function cargarYMostrarTareas() {
        try {
            const respuesta = await fetch('/api/tareas');
            const tareas = await respuesta.json();
            
            listaTareasContenedor.innerHTML = ''; // Limpiar lista actual

            if (tareas.length === 0) {
                const mensajeContenedor = document.createElement('div');
                mensajeContenedor.className = 'mensaje-sin-tareas';
                mensajeContenedor.innerHTML = `
                    <div class="mensaje-contenido">
                        <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor" class="mensaje-icono">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                        </svg>
                        <h3>No hay tareas registradas</h3>
                        <p>Actualmente no existen tareas en el sistema. Comience añadiendo una nueva tarea para comenzar a organizar su trabajo.</p>
                        <button type="button" class="btn btn-primary" id="btn-agregar-primera-tarea">
                            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                            </svg>
                            Añadir Primera Tarea
                        </button>
                    </div>
                `;
                listaTareasContenedor.appendChild(mensajeContenedor);
                
                // Agregar event listener al botón
                const btnAgregarPrimeraTarea = document.getElementById('btn-agregar-primera-tarea');
                if (btnAgregarPrimeraTarea) {
                    btnAgregarPrimeraTarea.addEventListener('click', () => {
                        
                        document.querySelector('.formulario-seccion').scrollIntoView({ 
                            behavior: 'smooth' 
                        });
                        
                        document.getElementById('titulo').focus();
                    });
                }
                
                return;
            }

            // crear tabla
            const tablaContenedor = document.createElement('div');
            tablaContenedor.className = 'tabla-contenedor';
            
            const tabla = document.createElement('table');
            tabla.innerHTML = `
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Descripción</th>
                        <th>Fecha Límite</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            
            const tbody = tabla.querySelector('tbody');
            
            tareas.forEach(tarea => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td class="titulo-tarea">${tarea.titulo}</td>
                    <td>${tarea.descripcion || 'sin descripcion'}</td>
                    <td class="fecha-tarea">${formatDate(tarea.fecha_limite)}</td>
                    <td class="acciones">
                        <button type="button" class="btn-editar" data-id="${tarea.id}" title="Editar tarea">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 5.793 12.5H4.5v-1.293L12.207 2.5z"/>
                            </svg>
                        </button>
                        <button type="button" class="btn-eliminar" data-id="${tarea.id}" title="Eliminar tarea">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                        </button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
            
            tablaContenedor.appendChild(tabla);
            listaTareasContenedor.appendChild(tablaContenedor);
        } catch (error) {
            console.error('Error al cargar tareas:', error);
            mostrarMensajeFlotante('No se pudieron cargar las tareas.', 'error');
        }
    }

    /**
     * Maneja los clics en los botones de editar y eliminar de la lista de tareas.
     * @param {Event} event - El evento de click.
     */
    function manejarClickLista(event) {
        const boton = event.target.closest('button');
        if (!boton) return;

        const taskId = boton.dataset.id;

        if (boton.classList.contains('btn-editar')) {
            prepararEdicion(taskId);
        } else if (boton.classList.contains('btn-eliminar')) {
            // Mostrar el modal de eliminación
            setIdTareaAEliminar(taskId);
            const modal = document.getElementById('modal-eliminacion');
            if (modal) {
                modal.classList.add('mostrar');
            }
        }
    }

    /**
     * Prepara el formulario para editar una tarea existente.
     * @param {string} tareaId - El ID de la tarea a editar.
     */
    async function prepararEdicion(tareaId) {
        // Limpiar errores antes de cargar nuevos datos
        ocultarMensajesErrorCampos();
        
        try {
            const respuesta = await fetch('/api/tareas');
            const tareas = await respuesta.json();
            const tarea = tareas.find(t => t.id == tareaId);
            
            if (tarea) {
                document.getElementById('titulo').value = tarea.titulo;
                document.getElementById('descripcion').value = tarea.descripcion || '';
                
                // Handle date format for editing
                let fechaValue = tarea.fecha_limite;
                if (fechaValue) {
                    // If it's in GMT format like "Fri, 28 Nov 2025 00:00:00 GMT"
                    if (fechaValue.includes('GMT')) {
                        const date = new Date(fechaValue);
                        // Format as YYYY-MM-DD for input type="date"
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        fechaValue = `${year}-${month}-${day}`;
                    } 
                    // If it's already in DD/MM/YYYY format, convert to YYYY-MM-DD
                    else if (fechaValue.includes('/') && fechaValue.split('/').length === 3) {
                        const parts = fechaValue.split('/');
                        const day = parts[0];
                        const month = parts[1];
                        const year = parts[2];
                        fechaValue = `${year}-${month}-${day}`;
                    }
                }
                
                document.getElementById('fecha_limite').value = fechaValue;
                inputIdTarea.value = tarea.id;
                accionInput.value = 'editar';

                formTitle.innerText = 'Editar Tarea';
                submitButtonText.innerText = 'Actualizar';
                botonCancelarEdicion.style.display = 'flex';

                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Error al cargar la tarea para edición:', error);
            mostrarMensajeFlotante('Error al cargar la tarea para edición.', 'error');
        }
    }

    /**
     * Cancela el modo de edición y resetea el formulario.
     */
    function cancelarEdicion() {
        formulario.reset();
        inputIdTarea.value = '';
        accionInput.value = 'agregar';
        formTitle.innerText = 'Añadir Nueva Tarea';
        submitButtonText.innerText = 'Guardar';
        botonCancelarEdicion.style.display = 'none';
        
        // Limpiar errores
        ocultarMensajesErrorCampos();
    }

    // --- Funciones Auxiliares ---

    /**
     * Valida los campos del formulario.
     * @returns {Promise<boolean>} - True si el formulario es válido, false en caso contrario.
     */
    async function validarFormulario() {
        // Ocultar mensajes de error anteriores
        ocultarMensajesErrorCampos();
        
        let esValido = true;

        // Validar Título (entre 5 y 100 caracteres)
        if (!validarCampoTexto(tituloInput, {
            requerido: true,
            longitudMin: 5,
            longitudMax: 100,
            mensajeRequerido: 'El título es obligatorio.',
            mensajeMin: 'El título debe tener al menos 5 caracteres.',
            mensajeMax: 'El título no puede exceder 100 caracteres.'
        })) {
            esValido = false;
        } else {
            // Verificar si el título ya existe (solo para tareas nuevas o cuando el título ha cambiado)
            const tareaId = inputIdTarea.value;
            const titulo = tituloInput.value.trim();
            
            // Solo verificar unicidad si el campo es válido
            if (titulo.length >= 5 && titulo.length <= 100) {
                const esUnico = await verificarTituloUnico(titulo, tareaId || null);
                if (!esUnico) {
                    mostrarError(tituloInput, 'Título duplicado. Elige otro.');
                    esValido = false;
                } else {
                    limpiarError(tituloInput);
                }
            }
        }

        // Validar Descripción (opcional, pero si se llena, debe tener un mínimo)
        const descripcionValue = descripcionInput.value.trim();
        if (descripcionValue !== '' && !validarCampoTexto(descripcionInput, {
            requerido: false,
            longitudMin: 10,
            mensajeMin: 'La descripción debe tener al menos 10 caracteres.'
        })) {
            esValido = false;
        }
        
        // Validar Fecha Límite
        if (!validarFecha(fechaLimiteInput, {
            requerido: true,
            mensajeRequerido: 'La fecha límite es obligatoria.',
            mensajePasado: 'La fecha límite no puede ser en el pasado.'
        })) {
            esValido = false;
        }

        return esValido;
    }
    
    /**
     * Formats a date string to DD/MM/YYYY format
     * @param {string} dateString - The date string to format
     * @returns {string} - Formatted date string
     */
    function formatDate(dateString) {
        // Handle different date formats
        if (!dateString) return '';
        
        let date;
        
        // If it's already in DD/MM/YYYY format, return as is
        if (dateString.includes('/') && dateString.split('/').length === 3) {
            return dateString;
        }
        
        // If it's in GMT format like "Fri, 28 Nov 2025 00:00:00 GMT"
        if (dateString.includes('GMT')) {
            date = new Date(dateString);
        } 
        // If it's in ISO format like "2025-11-28"
        else if (dateString.includes('-') && dateString.split('-').length === 3) {
            const parts = dateString.split('-');
            const year = parts[0];
            const month = parts[1];
            const day = parts[2];
            return `${day}/${month}/${year}`;
        }
        // If it's already a Date object or can be parsed as one
        else {
            date = new Date(dateString);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return dateString; // Return original if we can't parse it
        }
        
        // Format as DD/MM/YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    }

    // --- Carga Inicial ---
    cargarYMostrarTareas();
});