"""
Módulo de rutas de tareas.
Contiene las rutas para crear, leer, actualizar y eliminar tareas de los usuarios.
"""

from flask import Blueprint, request, jsonify
from app import db
from app.modelos import Tarea
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.blueprint.clients.utils import validar_fecha_futura, verificar_tarea_duplicada, manejar_error_db

tareas_bp = Blueprint('tareas', __name__)

@tareas_bp.route('/', methods=['GET'])
@jwt_required()
def obtener_tareas():
    """
    Obtiene todas las tareas del usuario autenticado.
    Requiere un token JWT válido.
    
    Query Parameters:
        search (str): Texto para buscar en título y descripción
        date_from (str): Fecha inicial en formato YYYY-MM-DD
        date_to (str): Fecha final en formato YYYY-MM-DD
        sort_by (str): Campo por el cual ordenar (titulo, fecha_limite, creado_en)
        order (str): Dirección del ordenamiento (asc, desc)
    
    Returns:
        JSON: Lista de tareas del usuario filtradas y ordenadas
    """
    try:
        # Obtener ID del usuario desde el token JWT
        usuario_id = int(get_jwt_identity())
        
        # Obtener parámetros de consulta
        search_query = request.args.get('search', '').strip()
        date_from = request.args.get('date_from', '').strip()
        date_to = request.args.get('date_to', '').strip()
        sort_by = request.args.get('sort_by', 'creado_en')  # Por defecto ordenar por fecha de creación
        order = request.args.get('order', 'desc')  # Por defecto orden descendente
        
        # Construir la consulta base
        query = Tarea.query.filter_by(usuario_id=usuario_id)
        
        # Aplicar filtro de búsqueda si se proporciona
        if search_query:
            search_filter = f"%{search_query}%"
            query = query.filter(
                db.or_(
                    Tarea.titulo.ilike(search_filter),
                    Tarea.descripcion.ilike(search_filter)
                )
            )
        
        # Aplicar filtro de rango de fechas si se proporcionan
        if date_from:
            try:
                from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                query = query.filter(Tarea.fecha_limite >= from_date)
            except ValueError:
                pass  # Ignorar fechas inválidas
        
        if date_to:
            try:
                to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
                query = query.filter(Tarea.fecha_limite <= to_date)
            except ValueError:
                pass  # Ignorar fechas inválidas
        
        # Validar y aplicar ordenamiento
        valid_sort_fields = ['titulo', 'fecha_limite', 'creado_en']
        valid_order_directions = ['asc', 'desc']
        
        if sort_by not in valid_sort_fields:
            sort_by = 'creado_en'  # Valor por defecto si el campo no es válido
            
        if order not in valid_order_directions:
            order = 'desc' # Valor por defecto si la dirección no es válida
            
        # Aplicar ordenamiento
        if sort_by == 'titulo':
            # Para títulos, ordenar por el primer carácter para una organización más profesional
            sort_expression = db.func.upper(db.func.substr(Tarea.titulo, 1, 1))
        else:
            # Para otros campos, usar el campo completo
            sort_expression = getattr(Tarea, sort_by)
            
        if order == 'asc':
            sort_expression = sort_expression.asc()
        else:  # order == 'desc'
            sort_expression = sort_expression.desc()
            
        query = query.order_by(sort_expression)
        
        # Ejecutar consulta
        tareas = query.all()
        
        # Convertir tareas a formato JSON
        return jsonify([t.to_dict() for t in tareas]), 200
    except Exception as e:
        return jsonify({'mensaje': 'Error al obtener tareas', 'error': str(e)}), 500

@tareas_bp.route('/', methods=['POST'])
@jwt_required()
def crear_tarea():
    """
    Crea una nueva tarea para el usuario autenticado.
    Requiere un token JWT válido.
    
    Returns:
        JSON: Datos de la tarea creada o mensaje de error
    """
    # Obtener ID del usuario desde el token JWT
    usuario_id = int(get_jwt_identity())
    
    # Obtener datos JSON de la solicitud
    datos = request.get_json()
    
    # Validar que se haya proporcionado un título
    if not datos or not datos.get('titulo'):
        return jsonify({'mensaje': 'El título es obligatorio'}), 400
    
    # Validar longitud del título
    if len(datos['titulo']) < 5:
        return jsonify({'mensaje': 'El título debe tener al menos 5 caracteres'}), 400
    
    if len(datos['titulo']) > 100:
        return jsonify({'mensaje': 'El título no puede exceder 100 caracteres'}), 400
    
    # Validar descripción si se proporciona
    if 'descripcion' in datos and datos['descripcion'] and len(datos['descripcion']) < 10:
        return jsonify({'mensaje': 'La descripción debe tener al menos 10 caracteres'}), 400
    
    # Procesar fecha límite si se proporciona
    fecha_limite = None
    if datos.get('fecha_limite'):
        es_valida, fecha = validar_fecha_futura(datos['fecha_limite'])
        if not es_valida:
            return jsonify({'mensaje': 'Formato de fecha inválido. Use YYYY-MM-DD o la fecha debe ser futura'}), 400
        fecha_limite = fecha

    # Verificar duplicados (mismo título para el mismo usuario)
    if verificar_tarea_duplicada(usuario_id, datos['titulo']):
        return jsonify({'mensaje': 'Ya tienes una tarea con este título'}), 400

    # Crear nueva tarea
    nueva_tarea = Tarea(
        usuario_id=usuario_id,
        titulo=datos['titulo'],
        descripcion=datos.get('descripcion'),
        fecha_limite=fecha_limite
    )
    
    # Guardar en la base de datos
    try:
        db.session.add(nueva_tarea)
        db.session.commit()
        return jsonify(nueva_tarea.to_dict()), 201
    except Exception as e:
        return manejar_error_db('Error al crear la tarea')

@tareas_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_tarea(id):
    """
    Actualiza una tarea específica del usuario autenticado.
    Requiere un token JWT válido.
    
    Args:
        id (int): ID de la tarea a actualizar
        
    Returns:
        JSON: Datos de la tarea actualizada o mensaje de error
    """
    # Obtener ID del usuario desde el token JWT
    usuario_id = int(get_jwt_identity())
    
    # Buscar la tarea por ID y verificar que pertenece al usuario autenticado
    tarea = Tarea.query.filter_by(id=id, usuario_id=usuario_id).first()
    
    # Verificar que la tarea exista
    if not tarea:
        return jsonify({'mensaje': 'Tarea no encontrada'}), 404
    
    # Obtener datos JSON de la solicitud
    datos = request.get_json()
    
    # Actualizar título si se proporciona
    if 'titulo' in datos:
        if not datos['titulo']:
            return jsonify({'mensaje': 'El título no puede estar vacío'}), 400
        if len(datos['titulo']) < 5:
            return jsonify({'mensaje': 'El título debe tener al menos 5 caracteres'}), 400
        # Verificar duplicados si cambia el título
        if datos['titulo'] != tarea.titulo:
            if verificar_tarea_duplicada(usuario_id, datos['titulo'], id):
                return jsonify({'mensaje': 'Ya tienes una tarea con este título'}), 400
        tarea.titulo = datos['titulo']
        
    # Actualizar descripción si se proporciona
    if 'descripcion' in datos:
        # Validar descripción si se proporciona
        if datos['descripcion'] and len(datos['descripcion']) < 10:
            return jsonify({'mensaje': 'La descripción debe tener al menos 10 caracteres'}), 400
        tarea.descripcion = datos['descripcion']
        
    # Actualizar fecha límite si se proporciona
    if 'fecha_limite' in datos:
        if datos['fecha_limite']:
            es_valida, fecha = validar_fecha_futura(datos['fecha_limite'])
            if not es_valida:
                return jsonify({'mensaje': 'Formato de fecha inválido o la fecha debe ser futura'}), 400
            tarea.fecha_limite = fecha
        else:
            tarea.fecha_limite = None
            
    # Guardar cambios en la base de datos
    try:
        db.session.commit()
        return jsonify(tarea.to_dict()), 200
    except Exception as e:
        return manejar_error_db('Error al actualizar tarea')

@tareas_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_tarea(id):
    """
    Elimina una tarea específica del usuario autenticado.
    Requiere un token JWT válido.
    
    Args:
        id (int): ID de la tarea a eliminar
        
    Returns:
        JSON: Mensaje de confirmación o error
    """
    # Obtener ID del usuario desde el token JWT
    usuario_id = int(get_jwt_identity())
    
    # Buscar la tarea por ID y verificar que pertenece al usuario autenticado
    tarea = Tarea.query.filter_by(id=id, usuario_id=usuario_id).first()
    
    # Verificar que la tarea exista
    if not tarea:
        return jsonify({'mensaje': 'Tarea no encontrada'}), 404
    
    # Eliminar la tarea de la base de datos
    try:
        db.session.delete(tarea)
        db.session.commit()
        return jsonify({'mensaje': 'Tarea eliminada exitosamente'}), 200
    except Exception as e:
        return manejar_error_db('Error al eliminar tarea')