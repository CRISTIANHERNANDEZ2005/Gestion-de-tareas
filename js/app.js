/**
 * js/app.js
 * Punto de entrada principal de la aplicación JavaScript.
 * Importa y coordina todos los módulos de la aplicación.
 * 
 * @package GestorTareas
 */

// Importar módulos
import { 
    cerrarMensaje, 
    limpiarParametroMensaje, 
    ocultarMensajeAutomaticamente, 
    limpiarSessionStorage,
    mostrarMensajeFlotante
} from './modules/messageHandler.js';

import { 
    mostrarError, 
    limpiarError, 
    ocultarMensajesErrorCampos, 
    validarCampoTexto, 
    validarFecha 
} from './modules/formValidator.js';

import { 
    mostrarModalEliminacion, 
    ocultarModalEliminacion, 
    eliminarTarea 
} from './modules/taskManager.js';

/**
 * Inicialización de la aplicación cuando el DOM está cargado
 */
document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formulario-tareas');
    const tituloInput = document.getElementById('titulo');
    const descripcionInput = document.getElementById('descripcion');
    const fechaLimiteInput = document.getElementById('fecha_limite');
    const cerrarMensajeBtn = document.getElementById('cerrar-mensaje-btn');
    
    // Elementos del modal de eliminación
    const modal = document.getElementById('modal-eliminacion');
    const cerrarModalBtn = document.getElementById('cerrar-modal-eliminacion');
    const cancelarBtn = document.getElementById('cancelar-eliminacion');
    const confirmarBtn = document.getElementById('confirmar-eliminacion');

    // Verificar si hay un mensaje en la URL y mostrarlo como mensaje flotante
    const urlParams = new URLSearchParams(window.location.search);
    const mensajeParam = urlParams.get('mensaje');
    if (mensajeParam) {
        const tipoMensaje = mensajeParam.toLowerCase().includes('error') ? 'error' : 'exito';
        mostrarMensajeFlotante(mensajeParam, tipoMensaje);
        
        // Limpiar el parámetro de mensaje de la URL
        const url = new URL(window.location);
        url.searchParams.delete('mensaje');
        window.history.replaceState({}, document.title, url.toString());
    }

    /**
     * Función principal de validación del formulario
     * @param {Event} evento - Evento de submit del formulario
     * @returns {void}
     */
    function validarFormulario(evento) {
        evento.preventDefault(); // Prevenir el envío automático del formulario
        
        // Ocultar mensajes de error anteriores
        ocultarMensajesErrorCampos();
        
        let esValido = true;
        const valores = {};

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
            valores.titulo = tituloInput.value.trim();
        }

        // Validar Descripción (opcional, pero si se llena, debe tener un mínimo)
        if (!validarCampoTexto(descripcionInput, {
            requerido: false,
            longitudMin: 10,
            mensajeMin: 'La descripción debe tener al menos 10 caracteres.'
        })) {
            esValido = false;
        } else {
            valores.descripcion = descripcionInput.value.trim();
        }
        
        // Validar Fecha Límite
        if (!validarFecha(fechaLimiteInput, {
            requerido: true,
            mensajeRequerido: 'La fecha límite es obligatoria.',
            mensajePasado: 'La fecha límite no puede ser en el pasado.'
        })) {
            esValido = false;
        } else {
            valores.fecha_limite = fechaLimiteInput.value;
        }

        // Si el formulario es válido, se envía
        if (esValido) {
            console.log('Formulario válido. Enviando...', valores);
            formulario.submit();
        } else {
            console.log('Formulario inválido.');
        }
    }

    // Manejar el cierre de mensajes
    if (cerrarMensajeBtn) {
        cerrarMensajeBtn.addEventListener('click', cerrarMensaje);
    }

    // Asignar el evento 'submit' al formulario principal
    if (formulario) {
        formulario.addEventListener('submit', validarFormulario);
    }
    
    // Ocultar mensajes de error cuando el usuario comienza a escribir
    const inputs = [tituloInput, descripcionInput, fechaLimiteInput];
    inputs.forEach(function(input) {
        if (input) {
            input.addEventListener('input', function() {
                // Solo limpiar el error si ya había uno
                if (input.errorElement) {
                    limpiarError(input);
                }
            });
        }
    });
    
    // Event listeners para el modal de eliminación
    if (cerrarModalBtn) {
        cerrarModalBtn.addEventListener('click', function() {
            ocultarModalEliminacion();
        });
    }
    
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', function() {
            ocultarModalEliminacion();
        });
    }
    
    if (confirmarBtn) {
        confirmarBtn.addEventListener('click', function() {
            eliminarTarea();
        });
    }
    
    // Cerrar modal al hacer clic fuera del contenido
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                ocultarModalEliminacion();
            }
        });
    }
});

// Hacer que algunas funciones estén disponibles globalmente para el HTML
window.mostrarModalEliminacion = mostrarModalEliminacion;