"""
Módulo de rutas de usuarios para el panel de administración.
Contiene las rutas para gestionar los usuarios del sistema.
"""

from flask import Blueprint, render_template, redirect, url_for, request, jsonify, make_response
from app.blueprint.utils import verificar_token_admin, validar_identificacion, validar_nombre, validar_contrasena
from app.modelos import Usuario, Administrador
from app import db
from datetime import datetime, timedelta
import csv
import io
from sqlalchemy import and_, or_, func, extract
from werkzeug.security import generate_password_hash

usuarios_bp = Blueprint('usuarios', __name__)

# Rutas API para el CRUD de usuarios
@usuarios_bp.route('/api/usuarios', methods=['GET'])
def obtener_usuarios():
    """
    Ruta para obtener todos los usuarios del sistema con filtros y ordenamiento.
    """
    # Verificar si el administrador tiene un token válido
    administrador, token = verificar_token_admin()
    
    if not administrador:
        return jsonify({'mensaje': 'No autorizado'}), 401
    
    try:
        # Obtener parámetros de filtrado
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '', type=str)
        sort = request.args.get('sort', 'id', type=str)
        order = request.args.get('order', 'asc', type=str)
        date_from = request.args.get('date_from', '', type=str)
        date_to = request.args.get('date_to', '', type=str)
        
        # Construir consulta base
        query = Usuario.query
        
        # Aplicar filtro de búsqueda si existe
        if search:
            query = query.filter(
                or_(
                    Usuario.nombre.ilike(f'%{search}%'),
                    Usuario.apellido.ilike(f'%{search}%'),
                    Usuario.identificacion.ilike(f'%{search}%')
                )
            )
        
        # Aplicar filtro de fechas de registro si existen
        if date_from or date_to:
            try:
                # Validar y aplicar filtro de fecha desde
                if date_from:
                    date_from_obj = datetime.strptime(date_from, '%Y-%m-%d')
                    query = query.filter(Usuario.creado_en >= date_from_obj)
                
                # Validar y aplicar filtro de fecha hasta
                if date_to:
                    date_to_obj = datetime.strptime(date_to, '%Y-%m-%d')
                    # Añadir un día para incluir todo el día especificado
                    date_to_obj = date_to_obj + timedelta(days=1)
                    query = query.filter(Usuario.creado_en < date_to_obj)
                    
            except ValueError as e:
                # Registrar el error para fines de depuración
                print(f"Error al analizar los filtros de fecha: {e}")
                # Continuar sin filtros de fecha si el análisis falla
                pass
        
        # Aplicar ordenamiento
        if hasattr(Usuario, sort):
            sort_field = getattr(Usuario, sort)
            if order.lower() == 'desc':
                query = query.order_by(sort_field.desc())
            else:
                query = query.order_by(sort_field.asc())
        
        # Paginar resultados
        usuarios = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Convertir a diccionarios
        usuarios_data = [usuario.to_dict() for usuario in usuarios.items]
        
        return jsonify({
            'usuarios': usuarios_data,
            'total': usuarios.total,
            'pages': usuarios.pages,
            'current_page': usuarios.page
        }), 200
        
    except Exception as e:
        return jsonify({'mensaje': 'Error al obtener los usuarios'}), 500


@usuarios_bp.route('/api/usuarios/<int:usuario_id>', methods=['GET'])
def obtener_usuario(usuario_id):
    """
    Ruta para obtener un usuario específico.
    """
    # Verificar si el administrador tiene un token válido
    administrador, token = verificar_token_admin()
    
    if not administrador:
        return jsonify({'mensaje': 'No autorizado'}), 401
    
    try:
        usuario = Usuario.query.get(usuario_id)
        
        if not usuario:
            return jsonify({'mensaje': 'Usuario no encontrado'}), 404
        
        return jsonify({'usuario': usuario.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'mensaje': 'Error al obtener el usuario'}), 500

@usuarios_bp.route('/api/usuarios', methods=['POST'])
def crear_usuario():
    """
    Ruta para crear un nuevo usuario.
    """
    # Verificar si el administrador tiene un token válido
    administrador, token = verificar_token_admin()
    
    if not administrador:
        return jsonify({'mensaje': 'No autorizado'}), 401
    
    try:
        datos = request.get_json()
        
        # Validar datos requeridos
        if not datos:
            return jsonify({'mensaje': 'No se recibieron datos. Por favor asegúrese de enviar los datos en formato JSON.'}), 400
        
        # Validar campos requeridos
        identificacion = datos.get('identificacion')
        nombre = datos.get('nombre')
        apellido = datos.get('apellido')
        contrasena = datos.get('contrasena')
        
        errores = {}
        
        # Validar identificación
        if not identificacion:
            errores['identificacion'] = 'La identificación es obligatoria'
        elif not validar_identificacion(identificacion):
            errores['identificacion'] = 'La identificación debe tener al menos 8 dígitos numéricos'
        elif Usuario.query.filter_by(identificacion=identificacion).first():
            errores['identificacion'] = 'Ya existe un usuario con esa identificación'
        
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
        
        # Validar contraseña
        if not contrasena:
            errores['contrasena'] = 'La contraseña es obligatoria'
        elif not validar_contrasena(contrasena):
            errores['contrasena'] = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números'
        
        # Si hay errores, devolverlos
        if errores:
            return jsonify({
                'mensaje': 'Error en la validación de datos',
                'errores': errores
            }), 400
        
        # Crear nuevo usuario
        nuevo_usuario = Usuario(
            identificacion=identificacion,
            nombre=nombre,
            apellido=apellido,
            contrasena=generate_password_hash(contrasena)
        )
        
        db.session.add(nuevo_usuario)
        db.session.commit()
        
        return jsonify({
            'mensaje': 'Usuario creado exitosamente',
            'usuario': nuevo_usuario.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'mensaje': 'Error al crear el usuario'}), 500

@usuarios_bp.route('/api/usuarios/<int:usuario_id>', methods=['PUT'])
def actualizar_usuario(usuario_id):
    """
    Ruta para actualizar un usuario existente.
    """
    # Verificar si el administrador tiene un token válido
    administrador, token = verificar_token_admin()
    
    if not administrador:
        return jsonify({'mensaje': 'No autorizado'}), 401
    
    try:
        usuario = Usuario.query.get(usuario_id)
        
        if not usuario:
            return jsonify({'mensaje': 'Usuario no encontrado'}), 404
        
        datos = request.get_json()
        
        if not datos:
            return jsonify({'mensaje': 'No se recibieron datos. Por favor asegúrese de enviar los datos en formato JSON.'}), 400
        
        # Validar campos si se proporcionan
        identificacion = datos.get('identificacion')
        nombre = datos.get('nombre')
        apellido = datos.get('apellido')
        contrasena = datos.get('contrasena')
        
        errores = {}
        
        # Validar identificación si se proporciona
        if identificacion is not None:
            if not identificacion:
                errores['identificacion'] = 'La identificación no puede estar vacía'
            elif not validar_identificacion(identificacion):
                errores['identificacion'] = 'La identificación debe tener al menos 8 dígitos numéricos'
            else:
                # Verificar si ya existe otro usuario con la misma identificación
                otro_usuario = Usuario.query.filter_by(identificacion=identificacion).first()
                if otro_usuario and otro_usuario.id != usuario_id:
                    errores['identificacion'] = 'Ya existe otro usuario con esa identificación'
        
        # Validar nombre si se proporciona
        if nombre is not None:
            if not nombre:
                errores['nombre'] = 'El nombre no puede estar vacío'
            elif not validar_nombre(nombre):
                errores['nombre'] = 'El nombre debe tener al menos 2 caracteres'
        
        # Validar apellido si se proporciona
        if apellido is not None:
            if not apellido:
                errores['apellido'] = 'El apellido no puede estar vacío'
            elif not validar_nombre(apellido):
                errores['apellido'] = 'El apellido debe tener al menos 2 caracteres'
        
        # Validar contraseña si se proporciona
        if contrasena is not None:
            if not contrasena:
                errores['contrasena'] = 'La contraseña no puede estar vacía'
            elif not validar_contrasena(contrasena):
                errores['contrasena'] = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números'
        
        # Si hay errores, devolverlos
        if errores:
            return jsonify({
                'mensaje': 'Error en la validación de datos',
                'errores': errores
            }), 400
        
        # Actualizar campos si se proporcionan
        if identificacion is not None:
            usuario.identificacion = identificacion
        
        if nombre is not None:
            usuario.nombre = nombre
        
        if apellido is not None:
            usuario.apellido = apellido
        
        if contrasena is not None:
            usuario.contrasena = generate_password_hash(contrasena)
        
        db.session.commit()
        
        return jsonify({
            'mensaje': 'Usuario actualizado exitosamente',
            'usuario': usuario.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'mensaje': 'Error al actualizar el usuario'}), 500

@usuarios_bp.route('/api/usuarios/<int:usuario_id>', methods=['DELETE'])
def eliminar_usuario(usuario_id):
    """
    Ruta para eliminar un usuario.
    """
    # Verificar si el administrador tiene un token válido
    administrador, token = verificar_token_admin()
    
    if not administrador:
        return jsonify({'mensaje': 'No autorizado'}), 401
    
    try:
        usuario = Usuario.query.get(usuario_id)
        
        if not usuario:
            return jsonify({'mensaje': 'Usuario no encontrado'}), 404
        
        db.session.delete(usuario)
        db.session.commit()
        
        return jsonify({'mensaje': 'Usuario eliminado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'mensaje': 'Error al eliminar el usuario'}), 500