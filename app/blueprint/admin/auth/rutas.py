"""
Módulo de rutas de autenticación administrativa.
Contiene las rutas para el inicio de sesión de administradores.
"""

from flask import Blueprint, request, jsonify, render_template
from app import db
from app.modelos import Administrador
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.blueprint.utils import manejar_error_db, verificar_token_admin, validar_identificacion, validar_nombre, validar_contrasena
import logging

# Configurar el logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear el blueprint para las rutas de autenticación administrativa
admin_auth_bp = Blueprint('admin_auth', __name__)

@admin_auth_bp.route('/api/login', methods=['POST'])
def login():
    """
    Ruta para iniciar sesión de un administrador existente.
    
    Returns:
        JSON: Token JWT y datos del administrador si las credenciales son correctas
    """
    try:
        # Registrar la solicitud entrante
        logger.info(f"Solicitud de inicio de sesión entrante desde {request.remote_addr}")
        logger.info(f"Encabezados de la solicitud: {dict(request.headers)}")
        
        # Obtener datos JSON de la solicitud
        datos = request.get_json()
        logger.info(f"Datos de la solicitud: {datos}")
        
        if not datos:
            logger.warning("No se recibieron datos JSON en la solicitud de inicio de sesión")
            return jsonify({'mensaje': 'No se recibieron datos. Por favor asegúrese de enviar los datos en formato JSON.'}), 400
            
        identificacion = datos.get('identificacion')
        contrasena = datos.get('contrasena')
        
        # Validación básica de campos requeridos
        if not identificacion or not contrasena:
            logger.warning("Credenciales faltantes en la solicitud de inicio de sesión")
            return jsonify({'mensaje': 'Credenciales incorrectas'}), 401
        
        # Buscar administrador por identificación
        administrador = Administrador.query.filter_by(identificacion=datos.get('identificacion')).first()
        
        # Verificar si el administrador existe
        if not administrador:
            logger.warning(f"Administrador no encontrado para la identificación: {datos.get('identificacion')}")
            return jsonify({'mensaje': 'Credenciales incorrectas'}), 401
        
        # Verificar credenciales
        if not check_password_hash(administrador.contrasena, datos.get('contrasena')):
            logger.warning(f"Contraseña incorrecta para el administrador ID: {administrador.id}")
            return jsonify({'mensaje': 'Credenciales incorrectas'}), 401
        
        # Crear token de acceso JWT
        token = create_access_token(identity=str(administrador.id))
        logger.info(f"Inicio de sesión exitoso para el administrador ID: {administrador.id}")
        
        # Devolver token y datos del administrador
        return jsonify({
            'mensaje': 'Inicio de sesión exitoso. Bienvenido al panel de administración.',
            'token': token,
            'administrador': administrador.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error durante el proceso de inicio de sesión: {str(e)}", exc_info=True)
        return jsonify({'mensaje': 'Error interno del servidor. Por favor intente nuevamente más tarde.'}), 500
        
@admin_auth_bp.route('/api/perfil', methods=['GET'])
@jwt_required()
def perfil_admin():
    """
    Ruta para obtener el perfil de un administrador autenticado.
    Requiere un token JWT válido.
    
    Returns:
        JSON: Datos del administrador
    """
    try:
        # Obtener ID del administrador desde el token JWT
        admin_id = int(get_jwt_identity())
        administrador = Administrador.query.get(admin_id)
        
        # Verificar que el administrador exista
        if not administrador:
            return jsonify({'mensaje': 'Administrador no encontrado. Token inválido.'}), 404
            
        return jsonify({'administrador': administrador.to_dict()}), 200
        
    except Exception as e:
        logger.error(f"Error al obtener el perfil del administrador: {str(e)}", exc_info=True)
        return manejar_error_db('Error al procesar la solicitud de perfil.')

@admin_auth_bp.route('/api/perfil', methods=['PUT'])
@jwt_required()
def actualizar_perfil():
    """
    Ruta para actualizar el perfil de un administrador autenticado.
    Requiere un token JWT válido.
    
    Returns:
        JSON: Datos actualizados del administrador
    """
    try:
        # Obtener ID del administrador desde el token JWT
        admin_id = int(get_jwt_identity())
        administrador = Administrador.query.get(admin_id)
        
        # Verificar que el administrador exista
        if not administrador:
            return jsonify({'mensaje': 'Administrador no encontrado. Token inválido.'}), 404
        
        # Obtener datos JSON de la solicitud
        datos = request.get_json()
        
        if not datos:
            return jsonify({'mensaje': 'No se recibieron datos. Por favor asegúrese de enviar los datos en formato JSON.'}), 400
        
        # Validar campos
        nombre = datos.get('nombre')
        apellido = datos.get('apellido')
        identificacion = datos.get('identificacion')
        contrasena = datos.get('contrasena')
        
        errores = {}
        
        # Validar identificación
        if not identificacion:
            errores['identificacion'] = 'La identificación es obligatoria'
        elif not validar_identificacion(identificacion):
            errores['identificacion'] = 'La identificación debe tener al menos 8 dígitos numéricos'
        elif identificacion != administrador.identificacion:
            # Verificar que la identificación sea única (excepto para el mismo administrador)
            admin_existente = Administrador.query.filter_by(identificacion=identificacion).first()
            if admin_existente:
                errores['identificacion'] = 'La identificación ya está en uso por otro administrador.'
        
        # Validar nombre
        if not nombre:
            errores['nombre'] = 'El nombre es obligatorio'
        elif not validar_nombre(nombre):
            errores['nombre'] = 'El nombre debe tener al menos 2 caracteres'
        
        # Validar apellido
        if not apellido:
            errores['apellido'] = 'El apellido es obligatorio'
        elif not validar_nombre(apellido):
            errores['apellido'] = 'El apellido debe tener al menos 2 caracteres'
        
        # Validar contraseña si se proporciona
        if contrasena is not None and contrasena != '':
            if not validar_contrasena(contrasena):
                errores['contrasena'] = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números'
        
        # Si hay errores, devolverlos
        if errores:
            return jsonify({
                'mensaje': 'Error en la validación de datos',
                'errores': errores
            }), 400
        
        # Actualizar datos del administrador
        if identificacion:
            administrador.identificacion = identificacion
        if nombre:
            administrador.nombre = nombre
        if apellido:
            administrador.apellido = apellido
        
        # Actualizar contraseña si se proporciona
        if contrasena:
            administrador.contrasena = generate_password_hash(contrasena)
        
        # Guardar cambios en la base de datos
        db.session.commit()
        
        logger.info(f"Perfil actualizado para el administrador ID: {admin_id}")
        
        return jsonify({
            'mensaje': 'Perfil actualizado exitosamente.',
            'administrador': administrador.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error al actualizar el perfil del administrador: {str(e)}", exc_info=True)
        return manejar_error_db('Error al actualizar el perfil.')

@admin_auth_bp.route('/api/verificar', methods=['GET'])
def verificar_autenticacion():
    """
    Ruta para verificar si un administrador está autenticado.
    
    Returns:
        JSON: Estado de autenticación del administrador
    """
    try:
        # Verificar si el administrador tiene un token válido usando la función utilitaria
        administrador, token = verificar_token_admin()
        
        if administrador:
            return jsonify({
                'autenticado': True,
                'administrador': administrador.to_dict()
            }), 200
        
        return jsonify({'autenticado': False}), 401
        
    except Exception as e:
        logger.error(f"Error durante la verificación de autenticación: {str(e)}", exc_info=True)
        return jsonify({'mensaje': 'Error interno del servidor. Por favor intente nuevamente más tarde.'}), 500