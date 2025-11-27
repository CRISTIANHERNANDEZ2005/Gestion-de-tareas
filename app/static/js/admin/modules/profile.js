/**
 * Módulo de Perfil para Administradores
 * Gestiona la actualización del perfil de administradores
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
    validarContrasena
} from './utils.js';

/**
 * Clase que representa el módulo de perfil para administradores
 * Gestiona todas las operaciones relacionadas con la edición del perfil
 */
class AdminProfileModule {
    /**
     * Constructor del módulo de perfil
     * Inicializa las propiedades y configura los event listeners
     */
    constructor() {
        this.apiURL = '';
        this.init();
    }

    /**
     * Inicializa los event listeners para el perfil de administrador
     * Configura todos los componentes necesarios para el funcionamiento del módulo
     */
    init() {
        // Manejo del botón de edición de perfil
        const botonEditarPerfil = document.getElementById('editProfileBtn');
        if (botonEditarPerfil) {
            botonEditarPerfil.addEventListener('click', () => this.abrirModalPerfil());
        }

        // Manejo del formulario de perfil
        const formularioPerfil = document.getElementById('profileForm');
        if (formularioPerfil) {
            formularioPerfil.addEventListener('submit', (e) => this.manejarActualizacionPerfil(e));
        }

        // Manejo del botón de guardar
        const botonGuardar = document.getElementById('profileSaveBtn');
        if (botonGuardar) {
            botonGuardar.addEventListener('click', (e) => {
                // Prevenir el comportamiento por defecto
                e.preventDefault();
                
                // Disparar el evento submit del formulario
                const formulario = document.getElementById('profileForm');
                if (formulario) {
                    formulario.dispatchEvent(new Event('submit', { cancelable: true }));
                }
            });
        }

        // Configurar cierre del modal
        this.configurarCierreModal();

        // Configurar toggle de visibilidad de contraseña
        this.configurarToggleContrasena();

        // Configurar botones de cancelar
        this.configurarBotonesCancelar();
    }

    /**
     * Abre el modal de edición de perfil y carga los datos actuales
     * Obtiene los datos del perfil del servidor y los muestra en el formulario
     */
    async abrirModalPerfil() {
        const modal = document.getElementById('profileModal');
        const formulario = document.getElementById('profileForm');
        
        if (!modal || !formulario) return;

        try {
            // Cargar datos del perfil actual
            const respuesta = await fetch(`/admin/auth/api/perfil`, {
                headers: {
                    'Authorization': `Bearer ${this.obtenerToken()}`
                }
            });

            if (respuesta.ok) {
                const datos = await respuesta.json();
                const administrador = datos.administrador;

                // Rellenar formulario con datos actuales
                document.getElementById('profileId').value = administrador.id;
                document.getElementById('profileIdentificacion').value = administrador.identificacion;
                document.getElementById('profileNombre').value = administrador.nombre;
                document.getElementById('profileApellido').value = administrador.apellido;

                // Limpiar campo de contraseña
                document.getElementById('profileContrasena').value = '';

                // Mostrar modal
                modal.classList.add('active');
            } else {
                mostrarNotificacion('Error al cargar los datos del perfil', 'error');
            }
        } catch (error) {
            console.error('Error al abrir modal de perfil:', error);
            mostrarNotificacion('Error de conexión. Por favor intente nuevamente.', 'error');
        }
    }

    /**
     * Maneja la actualización del perfil
     * Valida el formulario, envía los datos al servidor y procesa la respuesta
     * @param {Event} e - Evento de submit del formulario
     */
    async manejarActualizacionPerfil(e) {
        e.preventDefault();
        const formulario = e.target;
        
        // Validar formulario antes de enviar
        if (!this.validarFormulario(formulario)) {
            return;
        }

        const datos = {
            id: document.getElementById('profileId').value,
            identificacion: document.getElementById('profileIdentificacion').value,
            nombre: document.getElementById('profileNombre').value,
            apellido: document.getElementById('profileApellido').value,
            contrasena: document.getElementById('profileContrasena').value
        };

        // Si no se proporcionó contraseña, no enviar el campo
        if (!datos.contrasena) {
            delete datos.contrasena;
        }

        // Mostrar indicador de carga en el botón de guardar
        const botonGuardar = document.getElementById('profileSaveBtn');
        const textoOriginal = botonGuardar.innerHTML;
        establecerBotonCargando(botonGuardar, 'Guardando...');

        try {
            const res = await fetch(`/admin/auth/api/perfil`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.obtenerToken()}`
                },
                body: JSON.stringify(datos)
            });
            
            const resultado = await res.json();

            if (res.ok && res.status === 200) {
                // Actualizar datos del administrador en localStorage
                localStorage.setItem('administrador', JSON.stringify(resultado.administrador));
                
                // Mostrar notificación de éxito
                mostrarNotificacion(resultado.mensaje || '¡Perfil actualizado exitosamente!', 'success');
                
                // Cerrar modal después de un tiempo
                setTimeout(() => {
                    this.cerrarModalPerfil();
                    // Recargar la página para reflejar los cambios en el header
                    location.reload();
                }, 2000);
            } else {
                // Mostrar errores específicos del backend
                if (resultado.mensaje) {
                    mostrarNotificacion(resultado.mensaje, 'error');
                } else {
                    mostrarNotificacion('Error al actualizar el perfil', 'error');
                }
                
                // Mostrar errores de validación específicos por campo
                if (resultado.errores) {
                    this.mostrarErroresCampos(resultado.errores);
                }
            }
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            mostrarNotificacion('Error de conexión. Por favor verifique su conexión e intente nuevamente.', 'error');
        } finally {
            // Restaurar el botón a su estado original
            restaurarBoton(botonGuardar, textoOriginal);
        }
    }

    /**
     * Configura el cierre del modal de perfil
     * Permite cerrar el modal mediante el botón de cierre o haciendo clic fuera del contenido
     */
    configurarCierreModal() {
        const botonCerrar = document.getElementById('profileModalClose');
        const modal = document.getElementById('profileModal');
        
        if (botonCerrar && modal) {
            botonCerrar.addEventListener('click', () => this.cerrarModalPerfil());
            
            // Cerrar modal al hacer clic fuera del contenido
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.cerrarModalPerfil();
                }
            });
        }
    }

    /**
     * Cierra el modal de perfil
     * Oculta el modal y reinicia el formulario
     */
    cerrarModalPerfil() {
        const modal = document.getElementById('profileModal');
        if (modal) {
            modal.classList.remove('active');
            this.reiniciarFormularioPerfil();
        }
    }

    /**
     * Configura el toggle de visibilidad de contraseña
     * Permite al usuario mostrar/ocultar la contraseña ingresada
     */
    configurarToggleContrasena() {
        const toggleContrasena = document.getElementById('toggleProfilePassword');
        if (toggleContrasena) {
            toggleContrasena.addEventListener('click', function() {
                const inputContrasena = document.getElementById('profileContrasena');
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
     * Configura los botones de cancelar
     * Permite cerrar el modal mediante el botón de cancelar
     */
    configurarBotonesCancelar() {
        const botonCancelar = document.getElementById('profileCancelBtn');
        if (botonCancelar) {
            botonCancelar.addEventListener('click', () => this.cerrarModalPerfil());
        }
    }

    /**
     * Valida un formulario verificando que todos los campos requeridos estén completos
     * y cumplan con los criterios de validación
     * @param {HTMLFormElement} formulario - Formulario a validar
     * @returns {boolean} - True si es válido, false si no
     */
    validarFormulario(formulario) {
        let esValido = true;

        // Resetear errores
        document.querySelectorAll('#profileForm .form-input').forEach(input => {
            input.classList.remove('error');
        });
        document.querySelectorAll('#profileForm .error-message').forEach(msg => {
            msg.textContent = '';
        });

        // Validar identificación
        const identificacion = document.getElementById('profileIdentificacion').value;
        const inputIdentificacion = document.getElementById('profileIdentificacion');
        
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
        const nombre = document.getElementById('profileNombre').value;
        const inputNombre = document.getElementById('profileNombre');
        
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
        const apellido = document.getElementById('profileApellido').value;
        const inputApellido = document.getElementById('profileApellido');
        
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

        // Validar contraseña (opcional, pero si se proporciona debe ser válida)
        const contrasena = document.getElementById('profileContrasena').value;
        const inputContrasena = document.getElementById('profileContrasena');
        
        // Siempre validar la contraseña si se proporciona
        if (contrasena) {
            if (contrasena.length < 8) {
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
     * Reinicia el formulario de perfil 
     * Limpia todos los campos y errores del formulario
     */
    reiniciarFormularioPerfil() {
        const formulario = document.getElementById('profileForm');
        if (formulario) {
            formulario.reset();
        }

        // Resetear errores
        document.querySelectorAll('#profileForm .form-input').forEach(input => {
            input.classList.remove('error');
        });
        document.querySelectorAll('#profileForm .error-message').forEach(msg => {
            msg.textContent = '';
        });
    }

    /**
     * Muestra errores específicos por campo
     * @param {Object} errores - Objeto con errores por campo
     */
    mostrarErroresCampos(errores) {
        Object.keys(errores).forEach(campo => {
            const input = document.getElementById(`profile${campo.charAt(0).toUpperCase() + campo.slice(1)}`);
            if (input) {
                mostrarError(input, errores[campo]);
            }
        });
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
export default AdminProfileModule;