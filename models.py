"""
models.py
SQLAlchemy models for the Task Manager application.

This module defines the database models using SQLAlchemy ORM.
Models are used for database migrations and ORM operations.

@package GestorTareas
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()


class Tarea(db.Model):
    """
    Task model representing the 'tareas' table.
    
    Attributes:
        id (int): Primary key, auto-increment
        titulo (str): Task title, unique and required (max 100 chars)
        descripcion (str): Task description, optional
        fecha_limite (date): Task due date
        creado_en (datetime): Creation timestamp, auto-set
    """
    
    __tablename__ = 'tareas'
    
    # Columns
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    titulo = db.Column(db.String(100), unique=True, nullable=False, index=True)
    descripcion = db.Column(db.Text, nullable=True)
    fecha_limite = db.Column(db.Date, nullable=True)
    creado_en = db.Column(
        db.DateTime, 
        nullable=False, 
        default=datetime.utcnow,
        server_default=db.func.current_timestamp()
    )
    
    def __repr__(self):
        """String representation of the Task model."""
        return f'<Tarea {self.id}: {self.titulo}>'
    
    def to_dict(self):
        """
        Convert model instance to dictionary.
        
        Returns:
            dict: Dictionary representation of the task
        """
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'fecha_limite': self.fecha_limite.strftime('%Y-%m-%d') if self.fecha_limite else None,
            'creado_en': self.creado_en.isoformat() if self.creado_en else None
        }
    
    @classmethod
    def create(cls, titulo, descripcion=None, fecha_limite=None):
        """
        Create a new task instance.
        
        Args:
            titulo (str): Task title
            descripcion (str, optional): Task description
            fecha_limite (date, optional): Task due date
        
        Returns:
            Tarea: New task instance
        """
        return cls(
            titulo=titulo,
            descripcion=descripcion,
            fecha_limite=fecha_limite
        )
    
    def update(self, titulo=None, descripcion=None, fecha_limite=None):
        """
        Update task attributes.
        
        Args:
            titulo (str, optional): New task title
            descripcion (str, optional): New task description
            fecha_limite (date, optional): New task due date
        """
        if titulo is not None:
            self.titulo = titulo
        if descripcion is not None:
            self.descripcion = descripcion
        if fecha_limite is not None:
            self.fecha_limite = fecha_limite
