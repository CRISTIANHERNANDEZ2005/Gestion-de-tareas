"""
Módulo de vistas de la aplicación.
Contiene las rutas para servir las páginas HTML del frontend.
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, send_from_directory
from flask_jwt_extended import decode_token, verify_jwt_in_request, get_jwt_identity
from app.modelos import Usuario
import json
import os

vistas_bp = Blueprint('vistas', __name__)

@vistas_bp.route('/')
def inicio():
    """
    Ruta principal que sirve la página de inicio.
    """
    # Verificar si el usuario tiene un token válido
    token = request.cookies.get('token')
    if token:
        try:
            # Intentar decodificar el token
            decoded_token = decode_token(token)
            user_id = decoded_token['sub']
            
            # Verificar si el usuario existe
            usuario = Usuario.query.get(user_id)
            if usuario:
                # Si el usuario está autenticado, podríamos redirigirlo al dashboard
                # o simplemente mostrar la página de inicio con estado de autenticación
                pass  # Continuar normalmente
        except Exception as e:
            # Token inválido, continuar mostrando la página de inicio normalmente
            pass
    
    return render_template('inicio.html')

@vistas_bp.route('/login')
def login():
    """
    Ruta que sirve la página de inicio de sesión.
    """
    # Check if user has a valid token in localStorage (via cookie for SSR)
    return render_template('inicio.html')

@vistas_bp.route('/registro')
def registro():
    """
    Ruta que sirve la página de registro.
    """
    return render_template('inicio.html')

@vistas_bp.route('/dashboard')
def dashboard():
    """
    Ruta que sirve el dashboard del usuario.
    Verifica la validez del token JWT antes de mostrar el contenido.
    """
    # Obtener el token JWT de las cookies
    token = request.cookies.get('token')
    
    # Si no hay token, redirigir al inicio con mensaje de error
    if not token:
        # Mostrar mensaje de acceso denegado
        flash('Acceso denegado. Debes iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('vistas.inicio'))
    
    try:
        # Decodificar el token para obtener información del usuario
        decoded_token = decode_token(token)
        user_id = decoded_token['sub']
        
        # Obtener el usuario de la base de datos
        usuario = Usuario.query.get(user_id)
        if not usuario:
            flash('Acceso denegado. Debes iniciar sesión para acceder a esta página.', 'error')
            return redirect(url_for('vistas.inicio'))
            
        # Pasar la información del usuario a la plantilla
        return render_template('components/dashboard.html', usuario=usuario)
    except Exception as e:
        # El token es inválido o ha expirado
        flash('Acceso denegado. Debes iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('vistas.inicio'))


@vistas_bp.route('/documentacion')
def documentacion():
    """
    Ruta que sirve la documentación técnica del proyecto.
    """
    return send_from_directory('../documentacion', 'documentation.html')


@vistas_bp.route('/database/<path:filename>')
def base_datos_static(filename):
    """
    Ruta que sirve archivos estáticos del directorio 'base de datos'.
    """
    return send_from_directory('../documentacion/database', filename)

@vistas_bp.route('/diagramas/<path:filename>')
def diagramas_static(filename):
    """
    Ruta que sirve archivos estáticos del directorio 'diagramas'.
    """
    return send_from_directory('../documentacion/diagramas', filename)