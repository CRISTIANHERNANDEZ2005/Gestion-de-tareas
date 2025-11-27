/**
 * Punto de entrada principal de la aplicación
 * Importa e inicializa todos los módulos de la aplicación
 * 
 * @author Gestor de Tareas
 * @version 1.0
 */

// Importar todos los módulos
import AuthModule from './modules/auth.js';
import TasksModule from './modules/tasks.js';
import UIModule from './modules/ui.js';

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar módulos
    window.uiModule = new UIModule();
    window.authModule = new AuthModule();
    window.tasksModule = new TasksModule();
    
    // Verificar el estado de autenticación en todas las páginas
    window.uiModule.actualizarNav();
    
    console.log('Aplicación inicializada correctamente');
});