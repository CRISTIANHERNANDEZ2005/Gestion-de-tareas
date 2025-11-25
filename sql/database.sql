-- Creación de la base de datos para el gestor de tareas
CREATE DATABASE gestor_tareas_db;

-- Creación de la tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    identificacion VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creación de índice para identificacion
CREATE INDEX IF NOT EXISTS idx_identificacion ON usuarios(identificacion);

-- Creación de la tabla tareas con relación a usuarios
CREATE TABLE IF NOT EXISTS tareas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_limite DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE (usuario_id, titulo)
);

-- Creación de índice para usuario_id
CREATE INDEX IF NOT EXISTS idx_usuario_id ON tareas(usuario_id);

-- Creación de función y trigger para actualizar automáticamente actualizado_en
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar automáticamente actualizado_en
CREATE TRIGGER trigger_actualizar_usuarios
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_tareas
    BEFORE UPDATE ON tareas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();