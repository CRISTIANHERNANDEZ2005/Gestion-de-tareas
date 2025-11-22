# Gestor de Tareas Web

Un gestor de tareas web desarrollado con HTML, CSS, JavaScript y PHP con base de datos SQLite.

## Características

- Crear, leer, actualizar y eliminar tareas
- Validación de formularios
- Interfaz responsive
- Base de datos SQLite

## Despliegue en Vercel

Este proyecto está configurado para ser desplegado fácilmente en Vercel:

1. Conecta tu repositorio de GitHub con Vercel
2. Selecciona este directorio como raíz del proyecto
3. Vercel automáticamente detectará la configuración en `vercel.json`
4. El proyecto se desplegará con soporte para PHP y SQLite

### Configuración de la Base de Datos

El proyecto utiliza SQLite y está configurado para funcionar tanto en entornos locales como en Vercel:

- **Local**: La base de datos se almacena en `gestor_tareas.sqlite` en la raíz del proyecto
- **Vercel**: La base de datos se almacena en `/tmp/gestor_tareas.sqlite` (directorio temporal)

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
- SQLite