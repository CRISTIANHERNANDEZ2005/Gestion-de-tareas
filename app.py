"""
app.py
Main application file for the Flask Task Manager.

This module initializes the Flask application, configures routes,
and sets up the database connection.

@package GestorTareas
"""

from flask import Flask, render_template, request, jsonify
from config import get_config
from database import Database
from datetime import datetime
import os


# Initialize Flask application
app = Flask(__name__)

# Load configuration
config_class = get_config()
app.config.from_object(config_class)

# Validate configuration
config_class.validate()

# Initialize database
db = Database()


@app.route('/')
def index():
    """
    Render the main page of the task manager.
    
    Returns:
        str: Rendered HTML template
    """
    return render_template('index.html')


@app.route('/documentation')
def documentation():
    """
    Render the documentation page.
    
    Returns:
        str: Rendered HTML template
    """
    return render_template('documentation.html')


@app.route('/api/tareas', methods=['GET'])
def obtener_tareas():
    """
    Get all tasks from the database.
    
    Returns:
        Response: JSON response with tasks list
    """
    try:
        tasks = db.get_all_tasks()
        return jsonify(tasks), 200
    
    except Exception as e:
        app.logger.error(f"Error fetching tasks: {str(e)}")
        return jsonify({
            'exito': False,
            'mensaje': f'Error al obtener las tareas: {str(e)}'
        }), 500


@app.route('/api/tareas', methods=['POST'])
def agregar_tarea():
    """
    Add a new task to the database.
    
    Returns:
        Response: JSON response indicating success or failure
    """
    try:
        # Get and validate data from request
        titulo = request.form.get('titulo', '').strip()
        descripcion = request.form.get('descripcion', '').strip()
        fecha_limite = request.form.get('fecha_limite', '').strip()
        
        # Validate required fields
        if not titulo:
            return jsonify({
                'exito': False,
                'mensaje': 'El campo titulo es obligatorio.'
            }), 400
        
        if not fecha_limite:
            return jsonify({
                'exito': False,
                'mensaje': 'El campo fecha_limite es obligatorio.'
            }), 400
        
        # Check if title already exists
        if db.check_title_exists(titulo):
            return jsonify({
                'exito': False,
                'mensaje': 'Título duplicado. Elige otro.'
            }), 400
        
        # Parse date
        try:
            fecha_limite_obj = datetime.strptime(fecha_limite, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'exito': False,
                'mensaje': 'Formato de fecha inválido. Use YYYY-MM-DD.'
            }), 400
        
        # Add task to database
        db.add_task(titulo, descripcion, fecha_limite_obj)
        
        return jsonify({
            'exito': True,
            'mensaje': 'Tarea agregada correctamente.'
        }), 201
    
    except Exception as e:
        app.logger.error(f"Error adding task: {str(e)}")
        return jsonify({
            'exito': False,
            'mensaje': f'Error al agregar la tarea: {str(e)}'
        }), 500


@app.route('/api/tareas/<int:task_id>', methods=['PUT'])
def actualizar_tarea(task_id):
    """
    Update an existing task in the database.
    
    Args:
        task_id (int): ID of the task to update
    
    Returns:
        Response: JSON response indicating success or failure
    """
    try:
        # Get and validate data from request
        titulo = request.form.get('titulo', '').strip()
        descripcion = request.form.get('descripcion', '').strip()
        fecha_limite = request.form.get('fecha_limite', '').strip()
        
        # Validate required fields
        if not titulo:
            return jsonify({
                'exito': False,
                'mensaje': 'El campo titulo es obligatorio.'
            }), 400
        
        if not fecha_limite:
            return jsonify({
                'exito': False,
                'mensaje': 'El campo fecha_limite es obligatorio.'
            }), 400
        
        # Check if title already exists for another task
        if db.check_title_exists(titulo, task_id):
            return jsonify({
                'exito': False,
                'mensaje': 'Título duplicado. Elige otro.'
            }), 400
        
        # Parse date
        try:
            fecha_limite_obj = datetime.strptime(fecha_limite, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'exito': False,
                'mensaje': 'Formato de fecha inválido. Use YYYY-MM-DD.'
            }), 400
        
        # Update task in database
        rows_affected = db.update_task(task_id, titulo, descripcion, fecha_limite_obj)
        
        if rows_affected == 0:
            return jsonify({
                'exito': False,
                'mensaje': 'No se encontró la tarea para actualizar.'
            }), 404
        
        return jsonify({
            'exito': True,
            'mensaje': 'Tarea actualizada correctamente.'
        }), 200
    
    except Exception as e:
        app.logger.error(f"Error updating task: {str(e)}")
        return jsonify({
            'exito': False,
            'mensaje': f'Error al actualizar la tarea: {str(e)}'
        }), 500


@app.route('/api/tareas/<int:task_id>', methods=['POST'])
def eliminar_tarea(task_id):
    """
    Delete a task from the database.
    
    Args:
        task_id (int): ID of the task to delete
    
    Returns:
        Response: JSON response indicating success or failure
    """
    try:
        # Delete task from database
        rows_affected = db.delete_task(task_id)
        
        if rows_affected == 0:
            return jsonify({
                'exito': False,
                'mensaje': 'No se encontró la tarea para eliminar.'
            }), 404
        
        return jsonify({
            'exito': True,
            'mensaje': 'Tarea eliminada correctamente.'
        }), 200
    
    except Exception as e:
        app.logger.error(f"Error deleting task: {str(e)}")
        return jsonify({
            'exito': False,
            'mensaje': f'Error al eliminar la tarea: {str(e)}'
        }), 500


@app.route('/api/verificar-titulo', methods=['POST'])
def verificar_titulo():
    """
    Verify if a task title already exists in the database.
    
    Returns:
        Response: JSON response indicating if the title is duplicated
    """
    try:
        # Get data from request
        titulo = request.form.get('titulo', '').strip()
        tarea_id = request.form.get('tarea_id', '').strip()
        
        if not titulo:
            return jsonify({
                'exito': False,
                'mensaje': 'El campo titulo es obligatorio.'
            }), 400
        
        # Check if title exists
        if tarea_id:
            # Exclude current task when editing
            duplicado = db.check_title_exists(titulo, int(tarea_id))
        else:
            # Check all tasks when creating new
            duplicado = db.check_title_exists(titulo)
        
        return jsonify({
            'exito': True,
            'duplicado': duplicado
        }), 200
    
    except Exception as e:
        app.logger.error(f"Error verifying title: {str(e)}")
        return jsonify({
            'exito': False,
            'mensaje': f'Error al verificar el título: {str(e)}'
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'exito': False,
        'mensaje': 'Recurso no encontrado.'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'exito': False,
        'mensaje': 'Error interno del servidor.'
    }), 500


if __name__ == '__main__':
    # Create tables if they don't exist
    db.create_tables()
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=app.config['DEBUG']
    )