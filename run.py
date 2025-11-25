"""
Módulo principal para ejecutar la aplicación Flask.
Este archivo crea una instancia de la aplicación y la ejecuta en modo desarrollo.
"""

import os
from app import crear_app

# Crear la instancia de la aplicación Flask
app = crear_app()

# Ejecutar la aplicación en modo desarrollo
if __name__ == '__main__':
    # En Vercel, la aplicación se ejecuta mediante el handler en api/index.py
    # Solo ejecutar en modo debug cuando no esté en producción
    debug_mode = os.environ.get('VERCEL_ENV') != 'production'
    app.run(debug=debug_mode, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))