-- Creación de la base de datos para el gestor de tareas
CREATE DATABASE gestor_tareas_db;

-- Creación de la tabla usuarios
CREATE TABLE IF NOT EXISTS Administrador (
    id SERIAL PRIMARY KEY,
    identificacion VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creación de la tabla usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
    id SERIAL PRIMARY KEY,
    identificacion VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creación de la tabla tareas con relación a usuarios
CREATE TABLE IF NOT EXISTS Tareas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_limite DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    UNIQUE (usuario_id, titulo)
);
