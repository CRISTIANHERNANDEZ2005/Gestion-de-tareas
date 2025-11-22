# Gestor de Tareas Web

Un gestor de tareas web desarrollado con HTML, CSS, JavaScript y PHP con base de datos SQLite para desarrollo local y PostgreSQL para producción en Vercel.

## Características

- Crear, leer, actualizar y eliminar tareas
- Validación de formularios
- Interfaz responsive
- Base de datos SQLite para desarrollo local
- Base de datos PostgreSQL para producción en Vercel

## Despliegue en Vercel

Este proyecto está configurado para ser desplegado fácilmente en Vercel:

1. Conecta tu repositorio de GitHub con Vercel
2. Selecciona este directorio como raíz del proyecto
3. Vercel automáticamente detectará la configuración en `vercel.json`
4. Configura la variable de entorno `DATABASE_URL` con tu cadena de conexión de Neon.tech

### Configuración de la Base de Datos

El proyecto utiliza diferentes bases de datos según el entorno:

- **Local**: La base de datos SQLite se almacena en `gestor_tareas.sqlite` en la raíz del proyecto
- **Vercel**: La base de datos PostgreSQL se configura mediante la variable de entorno `DATABASE_URL`

### Configuración de Variables de Entorno en Vercel

Para que la aplicación funcione correctamente en Vercel, debes configurar la variable de entorno `DATABASE_URL`:

1. Ve a la configuración de tu proyecto en Vercel
2. Navega a la sección "Environment Variables"
3. Agrega una nueva variable:
   - Name: `DATABASE_URL`
   - Value: `postgresql://neondb_owner:npg_52KChukOwzpY@ep-winter-cake-a86i83s2-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require`
4. Guarda los cambios y vuelve a desplegar tu aplicación

## Estructura del Proyecto

```
├── api/                 # Endpoints de la API
├── css/                 # Archivos CSS
├── js/                  # Archivos JavaScript
├── php/                 # Archivos PHP del backend
├── sql/                 # Esquemas SQL
├── index.html           # Página principal
├── gestor_tareas.sqlite # Base de datos SQLite (local)
├── vercel.json          # Configuración de Vercel
└── README.md            # Este archivo
```

## Desarrollo Local

Para ejecutar este proyecto localmente, necesitas un servidor web con PHP (como XAMPP, WAMP o LAMP).

1. Clona el repositorio
2. Coloca el proyecto en el directorio de tu servidor web
3. Accede al proyecto a través de tu navegador

## API Endpoints

- `GET /php/obtener_tareas.php` - Obtiene todas las tareas
- `POST /php/agregar_tarea.php` - Agrega una nueva tarea
- `POST /php/actualizar_tarea.php` - Actualiza una tarea existente
- `POST /php/eliminar_tarea.php` - Elimina una tarea
- `GET /api/init-db.php` - Inicializa la base de datos (útil para Vercel)

## Tecnologías Utilizadas

- HTML5
- CSS3
- JavaScript (ES6 Modules)
- PHP 7+
- SQLite (desarrollo local)
- PostgreSQL (producción en Vercel)