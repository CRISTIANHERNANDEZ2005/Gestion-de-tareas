"""
Módulo de configuración de la aplicación.
Contiene las configuraciones necesarias para la base de datos, JWT y otras opciones.
"""

import os
from dotenv import load_dotenv
from datetime import timedelta

# Determinar el directorio base del proyecto
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    """
    Clase de configuración principal que contiene todas las configuraciones
    necesarias para la aplicación Flask.
    """
    
    # Clave secreta para sesiones y protección CSRF
    SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-key-secreta'
    
    # Clave secreta para JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-jwt-key'
    
    # URL de conexión a la base de datos
    # En Vercel, usar la variable de entorno DATABASE_URL
    # En local, usar sqlite por defecto si no hay DATABASE_URL
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        # Para Vercel PostgreSQL, asegurarse de que el esquema sea correcto
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        SQLALCHEMY_DATABASE_URI = database_url
    else:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'gestor_tareas.sqlite')
    
    # Desactivar el seguimiento de modificaciones de SQLAlchemy para mejorar el rendimiento
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuración de Pool de Conexiones para evitar desconexiones SSL
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,           # Verificar conexiones antes de usarlas
        "pool_recycle": 300,             # Reciclar conexiones cada 5 minutos
        "pool_size": 5,                  # Tamaño del pool de conexiones (reducido para Vercel)
        "max_overflow": 10,              # Conexiones adicionales máximas
        "pool_timeout": 30,              # Tiempo máximo de espera para obtener conexión
    }

    # Configuración JWT - Tiempo de expiración del token de acceso (1 hora)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    # Configuración específica para Vercel
    # En Vercel, deshabilitar el modo de depuración
    DEBUG = os.environ.get('VERCEL_ENV') != 'production'
    
    # Configuración adicional para Vercel
    # Establecer el entorno de Vercel correctamente
    VERCEL_ENV = os.environ.get('VERCEL_ENV', 'development')