-- Creación de la base de datos y tabla para el gestor de tareas
CREATE DATABASE gestor_tareas_db;

-- Uso de la base de datos gestor_tareas_db
USE gestor_tareas_db;

-- Creación de la tabla tareas
CREATE TABLE tareas (
 id INT AUTO_INCREMENT PRIMARY KEY,
 titulo VARCHAR(100) UNIQUE NOT NULL,
 descripcion TEXT,
 fecha_limite DATE,
 creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);