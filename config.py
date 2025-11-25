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

# Mostrar la URL de la base de datos cargada (para propósitos de depuración)
print(f"DB URL Loaded: {os.environ.get('DATABASE_URL')}")

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
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    # Desactivar el seguimiento de modificaciones de SQLAlchemy para mejorar el rendimiento
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuración de Pool de Conexiones para evitar desconexiones SSL
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,           # Verificar conexiones antes de usarlas
        "pool_recycle": 300,             # Reciclar conexiones cada 5 minutos
        "pool_size": 10,                 # Tamaño del pool de conexiones
        "max_overflow": 20,              # Conexiones adicionales máximas
    }

    # Configuración JWT - Tiempo de expiración del token de acceso (1 hora)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)