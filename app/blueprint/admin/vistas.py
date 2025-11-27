"""
Módulo de vistas administrativas.
Contiene las rutas para servir las páginas HTML del panel de administración.
"""

from flask import Blueprint, render_template, redirect, url_for
from app.blueprint.utils import verificar_token_admin

vistas_admin_bp = Blueprint('vistas_admin', __name__)

@vistas_admin_bp.route('/dashboard')
def dashboard():
    """
    Ruta que sirve el dashboard del panel de administración.
    """
    # Verificar si el administrador tiene un token válido usando la función utilitaria
    administrador, token = verificar_token_admin()
    
    if administrador:
        # Pasar la información del administrador a la plantilla
        return render_template('admin/components/dashboard.html', administrador=administrador)
    
    # Si no hay token válido, redirigir al login
    return redirect(url_for('vistas_admin.login'))

@vistas_admin_bp.route('/login')
def login():
    """
    Ruta que sirve la página de inicio de sesión del panel de administración.
    """
    return render_template('admin/login.html')