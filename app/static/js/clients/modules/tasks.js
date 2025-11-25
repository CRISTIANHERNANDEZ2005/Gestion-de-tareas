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
        // Parámetros de filtrado y ordenamiento
        this.searchQuery = '';
        this.dateFrom = '';
        this.dateTo = '';
        this.sortBy = 'creado_en';
        this.order = 'desc';
        // Debounce timer para mejorar el rendimiento
        this.debounceTimer = null;
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
            // Construir URL con parámetros de consulta
            let url = `${this.apiURL}/tareas/`;
            const params = new URLSearchParams();
            
            if (this.searchQuery) {
                params.append('search', this.searchQuery);
            }
            
            if (this.dateFrom) {
                params.append('date_from', this.dateFrom);
            }
            
            if (this.dateTo) {
                params.append('date_to', this.dateTo);
            }
            
            if (this.sortBy) {
                params.append('sort_by', this.sortBy);
            }
            
            if (this.order) {
                params.append('order', this.order);
            }
            
            if (params.toString()) {
                url += '?' + params.toString();
            }
            
            const res = await fetch(url, {
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
            this.renderizarFiltrosActivos(); // Renderizar los filtros activos
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

        // Verificar si hay filtros activos
        const hasActiveFilters = this.searchQuery || this.dateFrom || this.dateTo || 
                                (this.sortBy !== 'creado_en') || (this.order !== 'desc');

        if (tareas.length === 0) {
            if (hasActiveFilters) {
                // Mostrar estado de "no hay resultados" cuando hay filtros activos
                contenedor.innerHTML = `
                    <div class="no-results-state">
                        <div class="no-results-state-icon">🔍</div>
                        <h3>No se encontraron tareas</h3>
                        <p>No hay tareas que coincidan con los filtros aplicados. Intenta ajustar tus criterios de búsqueda.</p>
                        <div class="no-results-state-actions">
                            <button onclick="window.tasksModule.limpiarFiltros()" class="btn btn-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="1 4 1 10 7 10"></polyline>
                                    <polyline points="23 20 23 14 17 14"></polyline>
                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                                </svg>
                                Limpiar Filtros
                            </button>
                            <button onclick="window.tasksModule.abrirModal()" class="btn btn-outline">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Crear Tarea
                            </button>
                        </div>
                    </div>
                `;
            } else {
                // Mostrar estado vacío cuando no hay tareas y no hay filtros
                contenedor.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <h3>No tienes tareas pendientes</h3>
                        <p>Organiza tu día creando tu primera tarea ahora mismo.</p>
                        <div class="empty-state-actions">
                            <button onclick="window.tasksModule.abrirModal()" class="btn btn-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Crear Tarea
                            </button>
                            <button onclick="document.getElementById('toggle-filter-panel').click()" class="btn btn-outline">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                </svg>
                                Buscar Tareas
                            </button>
                        </div>
                    </div>
                `;
            }
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

        // Limpiar todos los mensajes de error cada vez que se abre el modal
        if (form) {
            form.querySelectorAll('.form-group').forEach(formGroup => {
                formGroup.classList.remove('error');
                const errorMsg = formGroup.querySelector('.error-msg');
                if (errorMsg) {
                    errorMsg.remove();
                }
            });
        }

        if (tarea) {
            titulo.textContent = 'Editar Tarea';
            document.getElementById('tarea-id').value = tarea.id;
            document.getElementById('titulo').value = tarea.titulo;
            document.getElementById('descripcion').value = tarea.descripcion || '';
            document.getElementById('fecha_limite').value = tarea.fecha_limite || '';
        } else {
            titulo.textContent = 'Nueva Tarea';
            if (form) {
                form.reset();
            }
            document.getElementById('tarea-id').value = '';
        }
    }

    /**
     * Cierra el modal de tareas
     */
    cerrarModal() {
        const modal = document.getElementById('modal-tarea');
        if (modal) {
            modal.classList.remove('active');
            
            // Limpiar todos los mensajes de error en el formulario del modal al cerrar
            const form = modal.querySelector('form');
            if (form) {
                form.querySelectorAll('.form-group').forEach(formGroup => {
                    formGroup.classList.remove('error');
                    const errorMsg = formGroup.querySelector('.error-msg');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                });
            }
        }
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
     * Filtra las tareas según el texto de búsqueda
     * @param {string} query - Texto de búsqueda
     */
    filtrarTareas(query) {
        this.searchQuery = query;
        this.cargarTareas();
    }
    
    /**
     * Filtra las tareas según el texto de búsqueda con debounce
     * @param {string} query - Texto de búsqueda
     */
    filtrarTareasDebounce(query) {
        // Limpiar el timer anterior
        clearTimeout(this.debounceTimer);
        
        // Establecer un nuevo timer
        this.debounceTimer = setTimeout(() => {
            this.searchQuery = query;
            this.cargarTareas();
        }, 300); // 300ms de debounce
    }
    
    /**
     * Aplica todos los filtros disponibles
     */
    aplicarFiltros() {
        // Obtener valores de los campos de fecha
        this.dateFrom = document.getElementById('date-from').value;
        this.dateTo = document.getElementById('date-to').value;
        // Obtener valor del campo de búsqueda
        this.searchQuery = document.getElementById('search-tasks').value;
        this.cargarTareas();
    }
    
    /**
     * Aplica todos los filtros disponibles con debounce
     */
    aplicarFiltrosDebounce() {
        // Limpiar el timer anterior
        clearTimeout(this.debounceTimer);
        
        // Establecer un nuevo timer
        this.debounceTimer = setTimeout(() => {
            // Obtener valores de los campos de fecha
            this.dateFrom = document.getElementById('date-from').value;
            this.dateTo = document.getElementById('date-to').value;
            // Obtener valor del campo de búsqueda
            this.searchQuery = document.getElementById('search-tasks').value;
            this.cargarTareas();
        }, 300); // 300ms de debounce
    }
    
    /**
     * Ordena las tareas según el campo y dirección especificados
     * @param {string} sortBy - Campo por el cual ordenar
     * @param {string} order - Dirección del ordenamiento (asc, desc)
     */
    ordenarTareas(sortBy, order) {
        this.sortBy = sortBy;
        this.order = order;
        this.cargarTareas();
    }
    
    /**
     * Limpia los filtros y muestra todas las tareas
     */
    limpiarFiltros() {
        this.searchQuery = '';
        this.dateFrom = '';
        this.dateTo = '';
        this.sortBy = 'creado_en';
        this.order = 'desc';
        this.cargarTareas();
        
        // Limpiar los campos en la UI
        const searchInput = document.getElementById('search-tasks');
        const dateFromInput = document.getElementById('date-from');
        const dateToInput = document.getElementById('date-to');
        const sortBySelect = document.getElementById('sort-by');
        const orderSelect = document.getElementById('sort-order');
        
        if (searchInput) searchInput.value = '';
        if (dateFromInput) dateFromInput.value = '';
        if (dateToInput) dateToInput.value = '';
        if (sortBySelect) sortBySelect.value = 'creado_en';
        if (orderSelect) orderSelect.value = 'desc';
    }
    
    /**
     * Renderiza los filtros activos como chips
     */
    renderizarFiltrosActivos() {
        const activeFiltersContainer = document.getElementById('active-filters');
        if (!activeFiltersContainer) return;
        
        // Limpiar contenedor
        activeFiltersContainer.innerHTML = '';
        
        // Verificar si hay filtros activos
        const hasActiveFilters = this.searchQuery || this.dateFrom || this.dateTo || 
                                (this.sortBy !== 'creado_en') || (this.order !== 'desc');
        
        if (!hasActiveFilters) {
            activeFiltersContainer.style.display = 'none';
            return;
        }
        
        activeFiltersContainer.style.display = 'flex';
        
        // Agregar chip para búsqueda
        if (this.searchQuery) {
            const searchChip = document.createElement('div');
            searchChip.className = 'filter-chip';
            searchChip.innerHTML = `
                <span>Búsqueda:</span>
                <span class="filter-value">${this.searchQuery}</span>
                <button class="remove-filter" onclick="window.tasksModule.removerFiltro('search')" title="Remover filtro">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            activeFiltersContainer.appendChild(searchChip);
        }
        
        // Agregar chip para fecha desde
        if (this.dateFrom) {
            const dateFromChip = document.createElement('div');
            dateFromChip.className = 'filter-chip';
            const dateFromFormatted = new Date(this.dateFrom).toLocaleDateString('es-ES');
            dateFromChip.innerHTML = `
                <span>Desde:</span>
                <span class="filter-value">${dateFromFormatted}</span>
                <button class="remove-filter" onclick="window.tasksModule.removerFiltro('dateFrom')" title="Remover filtro">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            activeFiltersContainer.appendChild(dateFromChip);
        }
        
        // Agregar chip para fecha hasta
        if (this.dateTo) {
            const dateToChip = document.createElement('div');
            dateToChip.className = 'filter-chip';
            const dateToFormatted = new Date(this.dateTo).toLocaleDateString('es-ES');
            dateToChip.innerHTML = `
                <span>Hasta:</span>
                <span class="filter-value">${dateToFormatted}</span>
                <button class="remove-filter" onclick="window.tasksModule.removerFiltro('dateTo')" title="Remover filtro">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            activeFiltersContainer.appendChild(dateToChip);
        }
        
        // Agregar chip para ordenamiento
        if ((this.sortBy !== 'creado_en') || (this.order !== 'desc')) {
            const sortChip = document.createElement('div');
            sortChip.className = 'filter-chip';
            
            let sortText = '';
            switch(this.sortBy) {
                case 'titulo':
                    sortText = 'Título';
                    break;
                case 'fecha_limite':
                    sortText = 'Fecha límite';
                    break;
                default:
                    sortText = 'Fecha de creación';
            }
            
            sortText += ` (${this.order === 'asc' ? 'Asc' : 'Desc'})`;
            
            sortChip.innerHTML = `
                <span>Orden:</span>
                <span class="filter-value">${sortText}</span>
                <button class="remove-filter" onclick="window.tasksModule.removerFiltro('sort')" title="Remover filtro">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            activeFiltersContainer.appendChild(sortChip);
        }
        
        // Agregar botón para limpiar todos los filtros
        if (activeFiltersContainer.children.length > 0) {
            const clearAllButton = document.createElement('button');
            clearAllButton.className = 'clear-all-filters';
            clearAllButton.textContent = 'Limpiar todos';
            clearAllButton.onclick = () => this.limpiarFiltros();
            activeFiltersContainer.appendChild(clearAllButton);
        }
    }
    
    /**
     * Remueve un filtro específico
     * @param {string} filterType - Tipo de filtro a remover
     */
    removerFiltro(filterType) {
        switch(filterType) {
            case 'search':
                this.searchQuery = '';
                const searchInput = document.getElementById('search-tasks');
                if (searchInput) searchInput.value = '';
                break;
            case 'dateFrom':
                this.dateFrom = '';
                const dateFromInput = document.getElementById('date-from');
                if (dateFromInput) dateFromInput.value = '';
                break;
            case 'dateTo':
                this.dateTo = '';
                const dateToInput = document.getElementById('date-to');
                if (dateToInput) dateToInput.value = '';
                break;
            case 'sort':
                this.sortBy = 'creado_en';
                this.order = 'desc';
                const sortBySelect = document.getElementById('sort-by');
                const orderSelect = document.getElementById('sort-order');
                if (sortBySelect) sortBySelect.value = 'creado_en';
                if (orderSelect) orderSelect.value = 'desc';
                break;
        }
        this.cargarTareas();
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