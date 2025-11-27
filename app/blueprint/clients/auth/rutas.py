"""
Módulo de rutas de autenticación.
Contiene las rutas para registro, inicio de sesión y gestión de perfil de usuarios.
"""

from flask import Blueprint, request, jsonify
from app import db
from app.modelos import Usuario
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.blueprint.utils import validar_identificacion, validar_nombre, validar_contrasena, manejar_error_db
import re
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

def validar_registro(datos):
    """
    Valida los datos de registro de un nuevo usuario.
    
    Args:
        datos (dict): Diccionario con los datos de registro
        
    Returns:
        list: Lista de errores de validación (vacía si no hay errores)
    """
    errores = {}
    
    # Validar identificación (8 dígitos mínimo, solo números)
    if not datos.get('identificacion'):
        errores['identificacion'] = "La identificación es obligatoria"
    elif not validar_identificacion(datos['identificacion']):
        errores['identificacion'] = "La identificación debe tener al menos 8 dígitos y contener solo números"
    
    # Validar nombre
    if not datos.get('nombre'):
        errores['nombre'] = "El nombre es obligatorio"
    elif not validar_nombre(datos['nombre']):
        errores['nombre'] = "El nombre debe tener al menos 2 caracteres"
        
    # Validar apellido
    if not datos.get('apellido'):
        errores['apellido'] = "El apellido es obligatorio"
    elif not validar_nombre(datos['apellido']):
        errores['apellido'] = "El apellido debe tener al menos 2 caracteres"
        
    # Validar contraseña
    if not datos.get('contrasena'):
        errores['contrasena'] = "La contraseña es obligatoria"
    elif not validar_contrasena(datos.get('contrasena')):
        errores['contrasena'] = "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números"
        
    return errores

@auth_bp.route('/registro', methods=['POST'])
def registro():
    """
    Ruta para registrar un nuevo usuario.
    
    Returns:
        JSON: Respuesta con resultado del registro y código HTTP apropiado
    """
    # Obtener datos JSON de la solicitud
    datos = request.get_json()
    if not datos:
        return jsonify({'mensaje': 'No se recibieron datos'}), 400

    # Validar datos de registro
    errores = validar_registro(datos)
    if errores:
        return jsonify({
            'mensaje': 'Error en la validación de datos',
            'errores': errores
        }), 400
    
    # Verificar si el usuario ya existe
    if Usuario.query.filter_by(identificacion=datos['identificacion']).first():
        return jsonify({'mensaje': 'El usuario ya existe'}), 400
    
    # Hashear la contraseña antes de guardarla
    hashed_pw = generate_password_hash(datos['contrasena'])
    
    # Crear nuevo usuario
    nuevo_usuario = Usuario(
        identificacion=datos['identificacion'],
        nombre=datos['nombre'],
        apellido=datos['apellido'],
        contrasena=hashed_pw
    )
    
    # Guardar en la base de datos
    try:
        db.session.add(nuevo_usuario)
        db.session.commit()
        return jsonify({'mensaje': 'Usuario registrado exitosamente'}), 201
    except Exception as e:
        return manejar_error_db('Error interno del servidor')

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Ruta para iniciar sesión de un usuario existente.
    
    Returns:
        JSON: Token JWT y datos del usuario si las credenciales son correctas
    """
    # Obtener datos JSON de la solicitud
    datos = request.get_json()
    
    # Validar que se hayan enviado los datos
    if not datos:
        return jsonify({'mensaje': 'No se recibieron datos. Por favor asegúrese de enviar los datos en formato JSON.'}), 400
    
    # Validar campos requeridos
    errores = {}
    if not datos.get('identificacion'):
        errores['identificacion'] = 'La identificación es obligatoria'
    if not datos.get('contrasena'):
        errores['contrasena'] = 'La contraseña es obligatoria'
    
    # Si hay errores de validación, retornarlos
    if errores:
        return jsonify({
            'mensaje': 'Error en la validación de datos',
            'errores': errores
        }), 400
    
    # Buscar usuario por identificación
    usuario = Usuario.query.filter_by(identificacion=datos.get('identificacion')).first()
    
    # Verificar credenciales
    if not usuario or not check_password_hash(usuario.contrasena, datos.get('contrasena')):
        # Mensaje unificado para mantener la seguridad y experiencia de usuario profesional
        return jsonify({'mensaje': 'Usuario o contraseña incorrectos'}), 401
    
    # Crear token de acceso JWT
    token = create_access_token(identity=str(usuario.id))
    
    # Devolver token y datos del usuario
    return jsonify({
        'mensaje': 'Inicio de sesión exitoso',
        'token': token,
        'usuario': usuario.to_dict()
    }), 200

@auth_bp.route('/perfil', methods=['GET', 'PUT'])
@jwt_required()
def actualizar_perfil():
    """
    Ruta para obtener o actualizar el perfil de un usuario autenticado.
    Requiere un token JWT válido.
    
    Returns:
        JSON: Datos del usuario (GET) o datos actualizados del usuario (PUT)
    """
    try:
        # Obtener ID del usuario desde el token JWT
        usuario_id = int(get_jwt_identity())
        usuario = Usuario.query.get(usuario_id)
        
        # Verificar que el usuario exista
        if not usuario:
            return jsonify({'mensaje': 'Usuario no encontrado'}), 404
            
        # Si es una solicitud GET, devolver los datos del usuario
        if request.method == 'GET':
            return jsonify({'usuario': usuario.to_dict()}), 200
            
        # Si es una solicitud PUT, actualizar el perfil
        # Obtener datos JSON de la solicitud
        datos = request.get_json()
        
        # Actualizar nombre si se proporciona
        if 'nombre' in datos:
            if not validar_nombre(datos['nombre']):
                return jsonify({'mensaje': 'El nombre debe tener al menos 2 caracteres'}), 400
            usuario.nombre = datos['nombre']
            
        # Actualizar apellido si se proporciona
        if 'apellido' in datos:
            if not validar_nombre(datos['apellido']):
                return jsonify({'mensaje': 'El apellido debe tener al menos 2 caracteres'}), 400
            usuario.apellido = datos['apellido']
            
        # Actualizar identificación si se proporciona
        if 'identificacion' in datos:
            if not validar_identificacion(datos['identificacion']):
                return jsonify({'mensaje': 'La identificación debe tener al menos 8 dígitos y contener solo números'}), 400
                
            # Verificar que no esté en uso por otro usuario
            usuario_existente = Usuario.query.filter(
                Usuario.identificacion == datos['identificacion'],
                Usuario.id != usuario_id
            ).first()
            
            if usuario_existente:
                return jsonify({'mensaje': 'La identificación ya está en uso'}), 400
                
            usuario.identificacion = datos['identificacion']
            
        # Actualizar contraseña si se proporciona
        if 'contrasena_actual' in datos and 'nueva_contrasena' in datos:
            # Verificar que la contraseña actual sea correcta
            if not check_password_hash(usuario.contrasena, datos['contrasena_actual']):
                return jsonify({'mensaje': 'La contraseña actual es incorrecta'}), 400
                
            # Validar nueva contraseña
            if not validar_contrasena(datos['nueva_contrasena']):
                return jsonify({'mensaje': 'La nueva contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números'}), 400
                
            # Actualizar contraseña
            usuario.contrasena = generate_password_hash(datos['nueva_contrasena'])
            
        # Actualizar la fecha de modificación
        usuario.actualizado_en = datetime.utcnow()
        
        # Guardar cambios en la base de datos
        db.session.commit()
        
        return jsonify({
            'mensaje': 'Perfil actualizado exitosamente',
            'usuario': usuario.to_dict()
        }), 200
        
    except Exception as e:
        return manejar_error_db('Error al procesar la solicitud')