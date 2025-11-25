/**
 * Módulo de Tareas
 * Gestiona la creación, edición, eliminación y visualización de tareas
 */

import { mostrarToast, setButtonLoading, setButtonNormal, mostrarError, limpiarError, validarFechaFutura, logout } from './utils.js';

class TasksModule {
    constructor() {
        this.apiURL = '';
        // Inicializar handlers para evitar duplicados
        this.guardarTareaHandler = null;
        this.limpiarErrorHandler = null;
        this.confirmarEliminacionHandler = null;
        this.init();
    }

    /**
     * Inicializa los event listeners para las tareas
     */
    init() {
        // Verificar si estamos en la página del dashboard
        if (window.location.pathname === '/dashboard') {
            // Verificar autenticación
            if (!localStorage.getItem('token')) {
                window.location.href = '/'; // Redirigir a home si no hay token
                return;
            }
            
            // Cargar tareas
            this.cargarTareas();
            
            // Manejar el formulario de tareas
            const tareaForm = document.getElementById('tarea-form');
            if (tareaForm) {
                // Remover cualquier listener previo para evitar duplicados
                tareaForm.removeEventListener('submit', this.guardarTareaHandler);
                // Crear un nuevo handler con el contexto adecuado
                this.guardarTareaHandler = (e) => this.guardarTarea(e);
                tareaForm.addEventListener('submit', this.guardarTareaHandler);
                
                // Agregar event listeners para ocultar errores al escribir
                const inputs = tareaForm.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    // Remover cualquier listener previo para evitar duplicados
                    input.removeEventListener('input', this.limpiarErrorHandler);
                    // Crear un nuevo handler con el contexto adecuado
                    this.limpiarErrorHandler = () => limpiarError(input);
                    input.addEventListener('input', this.limpiarErrorHandler);
                });
            }
        } else if (window.location.pathname === '/') {
            // En la página de inicio, verificar el estado de autenticación
            // Esto ayuda a mantener la UI consistente
            if (window.uiModule) {
                window.uiModule.actualizarNav();
            }
        }
    }

    /**
     * Carga las tareas del usuario desde la API
     */
    async cargarTareas() {
        const token = localStorage.getItem('token');
        
        // Mostrar indicador de carga
        const contenedor = document.getElementById('lista-tareas');
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="loading-container">
                    <div class="spinner"></div>
                    <p>Cargando tareas...</p>
                </div>
            `;
            contenedor.style.display = 'block';
        }

        try {
            const res = await fetch(`${this.apiURL}/tareas/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 422) {
                mostrarToast('Sesión expirada o inválida', 'error');
                logout();
                // Actualizar la navegación para reflejar el estado de cierre de sesión
                if (window.uiModule) {
                    window.uiModule.actualizarNav();
                }
                return;
            }

            const tareas = await res.json();
            this.renderizarTareas(tareas);
        } catch (error) {
            console.error('Error cargando tareas:', error);
            mostrarToast('Error al cargar tareas', 'error');
            
            // Mostrar mensaje de error en el contenedor
            if (contenedor) {
                contenedor.innerHTML = `
                    <div class="error-container">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                        <h3>Error al cargar tareas</h3>
                        <p style="color: #6b7280; margin-bottom: 1.5rem;">No se pudieron cargar las tareas. Por favor, inténtalo de nuevo.</p>
                        <button onclick="window.tasksModule.cargarTareas()" class="btn btn-primary">Reintentar</button>
                    </div>
                `;
                contenedor.style.display = 'block';
            }
        }
    }

    /**
     * Renderiza las tareas en el DOM
     * @param {Array} tareas - Array de tareas a renderizar
     */
    renderizarTareas(tareas) {
        const contenedor = document.getElementById('lista-tareas');
        if (!contenedor) return;

        contenedor.innerHTML = '';

        if (tareas.length === 0) {
            contenedor.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📝</div>
                    <h3>No tienes tareas pendientes</h3>
                    <p style="color: #6b7280; margin-bottom: 1.5rem;">Organiza tu día creando tu primera tarea ahora mismo.</p>
                    <button onclick="window.tasksModule.abrirModal()" class="btn btn-primary">Crear Tarea</button>
                </div>
            `;
            contenedor.style.display = 'block';
            return;
        }

        contenedor.style.display = 'grid';

        tareas.forEach(tarea => {
            const card = document.createElement('div');
            card.className = 'task-card';

            let fechaTexto = 'Sin fecha límite';
            let fechaClase = '';
            if (tarea.fecha_limite) {
                const fecha = new Date(tarea.fecha_limite);
                fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
                fechaTexto = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

                // Solo mostrar indicador visual para fechas pasadas
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                if (fecha < hoy) {
                    fechaClase = 'text-danger';
                }
            }

            card.innerHTML = `
                <h3>${tarea.titulo}</h3>
                <p>${tarea.descripcion || '<i>Sin descripción</i>'}</p>
                <div class="task-meta">
                    <small class="task-date ${fechaClase}">📅 ${fechaTexto}</small>
                </div>
                <div class="task-actions">
                    <button onclick='window.tasksModule.editarTarea(${JSON.stringify(tarea)})' class="btn" title="Editar">✏️</button>
                    <button onclick="window.tasksModule.eliminarTarea(${tarea.id})" class="btn btn-danger" title="Eliminar">🗑️</button>
                </div>
            `;
            contenedor.appendChild(card);
        });
    }

    /**
     * Abre el modal de tareas
     * @param {Object|null} tarea - Tarea a editar (null para crear nueva)
     */
    abrirModal(tarea = null) {
        const modal = document.getElementById('modal-tarea');
        const titulo = document.getElementById('modal-titulo');
        const form = document.getElementById('tarea-form');

        if (!modal) return;

        modal.classList.add('active');

        if (tarea) {
            titulo.textContent = 'Editar Tarea';
            document.getElementById('tarea-id').value = tarea.id;
            document.getElementById('titulo').value = tarea.titulo;
            document.getElementById('descripcion').value = tarea.descripcion || '';
            document.getElementById('fecha_limite').value = tarea.fecha_limite || '';
        } else {
            titulo.textContent = 'Nueva Tarea';
            form.reset();
            document.getElementById('tarea-id').value = '';
            
            // Limpiar todos los mensajes de error
            form.querySelectorAll('.form-group').forEach(formGroup => {
                formGroup.classList.remove('error');
                const errorMsg = formGroup.querySelector('.error-msg');
                if (errorMsg) {
                    errorMsg.remove();
                }
            });
        }
    }

    /**
     * Cierra el modal de tareas
     */
    cerrarModal() {
        const modal = document.getElementById('modal-tarea');
        if (modal) modal.classList.remove('active');
    }

    /**
     * Prepara una tarea para edición
     * @param {Object} tarea - Tarea a editar
     */
    editarTarea(tarea) {
        this.abrirModal(tarea);
    }

    /**
     * Guarda una tarea (crea o actualiza)
     * @param {Event} e - Evento de submit
     */
    async guardarTarea(e) {
        e.preventDefault();
        const form = e.target;
        
        // Validar formulario antes de enviar
        if (!this.validarFormulario(form)) {
            mostrarToast('Por favor corrige los errores en el formulario', 'error');
            return;
        }

        const token = localStorage.getItem('token');
        const id = document.getElementById('tarea-id').value;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${this.apiURL}/tareas/${id}` : `${this.apiURL}/tareas/`;
        
        // Mostrar indicador de carga en el botón de guardar
        const guardarBtn = form.querySelector('button[type="submit"]');
        const originalText = guardarBtn.innerHTML;
        setButtonLoading(guardarBtn, 'Guardando...');
        
        // Prevenir envíos duplicados
        guardarBtn.disabled = true;

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                this.cerrarModal();
                this.cargarTareas();
                mostrarToast(id ? 'Tarea actualizada' : 'Tarea creada', 'success');
            } else {
                const result = await res.json();
                mostrarToast(result.mensaje, 'error');
            }
        } catch (error) {
            console.error('Error guardando tarea:', error);
            mostrarToast('Error al guardar la tarea', 'error');
        } finally {
            // Restaurar el botón a su estado original
            setButtonNormal(guardarBtn, originalText);
            guardarBtn.disabled = false;
        }
    }

    /**
     * Abre el modal de confirmación de eliminación
     * @param {number} id - ID de la tarea a eliminar
     */
    abrirModalEliminar(id) {
        this.tareaIdEliminar = id; // Guardar el ID de la tarea a eliminar
        const modal = document.getElementById('modal-eliminar');
        if (modal) {
            modal.classList.add('active');
            
            // Remover cualquier listener previo para evitar duplicados
            const btnConfirmar = document.getElementById('btn-confirmar-eliminar');
            if (btnConfirmar) {
                btnConfirmar.removeEventListener('click', this.confirmarEliminacionHandler);
                // Crear un nuevo handler con el contexto adecuado
                this.confirmarEliminacionHandler = this.confirmarEliminacion.bind(this);
                btnConfirmar.addEventListener('click', this.confirmarEliminacionHandler);
            }
        }
    }

    /**
     * Cierra el modal de confirmación de eliminación
     */
    cerrarModalEliminar() {
        const modal = document.getElementById('modal-eliminar');
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Limpiar el ID de tarea a eliminar para evitar problemas
        this.tareaIdEliminar = null;
    }

    /**
     * Confirma la eliminación de la tarea
     */
    async confirmarEliminacion() {
        if (!this.tareaIdEliminar) return;
        
        const token = localStorage.getItem('token');
        
        // Mostrar indicador de carga en el botón de confirmar eliminación
        const confirmarBtn = document.getElementById('btn-confirmar-eliminar');
        const originalText = confirmarBtn.innerHTML;
        setButtonLoading(confirmarBtn, 'Eliminando...');
        
        // Prevenir clicks duplicados
        confirmarBtn.disabled = true;
        
        try {
            const res = await fetch(`${this.apiURL}/tareas/${this.tareaIdEliminar}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                this.cerrarModalEliminar();
                this.cargarTareas();
                mostrarToast('Tarea eliminada', 'success');
            } else {
                this.cerrarModalEliminar();
                mostrarToast('Error al eliminar tarea', 'error');
            }
        } catch (error) {
            console.error('Error eliminando tarea:', error);
            this.cerrarModalEliminar();
            mostrarToast('Error de conexión', 'error');
        } finally {
            // Restaurar el botón a su estado original
            setButtonNormal(confirmarBtn, originalText);
            confirmarBtn.disabled = false;
        }
    }

    /**
     * Elimina una tarea (abre el modal de confirmación)
     * @param {number} id - ID de la tarea a eliminar
     */
    eliminarTarea(id) {
        this.abrirModalEliminar(id);
    }

    /**
     * Valida un formulario verificando que todos los campos requeridos estén completos
     * @param {HTMLFormElement} form - Formulario a validar
     * @returns {boolean} - True si es válido, false si no
     */
    validarFormulario(form) {
        // Limpiar todos los errores antes de validar
        const allInputs = form.querySelectorAll('input, textarea');
        allInputs.forEach(input => {
            limpiarError(input);
        });
        
        let isValid = true;
        let firstErrorField = null;
        
        // Verificar campos requeridos
        const requiredInputs = form.querySelectorAll('input[required], textarea[required]');

        requiredInputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                mostrarError(input, 'Este campo es obligatorio');
                if (!firstErrorField) firstErrorField = input;
                isValid = false;
            }
        });
        
        // Validaciones específicas por campo
        const tituloInput = form.querySelector('#titulo');
        // Validar que el título no esté vacío y tenga longitud mínima
        if (tituloInput) {
            if (!tituloInput.value.trim()) {
                mostrarError(tituloInput, 'El título es obligatorio');
                if (!firstErrorField) firstErrorField = tituloInput;
                isValid = false;
            } else if (tituloInput.value.trim().length < 5) {
                mostrarError(tituloInput, 'El título debe tener al menos 5 caracteres');
                if (!firstErrorField) firstErrorField = tituloInput;
                isValid = false;
            } else if (tituloInput.value.trim().length > 100) {
                mostrarError(tituloInput, 'El título no puede exceder 100 caracteres');
                if (!firstErrorField) firstErrorField = tituloInput;
                isValid = false;
            }
        }
        
        const descripcionInput = form.querySelector('#descripcion');
        // Validar longitud mínima de descripción solo si se proporciona contenido
        if (descripcionInput && descripcionInput.value.trim().length > 0 && descripcionInput.value.trim().length < 10) {
            mostrarError(descripcionInput, 'La descripción debe tener al menos 10 caracteres');
            if (!firstErrorField) firstErrorField = descripcionInput;
            isValid = false;
        } else if (descripcionInput && !descripcionInput.value.trim()) {
            // Si la descripción es requerida, validar que no esté vacía
            if (descripcionInput.hasAttribute('required')) {
                mostrarError(descripcionInput, 'La descripción es obligatoria');
                if (!firstErrorField) firstErrorField = descripcionInput;
                isValid = false;
            }
        }
        
        const fechaInput = form.querySelector('#fecha_limite');
        if (fechaInput && fechaInput.value.trim() !== '') {
            if (!validarFechaFutura(fechaInput.value)) {
                mostrarError(fechaInput, 'La fecha límite debe ser una fecha futura');
                if (!firstErrorField) firstErrorField = fechaInput;
                isValid = false;
            }
        } else if (fechaInput && fechaInput.hasAttribute('required') && !fechaInput.value.trim()) {
            mostrarError(fechaInput, 'La fecha límite es obligatoria');
            if (!firstErrorField) firstErrorField = fechaInput;
            isValid = false;
        }
        
        // Enfocar el primer campo con error
        if (firstErrorField) {
            firstErrorField.focus();
        }

        return isValid;
    }

    /**
     * Cierra la sesión del usuario
     */
    logout() {
        logout();
    }
}

// Exportar la clase para usarla en otros archivos
export default TasksModule;