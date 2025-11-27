/**
 * Módulo de Autenticación para Administradores
 * Gestiona el inicio de sesión de administradores
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
    validarContrasena,
    cerrarSesion
} from './utils.js';

/**
 * Clase que representa el módulo de autenticación para administradores
 * Gestiona todas las operaciones relacionadas con el inicio de sesión
 */
class AdminAuthModule {
    /**
     * Constructor del módulo de autenticación
     * Inicializa las propiedades y configura los event listeners
     */
    constructor() {
        this.apiURL = '';
        // Inicializar handlers para evitar duplicados
        this.manejarInicioSesionHandler = null;
        this.init();
    }

    /**
     * Inicializa los event listeners para el formulario de inicio de sesión
     * Configura todos los componentes necesarios para el funcionamiento del módulo
     */
    init() {
        // Manejo del formulario de inicio de sesión
        const formularioInicioSesion = document.getElementById('loginForm');
        if (formularioInicioSesion) {
            // Remover cualquier listener previo para evitar duplicados
            formularioInicioSesion.removeEventListener('submit', this.manejarInicioSesionHandler);
            // Crear un nuevo handler con el contexto adecuado
            this.manejarInicioSesionHandler = (e) => this.manejarInicioSesion(e);
            formularioInicioSesion.addEventListener('submit', this.manejarInicioSesionHandler);
        }

        // Configurar toggle de visibilidad de contraseña
        this.configurarToggleContrasena();
        
        // Configurar cierre de notificaciones
        this.configurarCierreNotificaciones();
        
        // Configurar validación en tiempo real
        this.configurarValidacionTiempoReal();
    }

    /**
     * Configura el toggle de visibilidad de contraseñas
     * Permite al usuario mostrar/ocultar la contraseña ingresada
     */
    configurarToggleContrasena() {
        const toggleContrasena = document.getElementById('togglePassword');
        if (toggleContrasena) {
            toggleContrasena.addEventListener('click', function() {
                const inputContrasena = document.getElementById('password');
                if (inputContrasena) {
                    const tipo = inputContrasena.getAttribute('type') === 'password' ? 'text' : 'password';
                    inputContrasena.setAttribute('type', tipo);
                    
                    // Cambiar icono
                    const icono = this.querySelector('i');
                    icono.className = tipo === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
                }
            });
        }
    }

    /**
     * Configura la validación en tiempo real de los campos del formulario
     * Limpia los errores cuando el usuario comienza a escribir
     */
    configurarValidacionTiempoReal() {
        const inputIdentificacion = document.getElementById('identification');
        const inputContrasena = document.getElementById('password');
        
        if (inputIdentificacion) {
            inputIdentificacion.addEventListener('input', () => {
                if (inputIdentificacion.value.trim() !== '') {
                    limpiarError(inputIdentificacion);
                }
            });
        }
        
        if (inputContrasena) {
            inputContrasena.addEventListener('input', () => {
                if (inputContrasena.value.trim() !== '') {
                    limpiarError(inputContrasena);
                }
            });
        }
    }

    /**
     * Configura el cierre de notificaciones
     * Permite al usuario cerrar manualmente las notificaciones
     */
    configurarCierreNotificaciones() {
        const cerrarNotificacion = document.getElementById('closeNotification');
        if (cerrarNotificacion) {
            cerrarNotificacion.addEventListener('click', function() {
                const notificacion = document.getElementById('notification');
                if (notificacion) {
                    notificacion.classList.remove('show');
                }
            });
        }
    }

    /**
     * Maneja el proceso de inicio de sesión
     * Valida el formulario, envía los datos al servidor y procesa la respuesta
     * @param {Event} e - Evento de submit del formulario
     */
    async manejarInicioSesion(e) {
        e.preventDefault();
        const formulario = e.target;
        
        // Validar formulario antes de enviar
        if (!this.validarFormulario(formulario)) {
            mostrarNotificacion('Por favor corrige los errores en el formulario', 'error');
            return;
        }

        const formData = new FormData(formulario);
        const datos = Object.fromEntries(formData.entries());

        // Mostrar indicador de carga en el botón de inicio de sesión
        const botonInicioSesion = formulario.querySelector('.login-btn');
        const textoOriginal = botonInicioSesion.innerHTML;
        establecerBotonCargando(botonInicioSesion, 'Verificando...');
        
        // Prevenir envíos duplicados
        botonInicioSesion.disabled = true;

        try {
            const res = await fetch(`${this.apiURL}/admin/auth/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identificacion: datos.identification,
                    contrasena: datos.password
                })
            });
            
            const resultado = await res.json();

            if (res.ok && res.status === 200) {
                // Guardar token y administrador en localStorage
                localStorage.setItem('admin_token', resultado.token);
                localStorage.setItem('administrador', JSON.stringify(resultado.administrador));
                
                // Guardar token en una cookie para SSR
                this.establecerCookie('admin_token', resultado.token, 1); // 1 día de expiración
                
                // Mostrar notificación de éxito
                mostrarNotificacion(resultado.mensaje || '¡Inicio de sesión exitoso! Redirigiendo...', 'success');
                
                // Redirigir al panel de administración después de un tiempo
                setTimeout(() => {
                    window.location.href = '/admin/dashboard';
                }, 2000);
            } else if (res.status === 401) {
                // Mostrar mensaje de error específico del backend
                mostrarNotificacion('Credenciales incorrectas', 'error');
            } else if (res.status >= 500) {
                mostrarNotificacion('Error del servidor. Por favor intente nuevamente más tarde.', 'error');
            } else {
                mostrarNotificacion('Error desconocido. Por favor intente nuevamente.', 'error');
            }
        } catch (error) {
            console.error('Error en el proceso de inicio de sesión:', error);
            mostrarNotificacion('Error de conexión. Por favor verifique su conexión e intente nuevamente.', 'error');
        } finally {
            // Restaurar el botón a su estado original
            restaurarBoton(botonInicioSesion, textoOriginal);
            botonInicioSesion.disabled = false;
        }
    }

    /**
     * Establece una cookie en el navegador
     * @param {string} nombre - Nombre de la cookie
     * @param {string} valor - Valor de la cookie
     * @param {number} dias - Días de expiración de la cookie
     */
    establecerCookie(nombre, valor, dias) {
        const expiracion = new Date();
        expiracion.setTime(expiracion.getTime() + (dias * 24 * 60 * 60 * 1000));
        document.cookie = `${nombre}=${valor};expires=${expiracion.toUTCString()};path=/`;
    }

    /**
     * Valida un formulario verificando que todos los campos requeridos estén completos
     * y cumplan con los criterios de validación
     * @param {HTMLFormElement} formulario - Formulario a validar
     * @returns {boolean} - True si es válido, false si no
     */
    validarFormulario(formulario) {
        // Limpiar todos los errores antes de validar
        const todosLosInputs = formulario.querySelectorAll('input');
        todosLosInputs.forEach(input => {
            limpiarError(input);
        });
        
        let esValido = true;
        let primerCampoConError = null;
        
        // Validar identificación
        const inputIdentificacion = formulario.querySelector('#identification');
        if (inputIdentificacion) {
            const identificacion = inputIdentificacion.value.trim();
            
            if (!identificacion) {
                mostrarError(inputIdentificacion, 'Este campo es obligatorio');
                if (!primerCampoConError) primerCampoConError = inputIdentificacion;
                esValido = false;
            } else if (!validarIdentificacion(identificacion)) {
                mostrarError(inputIdentificacion, 'La identificación debe tener al menos 8 dígitos y contener solo números');
                if (!primerCampoConError) primerCampoConError = inputIdentificacion;
                esValido = false;
            }
        }
        
        // Validar contraseña
        const inputContrasena = formulario.querySelector('#password');
        if (inputContrasena) {
            const contrasena = inputContrasena.value.trim();
            
            if (!contrasena) {
                mostrarError(inputContrasena, 'Este campo es obligatorio');
                if (!primerCampoConError) primerCampoConError = inputContrasena;
                esValido = false;
            } else if (!validarContrasena(contrasena)) {
                mostrarError(inputContrasena, 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúscula, minúscula y número');
                if (!primerCampoConError) primerCampoConError = inputContrasena;
                esValido = false;
            }
        }
        
        // Enfocar el primer campo con error
        if (primerCampoConError) {
            primerCampoConError.focus();
        }
        
        return esValido;
    }
}

// Exportar la clase para usarla en otros archivos
export default AdminAuthModule;