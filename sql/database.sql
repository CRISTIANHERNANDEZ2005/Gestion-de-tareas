-- Creación de la base de datos SQLite para el gestor de tareas
-- Este archivo contiene el esquema compatible con SQLite

-- Creación de la tabla tareas
CREATE TABLE IF NOT EXISTS tareas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_limite DATE,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);