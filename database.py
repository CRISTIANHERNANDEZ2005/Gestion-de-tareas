"""
database.py
Database connection and operations module.

This module handles all database operations including connection management,
table creation, and CRUD operations for tasks.

@package GestorTareas
"""

import os
import logging
from contextlib import contextmanager

# Conditional import based on database type
if os.getenv('DATABASE_URL', '').startswith('postgresql://'):
    # Use PostgreSQL for both development and production when DATABASE_URL is PostgreSQL
    import psycopg2
    from psycopg2 import pool, extras
else:
    # Use SQLite for local development when no PostgreSQL URL is provided
    import sqlite3


class Database:
    """
    Database class for managing database connections and operations.
    
    Uses connection pooling for PostgreSQL or direct connections for SQLite.
    Provides methods for all task-related database operations.
    """
    
    def __init__(self):
        """
        Initialize database connection based on environment.
        """
        self.logger = logging.getLogger(__name__)
        self.database_url = os.getenv('DATABASE_URL')
        
        if self.database_url and self.database_url.startswith('postgresql://'):
            # PostgreSQL for both development and production
            self.db_type = 'postgresql'
            try:
                # Special handling for Neon.tech with SSL
                if 'neon.tech' in self.database_url:
                    # Ensure SSL is enabled
                    if 'sslmode' not in self.database_url:
                        self.database_url += '&sslmode=require' if '?' in self.database_url else '?sslmode=require'
                
                # Create connection pool
                self.connection_pool = psycopg2.pool.SimpleConnectionPool(
                    1, 10, self.database_url
                )
                
                if self.connection_pool:
                    self.logger.info("PostgreSQL connection pool created successfully")
            
            except Exception as e:
                self.logger.error(f"Error creating PostgreSQL connection pool: {str(e)}")
                raise
        else:
            # SQLite for local development when no DATABASE_URL is provided
            if self.database_url and self.database_url.startswith('sqlite:///'):
                self.db_path = self.database_url.replace('sqlite:///', '')
            else:
                self.db_path = 'gestor_tareas.sqlite'
            self.db_type = 'sqlite'
            self.logger.info(f"Using SQLite database at {self.db_path}")
    
    @contextmanager
    def get_connection(self):
        """
        Context manager for database connections.
        
        Yields:
            connection: Database connection (PostgreSQL or SQLite)
        """
        connection = None
        try:
            if self.db_type == 'postgresql':
                connection = self.connection_pool.getconn()
            else:
                connection = sqlite3.connect(self.db_path)
            yield connection
        except Exception as e:
            self.logger.error(f"Error getting database connection: {str(e)}")
            raise
        finally:
            if connection:
                if self.db_type == 'postgresql':
                    self.connection_pool.putconn(connection)
                else:
                    connection.close()
    
    @contextmanager
    def get_cursor(self, commit=False):
        """
        Context manager for database cursors.
        
        Args:
            commit (bool): Whether to commit the transaction
        
        Yields:
            cursor: Database cursor (PostgreSQL or SQLite)
        """
        with self.get_connection() as connection:
            if self.db_type == 'postgresql':
                cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
            else:
                # For SQLite, use row factory to get dict-like results
                connection.row_factory = sqlite3.Row
                cursor = connection.cursor()
            
            try:
                yield cursor
                if commit:
                    connection.commit()
            except Exception as e:
                connection.rollback()
                self.logger.error(f"Database error: {str(e)}")
                raise
            finally:
                if self.db_type == 'postgresql':
                    cursor.close()
    
    def create_tables(self):
        """
        Create necessary database tables if they don't exist.
        
        Creates the 'tareas' table with appropriate schema for the database type.
        """
        if self.db_type == 'postgresql':
            create_table_query = """
            CREATE TABLE IF NOT EXISTS tareas (
                id SERIAL PRIMARY KEY,
                titulo VARCHAR(100) UNIQUE NOT NULL,
                descripcion TEXT,
                fecha_limite DATE,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
        else:
            # SQLite version
            create_table_query = """
            CREATE TABLE IF NOT EXISTS tareas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT UNIQUE NOT NULL,
                descripcion TEXT,
                fecha_limite DATE,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
        
        try:
            with self.get_cursor(commit=True) as cursor:
                cursor.execute(create_table_query)
                self.logger.info("Tables created successfully")
        
        except Exception as e:
            self.logger.error(f"Error creating tables: {str(e)}")
            raise
    
    def get_all_tasks(self):
        """
        Retrieve all tasks from the database ordered by due date.
        
        Returns:
            list: List of task dictionaries
        """
        query = """
        SELECT id, titulo, descripcion, fecha_limite, creado_en
        FROM tareas
        ORDER BY fecha_limite ASC
        """
        
        try:
            with self.get_cursor() as cursor:
                cursor.execute(query)
                if self.db_type == 'postgresql':
                    tasks = cursor.fetchall()
                    result = [dict(task) for task in tasks]
                else:
                    tasks = cursor.fetchall()
                    result = [dict(task) for task in tasks]
                
                # Format dates properly
                for task in result:
                    # Format fecha_limite
                    if task.get('fecha_limite'):
                        if self.db_type == 'postgresql':
                            # PostgreSQL returns date as string in YYYY-MM-DD format
                            if hasattr(task['fecha_limite'], 'strftime'):
                                task['fecha_limite'] = task['fecha_limite'].strftime('%Y-%m-%d')
                        else:
                            # SQLite may return different date formats
                            if hasattr(task['fecha_limite'], 'strftime'):
                                task['fecha_limite'] = task['fecha_limite'].strftime('%Y-%m-%d')
                
                return result
        
        except Exception as e:
            self.logger.error(f"Error fetching tasks: {str(e)}")
            raise
    
    def add_task(self, titulo, descripcion, fecha_limite):
        """
        Add a new task to the database.
        
        Args:
            titulo (str): Task title
            descripcion (str): Task description
            fecha_limite (str): Task due date (YYYY-MM-DD)
        
        Returns:
            int: ID of the newly created task
        
        Raises:
            ValueError: If title already exists
        """
        if self.db_type == 'postgresql':
            query = """
            INSERT INTO tareas (titulo, descripcion, fecha_limite)
            VALUES (%s, %s, %s)
            RETURNING id
            """
            params = (titulo, descripcion, fecha_limite)
        else:
            # SQLite version
            query = """
            INSERT INTO tareas (titulo, descripcion, fecha_limite)
            VALUES (?, ?, ?)
            """
            params = (titulo, descripcion, fecha_limite)
        
        try:
            with self.get_cursor(commit=True) as cursor:
                if self.db_type == 'postgresql':
                    cursor.execute(query, params)
                    task_id = cursor.fetchone()['id']
                else:
                    cursor.execute(query, params)
                    task_id = cursor.lastrowid
                return task_id
        
        except Exception as e:
            if 'unique' in str(e).lower() or 'unique constraint' in str(e).lower():
                raise ValueError('Título duplicado. Elige otro.')
            self.logger.error(f"Error adding task: {str(e)}")
            raise
    
    def update_task(self, task_id, titulo, descripcion, fecha_limite):
        """
        Update an existing task in the database.
        
        Args:
            task_id (int): ID of the task to update
            titulo (str): New task title
            descripcion (str): New task description
            fecha_limite (str): New task due date (YYYY-MM-DD)
        
        Returns:
            int: Number of rows affected
        
        Raises:
            ValueError: If title already exists for another task
        """
        if self.db_type == 'postgresql':
            query = """
            UPDATE tareas
            SET titulo = %s, descripcion = %s, fecha_limite = %s
            WHERE id = %s
            """
            params = (titulo, descripcion, fecha_limite, task_id)
        else:
            # SQLite version
            query = """
            UPDATE tareas
            SET titulo = ?, descripcion = ?, fecha_limite = ?
            WHERE id = ?
            """
            params = (titulo, descripcion, fecha_limite, task_id)
        
        try:
            with self.get_cursor(commit=True) as cursor:
                cursor.execute(query, params)
                if self.db_type == 'postgresql':
                    return cursor.rowcount
                else:
                    return cursor.rowcount
        
        except Exception as e:
            if 'unique' in str(e).lower() or 'unique constraint' in str(e).lower():
                raise ValueError('Título duplicado. Elige otro.')
            self.logger.error(f"Error updating task: {str(e)}")
            raise
    
    def delete_task(self, task_id):
        """
        Delete a task from the database.
        
        Args:
            task_id (int): ID of the task to delete
        
        Returns:
            int: Number of rows affected
        """
        if self.db_type == 'postgresql':
            query = "DELETE FROM tareas WHERE id = %s"
            params = (task_id,)
        else:
            # SQLite version
            query = "DELETE FROM tareas WHERE id = ?"
            params = (task_id,)
        
        try:
            with self.get_cursor(commit=True) as cursor:
                cursor.execute(query, params)
                if self.db_type == 'postgresql':
                    return cursor.rowcount
                else:
                    return cursor.rowcount
        
        except Exception as e:
            self.logger.error(f"Error deleting task: {str(e)}")
            raise
    
    def check_title_exists(self, titulo, exclude_task_id=None):
        """
        Check if a task title already exists in the database.
        
        Args:
            titulo (str): Title to check
            exclude_task_id (int, optional): Task ID to exclude from check (for updates)
        
        Returns:
            bool: True if title exists, False otherwise
        """
        if exclude_task_id:
            if self.db_type == 'postgresql':
                query = """
                SELECT COUNT(*) as count
                FROM tareas
                WHERE titulo = %s AND id != %s
                """
                params = (titulo, exclude_task_id)
            else:
                # SQLite version
                query = """
                SELECT COUNT(*) as count
                FROM tareas
                WHERE titulo = ? AND id != ?
                """
                params = (titulo, exclude_task_id)
        else:
            if self.db_type == 'postgresql':
                query = """
                SELECT COUNT(*) as count
                FROM tareas
                WHERE titulo = %s
                """
                params = (titulo,)
            else:
                # SQLite version
                query = """
                SELECT COUNT(*) as count
                FROM tareas
                WHERE titulo = ?
                """
                params = (titulo,)
        
        try:
            with self.get_cursor() as cursor:
                cursor.execute(query, params)
                if self.db_type == 'postgresql':
                    result = cursor.fetchone()
                    return result['count'] > 0
                else:
                    result = cursor.fetchone()
                    return result['count'] > 0
        
        except Exception as e:
            self.logger.error(f"Error checking title: {str(e)}")
            raise
    
    def close_all_connections(self):
        """Close all connections in the pool."""
        if self.db_type == 'postgresql' and self.connection_pool:
            self.connection_pool.closeall()
            self.logger.info("All database connections closed")