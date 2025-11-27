/**
 * Punto de entrada principal del panel de administración
 * Importa e inicializa todos los módulos del panel de administración
 * 
 * @author Gestor de Tareas
 * @version 1.0
 */

// Importar todos los módulos
import AdminAuthModule from './modules/auth.js';
import AdminUsersModule from './modules/users.js';
import AdminProfileModule from './modules/profile.js';

// Importar pruebas en modo desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    import('./test_runner.js').then(() => {
        console.log('Sistema de pruebas cargado');
    }).catch(err => {
        console.warn('No se pudo cargar el sistema de pruebas:', err);
    });
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Determinar qué módulos inicializar basado en la página actual
    const rutaActual = window.location.pathname;
    
    // Inicializar módulo de autenticación en la página de login
    if (rutaActual.includes('/admin/login')) {
        window.adminAuthModule = new AdminAuthModule();
        console.log('Módulo de autenticación de administrador inicializado');
    } 
    // Inicializar módulo de usuarios en el dashboard
    else if (rutaActual.includes('/admin/dashboard')) {
        window.adminUsersModule = new AdminUsersModule();
        window.adminProfileModule = new AdminProfileModule();
        console.log('Módulo de gestión de usuarios de administrador inicializado');
        console.log('Módulo de perfil de administrador inicializado');
    }
    
    console.log('Panel de administración inicializado correctamente');
});