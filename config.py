"""
Módulo de Configuración de la Aplicación Flask.

Este archivo centraliza la configuración para los diferentes entornos de la aplicación
(desarrollo, producción, pruebas, etc.). Utiliza variables de entorno para mantener
la información sensible (como claves secretas y URLs de bases de datos) fuera del
código fuente, siguiendo las mejores prácticas de seguridad de "The Twelve-Factor App".

La configuración se organiza en clases:
- `Config`: Clase base con la configuración común a todos los entornos.
- `DevelopmentConfig`: Configuración específica para el entorno de desarrollo.
- `ProductionConfig`: Configuración optimizada y segura para el entorno de producción.

El diccionario `config_by_name` permite seleccionar la configuración adecuada
basándose en la variable de entorno `FLASK_ENV`.
"""
import os
from dotenv import load_dotenv
from datetime import timedelta

# Carga las variables de entorno desde un archivo .env para el desarrollo local.
load_dotenv()

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

class DevelopmentConfig(Config):
    """Configuración para el entorno de desarrollo."""
    DEBUG = True
    # Imprime en consola todas las sentencias SQL que SQLAlchemy ejecuta. Útil para depuración.
    SQLALCHEMY_ECHO = True

class ProductionConfig(Config):
    """Configuración para el entorno de producción."""
    DEBUG = False
    SQLALCHEMY_ECHO = False

# Diccionario que mapea los nombres de los entornos a sus respectivas clases de configuración.
# Permite cargar la configuración dinámicamente según la variable de entorno FLASK_ENV.
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}