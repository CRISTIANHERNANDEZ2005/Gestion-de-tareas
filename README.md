# Gestor de Tareas Web

Una aplicación web simple para gestionar tareas usando PHP y SQLite.

## Características

- Crear, leer, actualizar y eliminar tareas
- Validación de formularios
- Diseño responsive
- Base de datos SQLite

## Requisitos

- PHP 7.4 o superior
- Servidor web con soporte para PHP (Apache, Nginx, etc.)

## Instalación Local

1. Clona este repositorio
2. Coloca los archivos en tu servidor web
3. La aplicación creará automáticamente la base de datos SQLite en la primera ejecución

## Despliegue en Vercel

1. Crea una cuenta en [Vercel](https://vercel.com/)
2. Conecta tu repositorio de GitHub
3. Importa el proyecto
4. Vercel detectará automáticamente la configuración en `vercel.json`
5. Haz clic en "Deploy"

La aplicación usará el directorio `/tmp` para almacenar la base de datos SQLite en Vercel.

## Estructura del Proyecto

```
.
├── css/                 # Archivos CSS
├── js/                  # Archivos JavaScript
├── php/                 # Archivos PHP (lógica de la aplicación)
├── sql/                 # Esquema de base de datos
├── index.php            # Punto de entrada de la aplicación
├── vercel.json          # Configuración para Vercel
└── README.md            # Este archivo
```

## Tecnologías Utilizadas

- PHP
- SQLite
- HTML5
- CSS3
- JavaScript

## Licencia

MIT