-- Creación de la base de datos para el gestor de tareas
-- Este archivo contiene el esquema compatible con PostgreSQL y SQLite

-- Creación de la tabla tareas
CREATE TABLE IF NOT EXISTS tareas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_limite DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);