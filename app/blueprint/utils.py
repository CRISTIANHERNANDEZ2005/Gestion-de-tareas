"""
Módulo de utilidades comunes para la aplicación.
Contiene funciones de validación y manejo de errores reutilizables.
"""

import re
from datetime import datetime
from app import db

from app.modelos import Usuario, Tarea, Administrador
from flask import jsonify, request
from flask_jwt_extended import decode_token

def validar_identificacion(identificacion):
    """
    Valida que la identificación tenga al menos 8 dígitos y contenga solo números.
    
    Args:
        identificacion (str): La identificación a validar
        
    Returns:
        bool: True si es válida, False si no lo es
    """
    return identificacion and re.match(r'^\d{8,}$', identificacion)

def validar_nombre(nombre):
    """
    Valida que el nombre tenga al menos 2 caracteres.
    
    Args:
        nombre (str): El nombre a validar
        
    Returns:
        bool: True si es válido, False si no lo es
    """
    return nombre and len(nombre) >= 2

def validar_contrasena(contrasena):
    """
    Valida que la contraseña tenga al menos 8 caracteres,
    incluyendo al menos una mayúscula, una minúscula y un número.
    
    Args:
        contrasena (str): La contraseña a validar
        
    Returns:
        bool: True si es válida, False si no lo es
    """
    # Verificar que la contraseña no sea None o vacía
    if not contrasena:
        return False
    
    # Verificar longitud mínima
    if len(contrasena) < 8:
        return False
    
    # Verificar que contenga al menos una mayúscula, una minúscula y un número
    # La importación de re ya se hizo al inicio del archivo
    if not re.search(r'[A-Z]', contrasena):
        return False
    if not re.search(r'[a-z]', contrasena):
        return False
    if not re.search(r'\d', contrasena):
        return False
        
    return True

def validar_fecha_futura(fecha_str):
    """
    Valida que la fecha sea futura.
    
    Args:
        fecha_str (str): Fecha en formato 'YYYY-MM-DD'
        
    Returns:
        tuple: (es_valida, fecha_objeto) donde es_valida es boolean y fecha_objeto es date o None
    """
    try:
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        hoy = datetime.now().date()
        if fecha < hoy:
            return False, None
        return True, fecha
    except ValueError:
        return False, None

def verificar_tarea_duplicada(usuario_id, titulo, tarea_id=None):
    """
    Verifica si ya existe una tarea con el mismo título para el usuario.
    
    Args:
        usuario_id (int): ID del usuario
        titulo (str): Título de la tarea
        tarea_id (int, optional): ID de la tarea actual (para actualizaciones)
        
    Returns:
        bool: True si existe duplicado, False si no
    """
    consulta = Tarea.query.filter_by(usuario_id=usuario_id, titulo=titulo)
    if tarea_id:
        consulta = consulta.filter(Tarea.id != tarea_id)
    return consulta.first() is not None

def manejar_error_db(mensaje_error="Error interno del servidor"):
    """
    Maneja errores de base de datos con rollback y respuesta JSON.
    
    Args:
        mensaje_error (str): Mensaje de error a devolver
        
    Returns:
        tuple: (respuesta_json, código_estado)
    """
    db.session.rollback()
    return jsonify({'mensaje': mensaje_error}), 500


def verificar_token_admin():
    """
    Verifica si un administrador tiene un token válido.
    
    Returns:
        tuple: (administrador, token) si es válido, (None, None) si no lo es
    """
    import logging
    logger = logging.getLogger(__name__)
    
    # Verificar si el administrador tiene un token válido
    token = request.cookies.get('admin_token')
    logger.info(f"Token from cookie: {token}")
    
    if not token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            logger.info(f"Token from Authorization header: {token}")
    
    if token:
        try:
            # Intentar decodificar el token
            logger.info(f"Attempting to decode token: {token[:20]}...")  # Log first 20 chars for security
            decoded_token = decode_token(token)
            admin_id = int(decoded_token['sub'])  # Convert to int for database query
            logger.info(f"Decoded token for admin ID: {admin_id}")
            
            # Verificar si el administrador existe
            administrador = Administrador.query.get(admin_id)
            if administrador:
                logger.info(f"Administrator found: {administrador.nombre}")
                return administrador, token
            else:
                logger.warning(f"No administrator found for ID: {admin_id}")
        except Exception as e:
            # Token inválido
            logger.error(f"Error verifying admin token: {str(e)}", exc_info=True)
            pass
    
    logger.info("No valid admin token found")
    return None, None
