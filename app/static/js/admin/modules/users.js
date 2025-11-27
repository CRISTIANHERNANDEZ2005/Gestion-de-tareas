/**
 * Módulo de Gestión de Usuarios para Administradores
 * Gestiona la creación, edición, eliminación y visualización de usuarios
 * 
 * @author Gestor de Tareas
 * @version 1.0
 */

import { 
    mostrarNotificacion, 
    establecerBotonCargando, 
    restaurarBoton, 
    mostrarError, 
    limpiarError, 
    validarIdentificacion, 
    validarNombre, 
    validarContrasena,
    cerrarSesion,
    formatearFecha,
    mostrarCargando,
    ocultarCargando
} from './utils.js';

/**
 * Clase que representa el módulo de gestión de usuarios para administradores
 * Gestiona todas las operaciones CRUD de usuarios, incluyendo filtrado y paginación
 */
class AdminUsersModule {
    /**
     * Constructor del módulo de gestión de usuarios
     * Inicializa las propiedades y configura los event listeners
     */
    constructor() {
        this.apiURL = '';
        // Inicializar handlers para evitar duplicados
        this.guardarUsuarioHandler = null;
        this.confirmarEliminacionHandler = null;
        // Parámetros de paginación y filtrado
        this.paginaActual = 1;
        this.elementosPorPagina = 10;
        this.consultaBusqueda = "";
        this.ordenarPor = "";
        this.orden = "asc";
        this.fechaDesde = "";
        this.fechaHasta = "";
        this.idUsuarioEliminar = null;
        this.esEdicion = false;
        this.init();
    }

    /**
     * Inicializa los event listeners para la gestión de usuarios
     * Configura todos los componentes necesarios para el funcionamiento del módulo
     */
    init() {
        // Cargar usuarios al iniciar
        this.cargarUsuarios();
        
        // Configurar todos los event listeners
        this.configurarEventListeners();
        
        // Configurar botón de cierre de sesión
        this.configurarBotonCerrarSesion();
        
        // Configurar navegación por teclado
        this.configurarNavegacionTeclado();
        
        // Configurar validación en tiempo real
        this.configurarValidacionTiempoReal();
    }

    /**
     * Configura la validación en tiempo real de los campos del formulario de usuario
     * Limpia los errores cuando el usuario comienza a escribir
     */
    configurarValidacionTiempoReal() {
        // Agregar event listeners a todos los campos del formulario de usuario
        const camposFormulario = [
            'identificacion',
            'nombre',
            'apellido',
            'contrasena'
        ];
        
        camposFormulario.forEach(idCampo => {
            const campo = document.getElementById(idCampo);
            if (campo) {
                campo.addEventListener('input', () => {
                    if (campo.value.trim() !== '') {
                        limpiarError(campo);
                    }
                });
            }
        });
        
        // Configurar toggle de visibilidad de contraseña
        this.configurarToggleContrasena();
    }
    
    /**
     * Configura el toggle de visibilidad de contraseñas
     * Permite al usuario mostrar/ocultar la contraseña ingresada
     */
    configurarToggleContrasena() {
        const toggleContrasena = document.getElementById('togglePassword');
        if (toggleContrasena) {
            toggleContrasena.addEventListener('click', function() {
                const inputContrasena = document.getElementById('contrasena');
                if (inputContrasena) {
                    const tipo = inputContrasena.getAttribute('type') === 'password' ? 'text' : 'password';
                    inputContrasena.setAttribute('type', tipo);
                    
                    // Cambiar icono
                    const icono = this.querySelector('i');
                    icono.className = tipo === 'password' ? 'fas fa-eye eye-icon' : 'fas fa-eye-slash eye-icon';
                }
            });
        }
    }

    /**
     * Configura la navegación por teclado para modales
     * Permite cerrar modales presionando la tecla Escape
     */
    configurarNavegacionTeclado() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Cerrar cualquier modal abierto
                const modalesActivos = document.querySelectorAll('.modal.active');
                modalesActivos.forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    }

    /**
     * Configura el botón de cierre de sesión
     * Maneja el evento de clic para mostrar el modal de confirmación
     */
    configurarBotonCerrarSesion() {
        const botonCerrarSesion = document.getElementById('logoutBtn');
        if (botonCerrarSesion) {
            botonCerrarSesion.addEventListener('click', () => {
                this.abrirModalCerrarSesion();
            });
        }
        
        // Configurar eventos para el modal de confirmación de cierre de sesión
        const botonCerrarModal = document.getElementById('logoutModalClose');
        const botonCancelar = document.getElementById('cancelLogoutBtn');
        const botonConfirmar = document.getElementById('confirmLogoutBtn');
        
        if (botonCerrarModal) {
            botonCerrarModal.addEventListener('click', () => this.cerrarModalCerrarSesion());
        }
        
        if (botonCancelar) {
            botonCancelar.addEventListener('click', () => this.cerrarModalCerrarSesion());
        }
        
        if (botonConfirmar) {
            botonConfirmar.addEventListener('click', () => {
                cerrarSesion();
            });
        }
    }

    /**
     * Configura todos los event listeners
     * Establece los manejadores de eventos para todos los elementos interactivos
     */
    configurarEventListeners() {
        // Botones de acción principal
        const botonAgregarUsuario = document.getElementById('addUserBtn');
        const botonAgregarUsuarioVacio = document.getElementById('addUserEmptyBtn');
        
        if (botonAgregarUsuario) {
            botonAgregarUsuario.addEventListener('click', () => this.abrirModalUsuario());
        }
        
        if (botonAgregarUsuarioVacio) {
            botonAgregarUsuarioVacio.addEventListener('click', () => this.abrirModalUsuario());
        }

        // Botones de cierre de modales
        const botonCerrarModal = document.getElementById('modalClose');
        const botonCancelar = document.getElementById('cancelBtn');
        
        if (botonCerrarModal) {
            botonCerrarModal.addEventListener('click', () => this.cerrarModalUsuario());
        }
        
        if (botonCancelar) {
            botonCancelar.addEventListener('click', () => this.cerrarModalUsuario());
        }

        const botonCerrarModalEliminar = document.getElementById('deleteModalClose');
        const botonCancelarEliminar = document.getElementById('cancelDeleteBtn');
        
        if (botonCerrarModalEliminar) {
            botonCerrarModalEliminar.addEventListener('click', () => this.cerrarModalEliminar());
        }
        
        if (botonCancelarEliminar) {
            botonCancelarEliminar.addEventListener('click', () => this.cerrarModalEliminar());
        }

        // Botón de guardar usuario
        const botonGuardar = document.getElementById('saveBtn');
        if (botonGuardar) {
            botonGuardar.addEventListener('click', () => this.guardarUsuario());
        }

        // Botón de confirmar eliminación
        const botonConfirmarEliminar = document.getElementById('confirmDeleteBtn');
        if (botonConfirmarEliminar) {
            botonConfirmarEliminar.addEventListener('click', () => this.eliminarUsuario(this.idUsuarioEliminar));
        }

        // Inputs de filtrado
        const inputBusqueda = document.getElementById('searchInput');
        if (inputBusqueda) {
            inputBusqueda.addEventListener('keyup', (e) => {
                this.consultaBusqueda = e.target.value;
                
                // Mostrar/ocultar indicador de filtro de búsqueda
                const indicadorBusqueda = document.getElementById('searchFilterIndicator');
                if (indicadorBusqueda) {
                    if (this.consultaBusqueda) {
                        indicadorBusqueda.style.display = 'inline-block';
                    } else {
                        indicadorBusqueda.style.display = 'none';
                    }
                }
                
                this.paginaActual = 1;
                this.cargarUsuarios();
            });
        }

        const selectElementosPorPagina = document.getElementById('perPageSelect');
        if (selectElementosPorPagina) {
            selectElementosPorPagina.addEventListener('change', (e) => {
                this.elementosPorPagina = e.target.value;
                this.paginaActual = 1;
                this.cargarUsuarios();
            });
        }

        const selectOrdenar = document.getElementById('sortSelect');
        if (selectOrdenar) {
            selectOrdenar.addEventListener('change', (e) => {
                this.ordenarPor = e.target.value;
                this.cargarUsuarios();
            });
        }

        const selectOrden = document.getElementById('orderSelect');
        if (selectOrden) {
            selectOrden.addEventListener('change', (e) => {
                this.orden = e.target.value;
                this.cargarUsuarios();
            });
        }

        // Inputs de fecha con validación
        const inputFechaDesde = document.getElementById('dateFrom');
        const inputFechaHasta = document.getElementById('dateTo');
        
        if (inputFechaDesde && inputFechaHasta) {
            let temporizadorFecha;
            
            const manejarCambioFecha = () => {
                const fechaDesdeValor = inputFechaDesde.value;
                const fechaHastaValor = inputFechaHasta.value;

                // Validar rango de fechas
                if (fechaDesdeValor && fechaHastaValor && new Date(fechaDesdeValor) > new Date(fechaHastaValor)) {
                    mostrarNotificacion('La fecha "Desde" no puede ser posterior a la fecha "Hasta"', "error");
                    return;
                }

                // Actualizar variables de filtro de fecha
                this.fechaDesde = fechaDesdeValor;
                this.fechaHasta = fechaHastaValor;

                // Retroalimentación visual para filtros de fecha activos
                const iconoCalendario = document.querySelector(".filter-section-title i.fa-calendar");
                const indicadorFecha = document.getElementById("dateFilterIndicator");
                
                if (iconoCalendario && indicadorFecha) {
                    if (fechaDesdeValor || fechaHastaValor) {
                        iconoCalendario.classList.add("text-primary");
                        indicadorFecha.style.display = 'inline-block';
                    } else {
                        iconoCalendario.classList.remove("text-primary");
                        indicadorFecha.style.display = 'none';
                    }
                }

                clearTimeout(temporizadorFecha);
                temporizadorFecha = setTimeout(() => {
                    this.paginaActual = 1;
                    this.cargarUsuarios();
                }, 300); // Tiempo de debounce reducido para mejor respuesta
            };

            inputFechaDesde.addEventListener('change', manejarCambioFecha);
            inputFechaHasta.addEventListener('change', manejarCambioFecha);
        }

        // Panel de filtros flotante
        const botonAlternarFiltros = document.getElementById('filterToggleBtn');
        const panelFiltros = document.getElementById('filterPanel');
        const botonCerrarPanelFiltros = document.getElementById('filterPanelClose');
        
        if (botonAlternarFiltros) {
            botonAlternarFiltros.addEventListener('click', () => {
                botonAlternarFiltros.classList.toggle("active");
                if (panelFiltros) {
                    panelFiltros.classList.toggle("active");
                }
            });
        }
        
        if (botonCerrarPanelFiltros && botonAlternarFiltros && panelFiltros) {
            botonCerrarPanelFiltros.addEventListener('click', () => {
                botonAlternarFiltros.classList.remove("active");
                panelFiltros.classList.remove("active");
            });
        }

        // Botón de aplicar filtros
        const botonAplicarFiltros = document.getElementById('applyFiltersBtn');
        if (botonAplicarFiltros) {
            botonAplicarFiltros.addEventListener('click', () => {
                this.paginaActual = 1;
                this.cargarUsuarios();

                // Cerrar el panel de filtros
                if (botonAlternarFiltros && panelFiltros) {
                    botonAlternarFiltros.classList.remove("active");
                    panelFiltros.classList.remove("active");
                }
            });
        }

        // Botón de reiniciar filtros
        const botonReiniciarFiltros = document.getElementById('resetFiltersBtn');
        if (botonReiniciarFiltros) {
            botonReiniciarFiltros.addEventListener('click', () => {
                this.reiniciarFiltros();
            });
        }

        // Botón de limpiar todos los filtros
        const botonLimpiarTodosFiltros = document.getElementById('clearAllFiltersBtn');
        if (botonLimpiarTodosFiltros) {
            botonLimpiarTodosFiltros.addEventListener('click', () => {
                this.limpiarTodosLosFiltros();
            });
        }

        // Botones de limpiar filtro individual
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-clear-btn') || e.target.closest('.filter-clear-btn')) {
                const boton = e.target.closest('.filter-clear-btn');
                const tipoFiltro = boton.dataset.filter;

                if (tipoFiltro === "date") {
                    this.limpiarFiltroFecha();
                } else if (tipoFiltro === "search") {
                    this.limpiarFiltroBusqueda();
                }

                this.paginaActual = 1;
                this.cargarUsuarios();
            }
        });

        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.cerrarModalUsuario();
                this.cerrarModalEliminar();
                this.cerrarModalCerrarSesion();
            }
        });

        // Ordenamiento al hacer clic en los encabezados de la tabla
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('sortable') || e.target.closest('.sortable')) {
                const elemento = e.target.closest('.sortable');
                const campoOrden = elemento.dataset.sort;

                // Actualizar el estado de ordenamiento
                if (this.ordenarPor === campoOrden) {
                    this.orden = this.orden === "asc" ? "desc" : "asc";
                } else {
                    this.ordenarPor = campoOrden;
                    this.orden = "asc";
                }

                // Actualizar los selects en el panel flotante
                const selectOrdenar = document.getElementById('sortSelect');
                const selectOrden = document.getElementById('orderSelect');
                
                if (selectOrdenar) selectOrdenar.value = this.ordenarPor;
                if (selectOrden) selectOrden.value = this.orden;

                // Actualizar las clases de los encabezados
                document.querySelectorAll('.sortable').forEach(el => {
                    el.classList.remove('asc', 'desc');
                });
                elemento.classList.add(this.orden);

                // Recargar los datos
                this.cargarUsuarios();
            }
        });
    }

    /**
     * Carga los usuarios desde la API
     * Obtiene los usuarios paginados y filtrados del servidor
     */
    async cargarUsuarios() {
        mostrarCargando();

        const parametros = {
            page: this.paginaActual,
            per_page: this.elementosPorPagina,
            search: this.consultaBusqueda,
        };

        if (this.ordenarPor) {
            parametros.sort = this.ordenarPor;
            parametros.order = this.orden;
        }

        // Agregar parámetros de rango de fechas para filtrar por registro de usuario
        if (this.fechaDesde) {
            parametros.date_from = this.fechaDesde;
        }

        if (this.fechaHasta) {
            parametros.date_to = this.fechaHasta;
        }

        try {
            const respuesta = await fetch(`/admin/api/usuarios?${new URLSearchParams(parametros)}`, {
                headers: {
                    'Authorization': `Bearer ${this.obtenerToken()}`
                }
            });

            if (respuesta.status === 401) {
                mostrarNotificacion("Su sesión ha expirado. Por favor inicie sesión nuevamente.", "error");
                setTimeout(() => {
                    cerrarSesion();
                }, 2000);
                return;
            } else if (respuesta.status === 403) {
                mostrarNotificacion("No tiene permisos para acceder a esta sección.", "error");
                setTimeout(() => {
                    cerrarSesion();
                }, 2000);
                return;
            }

            const datos = await respuesta.json();
            
            this.renderizarTablaUsuarios(datos.usuarios);
            this.renderizarPaginacion(datos.current_page, datos.pages, datos.total);
            this.actualizarContadorUsuarios(datos.total);
            ocultarCargando();
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            ocultarCargando();
            mostrarNotificacion("Error al cargar los usuarios", "error");
        }
    }

    /**
     * Renderiza la tabla de usuarios
     * @param {Array} usuarios - Array de usuarios a renderizar
     */
    renderizarTablaUsuarios(usuarios) {
        const cuerpoTabla = document.getElementById('usersTableBody');
        const estadoVacio = document.getElementById('emptyState');

        if (!cuerpoTabla || !estadoVacio) return;

        cuerpoTabla.innerHTML = '';

        if (usuarios.length === 0) {
            cuerpoTabla.style.display = 'none';
            estadoVacio.style.display = 'block';
            return;
        }

        cuerpoTabla.style.display = 'table-row-group';
        estadoVacio.style.display = 'none';

        usuarios.forEach(usuario => {
            const fila = document.createElement('tr');
            
            fila.innerHTML = `
                <td>${usuario.identificacion}</td>
                <td class="user-name-cell">${usuario.nombre}</td>
                <td>${usuario.apellido}</td>
                <td class="user-date hide-mobile">${formatearFecha(usuario.creado_en)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" data-id="${usuario.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-id="${usuario.id}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            cuerpoTabla.appendChild(fila);
        });

        // Agregar event listeners a los botones de acción
        cuerpoTabla.querySelectorAll('.edit-btn').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.abrirModalUsuario(id);
            });
        });

        cuerpoTabla.querySelectorAll('.delete-btn').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.abrirModalEliminar(id);
            });
        });
    }

    /**
     * Renderiza la paginación
     * @param {number} paginaActual - Página actual
     * @param {number} totalPaginas - Total de páginas
     * @param {number} totalUsuarios - Total de usuarios
     */
    renderizarPaginacion(paginaActual, totalPaginas, totalUsuarios) {
        const paginacion = document.getElementById('pagination');
        const informacionPaginacion = document.getElementById('paginationInfo');

        if (!paginacion || !informacionPaginacion) return;

        paginacion.innerHTML = '';

        if (totalPaginas <= 1) {
            informacionPaginacion.textContent = `Mostrando ${totalUsuarios} de ${totalUsuarios} usuarios`;
            return;
        }

        const itemInicial = (paginaActual - 1) * this.elementosPorPagina + 1;
        const itemFinal = Math.min(paginaActual * this.elementosPorPagina, totalUsuarios);
        informacionPaginacion.textContent = `Mostrando ${itemInicial}-${itemFinal} de ${totalUsuarios} usuarios`;

        // Botón anterior
        const deshabilitadoAnterior = paginaActual === 1 ? "disabled" : "";
        const botonAnterior = document.createElement('button');
        botonAnterior.className = `page-btn ${deshabilitadoAnterior}`;
        botonAnterior.innerHTML = '<i class="fas fa-chevron-left"></i>';
        botonAnterior.disabled = paginaActual === 1;
        
        if (!deshabilitadoAnterior) {
            botonAnterior.addEventListener('click', () => this.cambiarPagina(paginaActual - 1));
        }
        
        paginacion.appendChild(botonAnterior);

        // Números de página
        let paginaInicio = Math.max(1, paginaActual - 2);
        let paginaFin = Math.min(totalPaginas, paginaActual + 2);

        if (paginaInicio > 1) {
            const botonPrimera = document.createElement('button');
            botonPrimera.className = 'page-btn';
            botonPrimera.textContent = '1';
            botonPrimera.addEventListener('click', () => this.cambiarPagina(1));
            paginacion.appendChild(botonPrimera);

            if (paginaInicio > 2) {
                const botonPuntos = document.createElement('button');
                botonPuntos.className = 'page-btn';
                botonPuntos.textContent = '...';
                botonPuntos.disabled = true;
                paginacion.appendChild(botonPuntos);
            }
        }

        for (let i = paginaInicio; i <= paginaFin; i++) {
            const botonPagina = document.createElement('button');
            botonPagina.className = `page-btn ${i === paginaActual ? 'active' : ''}`;
            botonPagina.textContent = i;
            botonPagina.addEventListener('click', () => this.cambiarPagina(i));
            paginacion.appendChild(botonPagina);
        }

        if (paginaFin < totalPaginas) {
            if (paginaFin < totalPaginas - 1) {
                const botonPuntos = document.createElement('button');
                botonPuntos.className = 'page-btn';
                botonPuntos.textContent = '...';
                botonPuntos.disabled = true;
                paginacion.appendChild(botonPuntos);
            }

            const botonUltima = document.createElement('button');
            botonUltima.className = 'page-btn';
            botonUltima.textContent = totalPaginas;
            botonUltima.addEventListener('click', () => this.cambiarPagina(totalPaginas));
            paginacion.appendChild(botonUltima);
        }

        // Botón siguiente
        const deshabilitadoSiguiente = paginaActual === totalPaginas ? "disabled" : "";
        const botonSiguiente = document.createElement('button');
        botonSiguiente.className = `page-btn ${deshabilitadoSiguiente}`;
        botonSiguiente.innerHTML = '<i class="fas fa-chevron-right"></i>';
        botonSiguiente.disabled = paginaActual === totalPaginas;
        
        if (!deshabilitadoSiguiente) {
            botonSiguiente.addEventListener('click', () => this.cambiarPagina(paginaActual + 1));
        }
        
        paginacion.appendChild(botonSiguiente);
    }

    /**
     * Cambia la página actual
     * @param {number} pagina - Número de página
     */
    cambiarPagina(pagina) {
        if (pagina < 1) return;
        
        this.paginaActual = pagina;
        this.cargarUsuarios();
    }

    /**
     * Actualiza el contador de usuarios
     * @param {number} cantidad - Cantidad de usuarios
     */
    actualizarContadorUsuarios(cantidad) {
        const elementoContador = document.getElementById('userCount');
        if (elementoContador) {
            const texto = cantidad === 1 ? "1 usuario" : `${cantidad} usuarios`;
            elementoContador.textContent = texto;
        }
    }

    /**
     * Abre el modal de usuario
     * @param {number|null} idUsuario - ID del usuario a editar (null para crear nuevo)
     */
    async abrirModalUsuario(idUsuario = null) {
        this.esEdicion = idUsuario !== null;
        const modal = document.getElementById('userModal');
        const tituloModal = document.getElementById('modalTitle');

        if (!modal || !tituloModal) return;

        if (this.esEdicion) {
            // Cargar datos del usuario
            mostrarCargando();

            try {
                const respuesta = await fetch(`/admin/api/usuarios/${idUsuario}`, {
                    headers: {
                        'Authorization': `Bearer ${this.obtenerToken()}`
                    }
                });

                if (respuesta.ok) {
                    const datos = await respuesta.json();
                    const usuario = datos.usuario;
                    
                    document.getElementById('userId').value = usuario.id;
                    document.getElementById('identificacion').value = usuario.identificacion;
                    document.getElementById('nombre').value = usuario.nombre;
                    document.getElementById('apellido').value = usuario.apellido;
                    document.getElementById('contrasena').value = "";

                    tituloModal.textContent = "Editar Usuario";
                    modal.classList.add("active");
                    
                    // Resetear la visibilidad de la contraseña al abrir el modal
                    this.resetearVisibilidadContrasena();
                } else {
                    mostrarNotificacion("Error al cargar el usuario", "error");
                }
            } catch (error) {
                console.error('Error al cargar usuario:', error);
                mostrarNotificacion("Error al cargar el usuario", "error");
            } finally {
                ocultarCargando();
            }
        } else {
            // Nuevo usuario
            this.reiniciarFormularioUsuario();
            tituloModal.textContent = "Nuevo Usuario";
            modal.classList.add("active");
            
            // Resetear la visibilidad de la contraseña al abrir el modal
            this.resetearVisibilidadContrasena();
        }
    }

    /**
     * Cierra el modal de usuario
     */
    cerrarModalUsuario() {
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.classList.remove("active");
            this.reiniciarFormularioUsuario();
            this.resetearVisibilidadContrasena();
        }
    }

    /**
     * Abre el modal de eliminación
     * @param {number} idUsuario - ID del usuario a eliminar
     */
    abrirModalEliminar(idUsuario) {
        this.idUsuarioEliminar = idUsuario;
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.classList.add("active");
        }
    }

    /**
     * Cierra el modal de eliminación
     */
    cerrarModalEliminar() {
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.classList.remove("active");
            this.idUsuarioEliminar = null;
        }
    }

    /**
     * Abre el modal de confirmación de cierre de sesión
     */
    abrirModalCerrarSesion() {
        const modal = document.getElementById('logoutConfirmModal');
        if (modal) {
            modal.classList.add("active");
        }
    }

    /**
     * Cierra el modal de confirmación de cierre de sesión
     */
    cerrarModalCerrarSesion() {
        const modal = document.getElementById('logoutConfirmModal');
        if (modal) {
            modal.classList.remove("active");
        }
    }
    
    /**
     * Resetea la visibilidad de la contraseña al estado oculto
     */
    resetearVisibilidadContrasena() {
        const inputContrasena = document.getElementById('contrasena');
        const toggleContrasena = document.getElementById('togglePassword');
        
        if (inputContrasena) {
            inputContrasena.setAttribute('type', 'password');
        }
        
        if (toggleContrasena) {
            const icono = toggleContrasena.querySelector('i');
            if (icono) {
                icono.className = 'fas fa-eye eye-icon';
            }
        }
    }

    /**
     * Guarda un usuario (crea o actualiza)
     */
    async guardarUsuario() {
        if (!this.validarFormularioUsuario()) {
            return;
        }

        const idUsuario = document.getElementById('userId').value;
        const esEdicion = idUsuario !== "";
        const url = esEdicion ? `/admin/api/usuarios/${idUsuario}` : "/admin/api/usuarios";
        const metodo = esEdicion ? "PUT" : "POST";

        const datosUsuario = {
            identificacion: document.getElementById('identificacion').value,
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
        };

        // Solo incluir la contraseña si se proporcionó
        const contrasena = document.getElementById('contrasena').value;
        if (contrasena) {
            datosUsuario.contrasena = contrasena;
        }

        mostrarCargando();

        try {
            const respuesta = await fetch(url, {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.obtenerToken()}`
                },
                body: JSON.stringify(datosUsuario)
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                this.cerrarModalUsuario();
                mostrarNotificacion(datos.mensaje, "success");
                this.cargarUsuarios();
                this.cargarEstadisticas();
            } else {
                const mensajeError = datos.mensaje || "Error al guardar el usuario";
                mostrarNotificacion(mensajeError, "error");
            }
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            mostrarNotificacion("Error al guardar el usuario", "error");
        } finally {
            ocultarCargando();
        }
    }

    /**
     * Elimina un usuario
     * @param {number} idUsuario - ID del usuario a eliminar
     */
    async eliminarUsuario(idUsuario) {
        if (!idUsuario) return;

        mostrarCargando();

        try {
            const respuesta = await fetch(`/admin/api/usuarios/${idUsuario}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${this.obtenerToken()}`
                }
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                this.cerrarModalEliminar();
                mostrarNotificacion(datos.mensaje, "success");
                this.cargarUsuarios();
                this.cargarEstadisticas();
            } else {
                const mensajeError = datos.mensaje || "Error al eliminar el usuario";
                mostrarNotificacion(mensajeError, "error");
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            mostrarNotificacion("Error al eliminar el usuario", "error");
        } finally {
            ocultarCargando();
        }
    }

    /**
     * Valida el formulario de usuario
     * @returns {boolean} - True si es válido, false si no
     */
    validarFormularioUsuario() {
        let esValido = true;

        // Resetear errores
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.textContent = '';
        });

        // Validar identificación
        const identificacion = document.getElementById('identificacion').value;
        const inputIdentificacion = document.getElementById('identificacion');
        
        if (!identificacion) {
            if (inputIdentificacion) {
                inputIdentificacion.classList.add('error');
                mostrarError(inputIdentificacion, "La identificación es obligatoria");
            }
            esValido = false;
        } else if (!validarIdentificacion(identificacion)) {
            if (inputIdentificacion) {
                inputIdentificacion.classList.add('error');
                mostrarError(inputIdentificacion, "La identificación debe tener al menos 8 dígitos numéricos");
            }
            esValido = false;
        }

        // Validar nombre
        const nombre = document.getElementById('nombre').value;
        const inputNombre = document.getElementById('nombre');
        
        if (!nombre) {
            if (inputNombre) {
                inputNombre.classList.add('error');
                mostrarError(inputNombre, "El nombre es obligatorio");
            }
            esValido = false;
        } else if (nombre.length < 2) {
            if (inputNombre) {
                inputNombre.classList.add('error');
                mostrarError(inputNombre, "El nombre debe tener al menos 2 caracteres");
            }
            esValido = false;
        }

        // Validar apellido
        const apellido = document.getElementById('apellido').value;
        const inputApellido = document.getElementById('apellido');
        
        if (!apellido) {
            if (inputApellido) {
                inputApellido.classList.add('error');
                mostrarError(inputApellido, "El apellido es obligatorio");
            }
            esValido = false;
        } else if (apellido.length < 2) {
            if (inputApellido) {
                inputApellido.classList.add('error');
                mostrarError(inputApellido, "El apellido debe tener al menos 2 caracteres");
            }
            esValido = false;
        }

        // Validar contraseña
        const contrasena = document.getElementById('contrasena').value;
        const inputContrasena = document.getElementById('contrasena');
        
        if (!this.esEdicion || contrasena) {
            if (!contrasena) {
                if (inputContrasena) {
                    inputContrasena.classList.add('error');
                    mostrarError(inputContrasena, "La contraseña es obligatoria");
                }
                esValido = false;
            } else if (contrasena.length < 8) {
                if (inputContrasena) {
                    inputContrasena.classList.add('error');
                    mostrarError(inputContrasena, "La contraseña debe tener al menos 8 caracteres");
                }
                esValido = false;
            } else if (!/[A-Z]/.test(contrasena)) {
                if (inputContrasena) {
                    inputContrasena.classList.add('error');
                    mostrarError(inputContrasena, "La contraseña debe incluir al menos una letra mayúscula");
                }
                esValido = false;
            } else if (!/[a-z]/.test(contrasena)) {
                if (inputContrasena) {
                    inputContrasena.classList.add('error');
                    mostrarError(inputContrasena, "La contraseña debe incluir al menos una letra minúscula");
                }
                esValido = false;
            } else if (!/\d/.test(contrasena)) {
                if (inputContrasena) {
                    inputContrasena.classList.add('error');
                    mostrarError(inputContrasena, "La contraseña debe incluir al menos un número");
                }
                esValido = false;
            }
        }

        return esValido;
    }

    /**
     * Reinicia el formulario de usuario
     */
    reiniciarFormularioUsuario() {
        const formulario = document.getElementById('userForm');
        if (formulario) {
            formulario.reset();
        }
        document.getElementById('userId').value = "";

        // Resetear errores
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.textContent = '';
        });
    }

    /**
     * Reinicia los filtros
     */
    reiniciarFiltros() {
        // Resetear todos los inputs de filtro
        document.getElementById('searchInput').value = "";
        document.getElementById('dateFrom').value = "";
        document.getElementById('dateTo').value = "";
        document.getElementById('sortSelect').value = "";
        document.getElementById('orderSelect').value = "asc";
        document.getElementById('perPageSelect').value = "10";

        // Resetear variables de filtro
        this.consultaBusqueda = "";
        this.fechaDesde = "";
        this.fechaHasta = "";
        this.ordenarPor = "";
        this.orden = "asc";
        this.elementosPorPagina = 10;

        // Remover indicador visual para filtros de fecha
        const iconoCalendario = document.querySelector(".filter-section-title i.fa-calendar");
        if (iconoCalendario) {
            iconoCalendario.classList.remove("text-primary");
        }

        // Ocultar indicadores de filtro
        const indicadorFecha = document.getElementById("dateFilterIndicator");
        const indicadorBusqueda = document.getElementById("searchFilterIndicator");
        
        if (indicadorFecha) indicadorFecha.style.display = 'none';
        if (indicadorBusqueda) indicadorBusqueda.style.display = 'none';

        this.paginaActual = 1;
        this.cargarUsuarios();

        // Cerrar el panel de filtros
        const botonAlternarFiltros = document.getElementById('filterToggleBtn');
        const panelFiltros = document.getElementById('filterPanel');
        
        if (botonAlternarFiltros && panelFiltros) {
            botonAlternarFiltros.classList.remove("active");
            panelFiltros.classList.remove("active");
        }
    }

    /**
     * Limpia todos los filtros
     */
    limpiarTodosLosFiltros() {
        this.reiniciarFiltros();
        mostrarNotificacion("Todos los filtros han sido limpiados", "success");
    }

    /**
     * Limpia el filtro de fecha
     */
    limpiarFiltroFecha() {
        // Limpiar filtros de fecha
        document.getElementById('dateFrom').value = "";
        document.getElementById('dateTo').value = "";
        this.fechaDesde = "";
        this.fechaHasta = "";

        // Remover indicador visual
        const iconoCalendario = document.querySelector(".filter-section-title i.fa-calendar");
        if (iconoCalendario) {
            iconoCalendario.classList.remove("text-primary");
        }
        
        const indicadorFecha = document.getElementById("dateFilterIndicator");
        if (indicadorFecha) {
            indicadorFecha.style.display = 'none';
        }

        mostrarNotificacion("Filtro de fechas limpiado", "success");
    }

    /**
     * Limpia el filtro de búsqueda
     */
    limpiarFiltroBusqueda() {
        // Limpiar filtro de búsqueda
        document.getElementById('searchInput').value = "";
        this.consultaBusqueda = "";
        
        const indicadorBusqueda = document.getElementById("searchFilterIndicator");
        if (indicadorBusqueda) {
            indicadorBusqueda.style.display = 'none';
        }

        mostrarNotificacion("Filtro de búsqueda limpiado", "success");
    }

    /**
     * Carga las estadísticas
     */
    async cargarEstadisticas() {
        try {
            const respuesta = await fetch('/admin/api/estadisticas', {
                headers: {
                    'Authorization': `Bearer ${this.obtenerToken()}`
                }
            });

            if (respuesta.ok) {
                const datos = await respuesta.json();
                // Aquí podrías actualizar elementos de estadísticas en la UI
                console.log('Estadísticas cargadas:', datos);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    }

    /**
     * Obtiene el token de autenticación
     * @returns {string|null} - Token de autenticación
     */
    obtenerToken() {
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
}

// Exportar la clase para usarla en otros archivos
export default AdminUsersModule;