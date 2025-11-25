/**
 * Módulo de Utilidades de Interfaz de Usuario
 * Gestiona elementos comunes de la interfaz como navegación, validaciones y componentes
 */

import { mostrarToast, setButtonLoading, setButtonNormal, mostrarError, limpiarError, validarIdentificacion, validarNombre, validarContrasena, logout } from './utils.js';

class UIModule {
    constructor() {
        // Inicializar handlers para evitar duplicados
        this.inputValidationHandler = null;
        this.actualizarPerfilHandler = null;
        this.togglePasswordHandler = null;
        this.escapeKeyListener = null;
        this.init();
    }

    /**
     * Inicializa los componentes de la interfaz de usuario
     */
    init() {
        this.actualizarNav();
        this.setupValidation();
        this.setupPasswordToggle();
        this.setupProfileForm();
        this.setupKeyboardNavigation();
    }

    /**
     * Configura la navegación por teclado para modales
     */
    setupKeyboardNavigation() {
        // Cerrar modales con la tecla Escape
        // Remover cualquier listener previo para evitar duplicados
        document.removeEventListener('keydown', this.escapeKeyListener);
        // Crear un nuevo handler con el contexto adecuado
        this.escapeKeyListener = (e) => {
            if (e.key === 'Escape') {
                // Cerrar cualquier modal abierto y limpiar errores
                const activeModals = document.querySelectorAll('.modal.active');
                activeModals.forEach(modal => {
                    modal.classList.remove('active');
                    
                    // Limpiar todos los mensajes de error en el formulario del modal
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
                });
            }
        };
        document.addEventListener('keydown', this.escapeKeyListener);
    }

    /**
     * Actualiza la navegación según el estado de autenticación del usuario
     */
    actualizarNav() {
        const navLinks = document.getElementById('nav-links');
        if (!navLinks) return;

        const token = localStorage.getItem('token');
        
        // Solo mostrar los iconos de usuario autenticado si estamos en /dashboard
        if (token && window.location.pathname === '/dashboard') {
            // Verificar si el token es válido haciendo una llamada a la API
            this.verificarTokenValido(token).then(esValido => {
                if (esValido) {
                    // Obtener información del usuario del localStorage
                    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
                    const nombre = usuario.nombre || '';
                    const apellido = usuario.apellido || '';
                    
                    // Generar iniciales para el avatar
                    const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
                    
                    navLinks.innerHTML = `
                        <li class="nav-user">
                            <div class="user-avatar" onclick="window.uiModule.abrirModalPerfil()" title="Perfil de usuario">${iniciales}</div>
                            <div class="user-info" onclick="window.uiModule.abrirModalPerfil()">
                                <span class="user-name">${nombre} ${apellido}</span>
                            </div>
                        </li>
                        <li>
                            <a href="#" onclick="window.uiModule.abrirModalConfirmacion(); return false;" class="logout-link" title="Cerrar Sesión">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                            </a>
                        </li>
                    `;
                } else {
                    // Token inválido, limpiar localStorage y mostrar navegación de invitado
                    localStorage.removeItem('token');
                    localStorage.removeItem('usuario');
                    this.mostrarNavegacionInvitado(navLinks);
                }
            }).catch(error => {
                // Error al verificar token, asumir que no es válido
                console.error('Error al verificar token:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                this.mostrarNavegacionInvitado(navLinks);
            });
        } else {
            this.mostrarNavegacionInvitado(navLinks);
        }
    }

    /**
     * Abre el modal de perfil de usuario
     */
    abrirModalPerfil() {
        const modal = document.getElementById('modal-perfil');
        if (modal) {
            // Cargar datos actuales del usuario
            const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
            if (usuario) {
                document.getElementById('perfil-identificacion').value = usuario.identificacion || '';
                document.getElementById('perfil-nombre').value = usuario.nombre || '';
                document.getElementById('perfil-apellido').value = usuario.apellido || '';
                
                // Limpiar campos de contraseña
                document.getElementById('perfil-contrasena-actual').value = '';
                document.getElementById('perfil-nueva-contrasena').value = '';
                document.getElementById('perfil-confirmar-contrasena').value = '';
            }
            
            modal.classList.add('active');
            
            // Limpiar todos los mensajes de error en el formulario del modal
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
     * Cierra el modal de perfil de usuario
     */
    cerrarModalPerfil() {
        const modal = document.getElementById('modal-perfil');
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
     * Configura el formulario de perfil
     */
    setupProfileForm() {
        const form = document.getElementById('perfil-form');
        if (form) {
            // Remover cualquier listener previo para evitar duplicados
            form.removeEventListener('submit', this.actualizarPerfilHandler);
            // Crear un nuevo handler con el contexto adecuado
            this.actualizarPerfilHandler = (e) => {
                e.preventDefault();
                this.actualizarPerfil();
            };
            form.addEventListener('submit', this.actualizarPerfilHandler);
        }
    }

    /**
     * Valida el formulario de perfil
     * @param {FormData} formData - Datos del formulario
     * @param {HTMLFormElement} form - Elemento del formulario
     * @returns {boolean} - True si es válido, false si no
     */
    validarPerfil(formData, form) {
        let isValid = true;
        let firstErrorField = null;
        
        // Limpiar todos los errores antes de validar
        const allInputs = form.querySelectorAll('input, textarea');
        allInputs.forEach(input => {
            limpiarError(input);
        });
        
        // Obtener valores
        const identificacion = formData.get('identificacion');
        const nombre = formData.get('nombre');
        const apellido = formData.get('apellido');
        const contrasenaActual = formData.get('contrasena_actual');
        const nuevaContrasena = formData.get('nueva_contrasena');
        const confirmarContrasena = formData.get('confirmar_contrasena');
        
        // Validar campos requeridos (solo si tienen valor)
        const identificacionInput = form.querySelector('#perfil-identificacion');
        const nombreInput = form.querySelector('#perfil-nombre');
        const apellidoInput = form.querySelector('#perfil-apellido');
        
        if (identificacionInput && !identificacionInput.value.trim()) {
            mostrarError(identificacionInput, 'La identificación es obligatoria');
            if (!firstErrorField) firstErrorField = identificacionInput;
            isValid = false;
        }
        
        if (nombreInput && !nombreInput.value.trim()) {
            mostrarError(nombreInput, 'El nombre es obligatorio');
            if (!firstErrorField) firstErrorField = nombreInput;
            isValid = false;
        }
        
        if (apellidoInput && !apellidoInput.value.trim()) {
            mostrarError(apellidoInput, 'El apellido es obligatorio');
            if (!firstErrorField) firstErrorField = apellidoInput;
            isValid = false;
        }
        
        // Validar identificación
        if (identificacion && identificacionInput && identificacionInput.value.trim() !== '') {
            if (!validarIdentificacion(identificacion)) {
                mostrarError(identificacionInput, 'La identificación debe tener al menos 8 dígitos y contener solo números');
                if (!firstErrorField) firstErrorField = identificacionInput;
                isValid = false;
            }
        }
        
        // Validar nombres
        if (nombre && nombreInput && nombreInput.value.trim() !== '') {
            if (!validarNombre(nombre)) {
                mostrarError(nombreInput, 'El nombre debe tener al menos 2 caracteres');
                if (!firstErrorField) firstErrorField = nombreInput;
                isValid = false;
            }
        }
        
        if (apellido && apellidoInput && apellidoInput.value.trim() !== '') {
            if (!validarNombre(apellido)) {
                mostrarError(apellidoInput, 'El apellido debe tener al menos 2 caracteres');
                if (!firstErrorField) firstErrorField = apellidoInput;
                isValid = false;
            }
        }
        
        // Validar cambio de contraseña
        if (contrasenaActual || nuevaContrasena || confirmarContrasena) {
            const contrasenaActualInput = form.querySelector('#perfil-contrasena-actual');
            const nuevaContrasenaInput = form.querySelector('#perfil-nueva-contrasena');
            const confirmarContrasenaInput = form.querySelector('#perfil-confirmar-contrasena');
            
            if (!contrasenaActual) {
                if (contrasenaActualInput) {
                    mostrarError(contrasenaActualInput, 'Debes ingresar tu contraseña actual para cambiarla');
                    if (!firstErrorField) firstErrorField = contrasenaActualInput;
                    isValid = false;
                }
            }
            
            if (!nuevaContrasena) {
                if (nuevaContrasenaInput) {
                    mostrarError(nuevaContrasenaInput, 'Debes ingresar una nueva contraseña');
                    if (!firstErrorField) firstErrorField = nuevaContrasenaInput;
                    isValid = false;
                }
            } else if (!validarContrasena(nuevaContrasena)) {
                if (nuevaContrasenaInput) {
                    mostrarError(nuevaContrasenaInput, 'La nueva contraseña debe tener al menos 6 caracteres');
                    if (!firstErrorField) firstErrorField = nuevaContrasenaInput;
                    isValid = false;
                }
            }
            
            if (!confirmarContrasena) {
                if (confirmarContrasenaInput) {
                    mostrarError(confirmarContrasenaInput, 'Debes confirmar tu nueva contraseña');
                    if (!firstErrorField) firstErrorField = confirmarContrasenaInput;
                    isValid = false;
                }
            }
            
            if (nuevaContrasena && confirmarContrasena && nuevaContrasena !== confirmarContrasena) {
                if (confirmarContrasenaInput) {
                    mostrarError(confirmarContrasenaInput, 'Las contraseñas no coinciden');
                    if (!firstErrorField) firstErrorField = confirmarContrasenaInput;
                    isValid = false;
                }
            }
        }
        
        // Enfocar el primer campo con error
        if (firstErrorField) {
            firstErrorField.focus();
        }
        
        return isValid;
    }

    /**
     * Actualiza el perfil del usuario
     */
    async actualizarPerfil() {
        const form = document.getElementById('perfil-form');
        const submitButton = document.getElementById('btn-actualizar-perfil');
        const originalText = submitButton.innerHTML;
        
        // Mostrar estado de carga
        setButtonLoading(submitButton, 'Actualizando...');
        
        // Prevenir envíos duplicados
        submitButton.disabled = true;
        
        try {
            const formData = new FormData(form);
            
            // Validar formulario
            if (!this.validarPerfil(formData, form)) {
                mostrarToast('Por favor corrige los errores en el formulario', 'error');
                return;
            }
            
            const token = localStorage.getItem('token');
            
            // Verificar que el token exista
            if (!token) {
                mostrarToast('Sesión expirada. Por favor inicia sesión nuevamente.', 'error');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('usuario');
                    window.location.href = '/';
                }, 2000);
                return;
            }
            
            const datos = {};
            let hasChanges = false;
            
            for (let [key, value] of formData.entries()) {
                // Solo incluir campos que tienen valor y no son campos de contraseña vacíos
                if (value && key !== 'contrasena_actual' && key !== 'nueva_contrasena' && key !== 'confirmar_contrasena') {
                    datos[key] = value;
                    hasChanges = true;
                }
            }
            
            // Si se está cambiando la contraseña, enviar los campos de contraseña
            if (formData.get('contrasena_actual') && formData.get('nueva_contrasena')) {
                datos.contrasena_actual = formData.get('contrasena_actual');
                datos.nueva_contrasena = formData.get('nueva_contrasena');
                datos.confirmar_contrasena = formData.get('confirmar_contrasena');
                hasChanges = true;
            }
            
            // Si no hay cambios, mostrar mensaje y salir
            if (!hasChanges) {
                mostrarToast('No se han realizado cambios en el perfil', 'info');
                return;
            }
            
            const response = await fetch('/auth/perfil', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datos)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Actualizar datos en localStorage
                localStorage.setItem('usuario', JSON.stringify(result.usuario));
                
                // Actualizar navegación
                this.actualizarNav();
                
                // Cerrar modal
                this.cerrarModalPerfil();
                
                // Mostrar mensaje de éxito
                mostrarToast('Perfil actualizado exitosamente', 'success');
            } else {
                // Mostrar error específico basado en el código de estado
                let mensaje = 'Error al actualizar el perfil';
                
                if (response.status === 400) {
                    mensaje = result.mensaje || 'Datos de perfil inválidos';
                } else if (response.status === 401) {
                    mensaje = 'Sesión expirada. Por favor inicia sesión nuevamente';
                    // Opcionalmente redirigir al login
                    setTimeout(() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('usuario');
                        window.location.href = '/';
                    }, 2000);
                } else if (response.status === 404) {
                    mensaje = 'No se encontró el recurso. Por favor recarga la página';
                } else if (response.status >= 500) {
                    mensaje = 'Error del servidor. Por favor intenta más tarde';
                }
                
                mostrarToast(mensaje, 'error');
            }
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            
            // Verificar si es un error de red o CORS
            if (error instanceof TypeError && error.message.includes('fetch')) {
                mostrarToast('Error de conexión. Por favor verifica tu conexión a internet.', 'error');
            } else {
                mostrarToast('Error inesperado. Por favor intenta nuevamente.', 'error');
            }
        } finally {
            // Restaurar botón
            setButtonNormal(submitButton, originalText);
            submitButton.disabled = false;
        }
    }

    /**
     * Abre el modal de confirmación de cierre de sesión
     */
    abrirModalConfirmacion() {
        const modal = document.getElementById('modal-confirmacion-logout');
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Cierra el modal de confirmación de cierre de sesión
     */
    cerrarModalConfirmacion() {
        const modal = document.getElementById('modal-confirmacion-logout');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Configura la validación de formularios
     */
    setupValidation() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            // Remover cualquier listener previo para evitar duplicados
            input.removeEventListener('input', this.inputValidationHandler);
            // Crear un nuevo handler con el contexto adecuado
            this.inputValidationHandler = (e) => {
                if (e.target.value.trim() !== '') {
                    limpiarError(e.target);
                }
            };
            input.addEventListener('input', this.inputValidationHandler);
        });
    }

    /**
     * Configura el toggle de visibilidad de contraseñas
     */
    setupPasswordToggle() {
        // Agregar event listeners a todos los botones de toggle de contraseña
        const toggleButtons = document.querySelectorAll('.toggle-password');
        toggleButtons.forEach(button => {
            // Remover cualquier listener previo para evitar duplicados
            button.removeEventListener('click', this.togglePasswordHandler);
            // Crear un nuevo handler con el contexto adecuado
            this.togglePasswordHandler = function() {
                const targetId = this.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);
                
                if (passwordInput) {
                    // Alternar entre tipos de contraseña y texto
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        this.innerHTML = '<span class="eye-icon">🔒</span>';
                    } else {
                        passwordInput.type = 'password';
                        this.innerHTML = '<span class="eye-icon">👁️</span>';
                    }
                }
            };
            button.addEventListener('click', this.togglePasswordHandler);
        });
    }

    /**
     * Abre un modal de autenticación
     * @param {string} id - ID del modal a abrir
     */
    abrirModalAuth(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            
            // Limpiar todos los mensajes de error en el formulario del modal
            // y resetear los campos
            const form = modal.querySelector('form');
            if (form) {
                form.querySelectorAll('.form-group').forEach(formGroup => {
                    formGroup.classList.remove('error');
                    const errorMsg = formGroup.querySelector('.error-msg');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                });
                
                // Resetear campos del formulario
                form.reset();
            }
        }
    }

    /**
     * Cierra un modal de autenticación
     * @param {string} id - ID del modal a cerrar
     */
    cerrarModalAuth(id) {
        const modal = document.getElementById(id);
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
     * Cambia entre modales de autenticación
     * @param {string} targetId - ID del modal a abrir
     */
    switchModal(targetId) {
        // Limpiar errores y campos en todos los modales antes de cambiar
        document.querySelectorAll('.modal').forEach(m => {
            m.classList.remove('active');
            const form = m.querySelector('form');
            if (form) {
                // Limpiar errores
                form.querySelectorAll('.form-group').forEach(formGroup => {
                    formGroup.classList.remove('error');
                    const errorMsg = formGroup.querySelector('.error-msg');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                });
                
                // Resetear campos del formulario
                form.reset();
            }
        });
        this.abrirModalAuth(targetId);
    }

    /**
     * Verifica si un token JWT es válido
     * @param {string} token - Token JWT a verificar
     * @returns {Promise<boolean>} - Promise que resuelve a true si el token es válido, false si no
     */
    async verificarTokenValido(token) {
        try {
            // Hacer una llamada ligera a la API para verificar el token
            const response = await fetch('/auth/perfil', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Si la respuesta es 200, el token es válido
            // Si es 401, el token es inválido
            return response.status === 200;
        } catch (error) {
            console.error('Error al verificar token:', error);
            return false;
        }
    }

    /**
     * Muestra la navegación para usuarios no autenticados
     * @param {HTMLElement} navLinks - Elemento donde se insertará la navegación
     */
    mostrarNavegacionInvitado(navLinks) {
        navLinks.innerHTML = `
            <li><a href="#" onclick="window.uiModule.abrirModalAuth('modal-login'); return false;" class="btn btn-primary nav-login-btn">Iniciar Sesión</a></li>
        `;
    }

    /**
     * Cierra la sesión del usuario
     */
    logout() {
        logout();
        // Actualizar la navegación inmediatamente
        this.actualizarNav();
    }
}

// Exportar la clase para usarla en otros archivos
export default UIModule;