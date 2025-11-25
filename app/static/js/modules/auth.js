/**
 * Módulo de Autenticación
 * Gestiona el inicio de sesión y registro de usuarios
 */

import { mostrarToast, setButtonLoading, setButtonNormal, mostrarError, limpiarError, validarIdentificacion, validarNombre, validarContrasena, verificarYLimpiarAutenticacion } from './utils.js';

class AuthModule {
    constructor() {
        this.apiURL = '';
        // Inicializar handlers para evitar duplicados
        this.handleLoginHandler = null;
        this.handleRegistroHandler = null;
        this.init();
        
        // Verificar el estado de autenticación al cargar el módulo
        this.verificarEstadoAutenticacion();
    }

    /**
     * Inicializa los event listeners para los formularios de autenticación
     */
    init() {
        // Manejo del formulario de inicio de sesión
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            // Remover cualquier listener previo para evitar duplicados
            loginForm.removeEventListener('submit', this.handleLoginHandler);
            // Crear un nuevo handler con el contexto adecuado
            this.handleLoginHandler = (e) => this.handleLogin(e);
            loginForm.addEventListener('submit', this.handleLoginHandler);
        }

        // Manejo del formulario de registro
        const registroForm = document.getElementById('registro-form');
        if (registroForm) {
            // Remover cualquier listener previo para evitar duplicados
            registroForm.removeEventListener('submit', this.handleRegistroHandler);
            // Crear un nuevo handler con el contexto adecuado
            this.handleRegistroHandler = (e) => this.handleRegistro(e);
            registroForm.addEventListener('submit', this.handleRegistroHandler);
        }
    }

    /**
     * Verifica el estado de autenticación al cargar el módulo
     */
    async verificarEstadoAutenticacion() {
        // Verificar y limpiar la autenticación si es necesario
        await verificarYLimpiarAutenticacion();
        
        // Si estamos en la página de inicio, actualizar la navegación
        if (window.location.pathname === '/' && window.uiModule) {
            window.uiModule.actualizarNav();
        }
    }

    /**
     * Maneja el proceso de inicio de sesión
     * @param {Event} e - Evento de submit
     */
    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        
        // Validar formulario antes de enviar
        if (!this.validarFormulario(form)) {
            mostrarToast('Por favor corrige los errores en el formulario', 'error');
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Mostrar indicador de carga en el botón de inicio de sesión
        const loginBtn = form.querySelector('button[type="submit"]');
        const originalText = loginBtn.innerHTML;
        setButtonLoading(loginBtn, 'Ingresando...');
        
        // Prevenir envíos duplicados
        loginBtn.disabled = true;

        try {
            const res = await fetch(`${this.apiURL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await res.json();

            if (res.ok) {
                // Guardar token y usuario en localStorage
                localStorage.setItem('token', result.token);
                localStorage.setItem('usuario', JSON.stringify(result.usuario));
                
                // Guardar token en una cookie para SSR
                this.setCookie('token', result.token, 1); // 1 día de expiración
                
                // Mostrar notificación de éxito
                mostrarToast('Inicio de sesión exitoso', 'success');
                
                // Cerrar modal y redirigir al dashboard
                this.cerrarModalAuth('modal-login');
                setTimeout(() => window.location.href = '/dashboard', 500);
            } else {
                // Mostrar mensaje de error específico del backend
                mostrarToast(result.mensaje || 'Usuario o contraseña incorrectos', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarToast('Error de conexión', 'error');
        } finally {
            // Restaurar el botón a su estado original
            setButtonNormal(loginBtn, originalText);
            loginBtn.disabled = false;
        }
    }

    /**
     * Maneja el proceso de registro
     * @param {Event} e - Evento de submit
     */
    async handleRegistro(e) {
        e.preventDefault();
        const form = e.target;
        
        // Validar formulario antes de enviar
        if (!this.validarFormulario(form)) {
            mostrarToast('Por favor corrige los errores en el formulario', 'error');
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Mostrar indicador de carga en el botón de registro
        const registroBtn = form.querySelector('button[type="submit"]');
        const originalText = registroBtn.innerHTML;
        setButtonLoading(registroBtn, 'Registrando...');
        
        // Prevenir envíos duplicados
        registroBtn.disabled = true;

        try {
            const res = await fetch(`${this.apiURL}/auth/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await res.json();

            if (res.ok) {
                mostrarToast('Registro exitoso. Inicia sesión.', 'success');
                this.cerrarModalAuth('modal-registro');
                this.switchModal('modal-login');
            } else {
                mostrarToast(result.mensaje, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarToast('Error al registrarse', 'error');
        } finally {
            // Restaurar el botón a su estado original
            setButtonNormal(registroBtn, originalText);
            registroBtn.disabled = false;
        }
    }

    /**
     * Establece una cookie
     * @param {string} name - Nombre de la cookie
     * @param {string} value - Valor de la cookie
     * @param {number} days - Días de expiración
     */
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
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
        
        // Para el formulario de login, verificar que los campos no estén vacíos y tengan longitud mínima
        if (form.id === 'login-form') {
            const identificacion = form.querySelector('#login-identificacion');
            const contrasena = form.querySelector('#login-contrasena');
            
            // Validar identificación
            if (!identificacion.value.trim()) {
                mostrarError(identificacion, 'La identificación es obligatoria');
                if (!firstErrorField) firstErrorField = identificacion;
                isValid = false;
            } else if (!validarIdentificacion(identificacion.value.trim())) {
                mostrarError(identificacion, 'La identificación debe tener al menos 8 dígitos y contener solo números');
                if (!firstErrorField) firstErrorField = identificacion;
                isValid = false;
            }
            
            // Validar contraseña
            if (!contrasena.value.trim()) {
                mostrarError(contrasena, 'La contraseña es obligatoria');
                if (!firstErrorField) firstErrorField = contrasena;
                isValid = false;
            } else if (contrasena.value.trim().length < 6) {
                mostrarError(contrasena, 'La contraseña debe tener al menos 6 caracteres');
                if (!firstErrorField) firstErrorField = contrasena;
                isValid = false;
            }
            
            // Enfocar el primer campo con error
            if (firstErrorField) {
                firstErrorField.focus();
            }
            
            return isValid;
        }
        
        // Para el formulario de registro, mantener las validaciones existentes pero mejoradas
        const requiredInputs = form.querySelectorAll('input[required], textarea[required]');

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                mostrarError(input, 'Este campo es obligatorio');
                if (!firstErrorField) firstErrorField = input;
                isValid = false;
            }
        });
        
        // Validaciones específicas por campo
        const regIdentificacion = form.querySelector('#reg-identificacion');
        const regNombre = form.querySelector('#reg-nombre');
        const regApellido = form.querySelector('#reg-apellido');
        const regContrasena = form.querySelector('#reg-contrasena');
        
        // Validar identificación en registro
        if (regIdentificacion && regIdentificacion.value.trim() !== '') {
            if (!validarIdentificacion(regIdentificacion.value.trim())) {
                mostrarError(regIdentificacion, 'La identificación debe tener al menos 8 dígitos y contener solo números');
                if (!firstErrorField) firstErrorField = regIdentificacion;
                isValid = false;
            }
        } else if (regIdentificacion && !regIdentificacion.value.trim()) {
            mostrarError(regIdentificacion, 'La identificación es obligatoria');
            if (!firstErrorField) firstErrorField = regIdentificacion;
            isValid = false;
        }
        
        // Validar nombre en registro
        if (regNombre && regNombre.value.trim() !== '') {
            if (!validarNombre(regNombre.value.trim())) {
                mostrarError(regNombre, 'El nombre debe tener al menos 2 caracteres');
                if (!firstErrorField) firstErrorField = regNombre;
                isValid = false;
            }
        } else if (regNombre && !regNombre.value.trim()) {
            mostrarError(regNombre, 'El nombre es obligatorio');
            if (!firstErrorField) firstErrorField = regNombre;
            isValid = false;
        }
        
        // Validar apellido en registro
        if (regApellido && regApellido.value.trim() !== '') {
            if (!validarNombre(regApellido.value.trim())) {
                mostrarError(regApellido, 'El apellido debe tener al menos 2 caracteres');
                if (!firstErrorField) firstErrorField = regApellido;
                isValid = false;
            }
        } else if (regApellido && !regApellido.value.trim()) {
            mostrarError(regApellido, 'El apellido es obligatorio');
            if (!firstErrorField) firstErrorField = regApellido;
            isValid = false;
        }
        
        // Validar contraseña en registro
        if (regContrasena && regContrasena.value.trim() !== '') {
            if (!validarContrasena(regContrasena.value.trim())) {
                mostrarError(regContrasena, 'La contraseña debe tener al menos 6 caracteres');
                if (!firstErrorField) firstErrorField = regContrasena;
                isValid = false;
            }
        } else if (regContrasena && !regContrasena.value.trim()) {
            mostrarError(regContrasena, 'La contraseña es obligatoria');
            if (!firstErrorField) firstErrorField = regContrasena;
            isValid = false;
        }
        
        // Enfocar el primer campo con error
        if (firstErrorField) {
            firstErrorField.focus();
        }

        return isValid;
    }

    /**
     * Cierra un modal de autenticación
     * @param {string} id - ID del modal a cerrar
     */
    cerrarModalAuth(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('active');
    }

    /**
     * Cambia entre modales de autenticación
     * @param {string} targetId - ID del modal a abrir
     */
    switchModal(targetId) {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        this.abrirModalAuth(targetId);
    }

    /**
     * Abre un modal de autenticación
     * @param {string} id - ID del modal a abrir
     */
    abrirModalAuth(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('active');
    }
}

// Exportar la clase para usarla en otros archivos
export default AuthModule;