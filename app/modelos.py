"""
Módulo de modelos de la aplicación.
Define los modelos de datos utilizando SQLAlchemy ORM.
"""

from datetime import datetime
from app import db

class Usuario(db.Model):
    """
    Modelo que representa a un usuario en el sistema.
    
    Attributes:
        id (int): Identificador único del usuario
        identificacion (str): Número de identificación único del usuario
        nombre (str): Nombre del usuario
        apellido (str): Apellido del usuario
        contrasena (str): Contraseña hasheada del usuario
        creado_en (datetime): Fecha y hora de creación del usuario
        actualizado_en (datetime): Fecha y hora de última actualización
    """
    
    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True)
    identificacion = db.Column(db.String(20), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    contrasena = db.Column(db.String(255), nullable=False)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    actualizado_en = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relación con las tareas del usuario
    tareas = db.relationship('Tarea', backref='usuario', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        """
        Convierte el objeto Usuario a un diccionario.
        
        Returns:
            dict: Diccionario con los atributos del usuario
        """
        return {
            'id': self.id,
            'identificacion': self.identificacion,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'creado_en': self.creado_en.isoformat(),
            'actualizado_en': self.actualizado_en.isoformat()
        }

class Administrador(db.Model):
    """
    Modelo que representa a un administrador del sistema.
    
    Attributes:
        id (int): Identificador único del administrador
        identificacion (str): Número de identificación único del administrador (solo números, mínimo 8 dígitos)
        nombre (str): Nombre del administrador
        apellido (str): Apellido del administrador
        contrasena (str): Contraseña hasheada del administrador
        creado_en (datetime): Fecha y hora de creación del administrador
        actualizado_en (datetime): Fecha y hora de última actualización
    """
    
    __tablename__ = 'administradores'

    id = db.Column(db.Integer, primary_key=True)
    identificacion = db.Column(db.String(20), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    contrasena = db.Column(db.String(255), nullable=False)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    actualizado_en = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """
        Convierte el objeto Administrador a un diccionario.
        
        Returns:
            dict: Diccionario con los atributos del administrador
        """
        return {
            'id': self.id,
            'identificacion': self.identificacion,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'creado_en': self.creado_en.isoformat(),
            'actualizado_en': self.actualizado_en.isoformat()
        }

class Tarea(db.Model):
    """
    Modelo que representa una tarea asignada a un usuario.
    
    Attributes:
        id (int): Identificador único de la tarea
        usuario_id (int): ID del usuario al que pertenece la tarea
        titulo (str): Título de la tarea
        descripcion (str): Descripción detallada de la tarea
        fecha_limite (date): Fecha límite para completar la tarea
        creado_en (datetime): Fecha y hora de creación de la tarea
        actualizado_en (datetime): Fecha y hora de última actualización
    """
    
    __tablename__ = 'tareas'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    titulo = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    fecha_limite = db.Column(db.Date)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    actualizado_en = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Restricción única: un usuario no puede tener dos tareas con el mismo título
    __table_args__ = (
        db.UniqueConstraint('usuario_id', 'titulo', name='unique_titulo_usuario'),
    )

    # Configuración para evitar advertencias de eliminación
    __mapper_args__ = {
        "confirm_deleted_rows": False
    }

    def to_dict(self):
        """
        Convierte el objeto Tarea a un diccionario.
        
        Returns:
            dict: Diccionario con los atributos de la tarea
        """
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'fecha_limite': self.fecha_limite.isoformat() if self.fecha_limite else None,
            'creado_en': self.creado_en.isoformat(),
            'actualizado_en': self.actualizado_en.isoformat()
        }