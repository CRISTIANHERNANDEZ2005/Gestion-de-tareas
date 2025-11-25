"""
Módulo de inicialización de la aplicación Flask.
Este archivo configura e inicializa todas las extensiones de Flask y registra los blueprints.
"""

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

# Inicializar extensiones de Flask
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def crear_app(config_class=Config):
    """
    Fábrica de aplicaciones Flask.
    
    Args:
        config_class: Clase de configuración a utilizar (por defecto Config)
        
    Returns:
        app: Instancia de la aplicación Flask configurada
    """
    # Crear la instancia de la aplicación Flask
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Inicializar extensiones con la aplicación
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    # Registrar Blueprints de diferentes módulos 

    # Blueprints clientes
    from app.blueprint.clients.auth.rutas import auth_bp
    from app.blueprint.clients.tareas.rutas import tareas_bp
    
    # registro de blueprints de clientes
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(tareas_bp, url_prefix='/tareas')

    # Manejadores de errores JWT para respuestas consistentes
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        """
        Manejador para tokens JWT expirados.
        """
        return jsonify({
            'mensaje': 'El token ha expirado',
            'error': 'token_expired'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        """
        Manejador para tokens JWT inválidos.
        """
        return jsonify({
            'mensaje': 'Token inválido',
            'error': 'invalid_token'
        }), 422

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        """
        Manejador para solicitudes sin token JWT.
        """
        return jsonify({
            'mensaje': 'Se requiere un token de acceso',
            'error': 'authorization_required'
        }), 401

    # Ruta raíz para servir el frontend
    from app.blueprint.clients.vistas import vistas_bp
    app.register_blueprint(vistas_bp)

    return app