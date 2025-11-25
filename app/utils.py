"""
Módulo de utilidades comunes para la aplicación.
Contiene funciones de validación y manejo de errores reutilizables.
"""

import re
from datetime import datetime
from app import db
from app.modelos import Usuario, Tarea
from flask import jsonify

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
    Valida que la contraseña tenga al menos 6 caracteres.
    
    Args:
        contrasena (str): La contraseña a validar
        
    Returns:
        bool: True si es válida, False si no lo es
    """
    return contrasena and len(contrasena) >= 6

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