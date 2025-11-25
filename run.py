"""
Módulo principal para ejecutar la aplicación Flask.
Este archivo crea una instancia de la aplicación y la ejecuta en modo desarrollo.
"""

from app import crear_app

# Crear la instancia de la aplicación Flask
app = crear_app()

# Ejecutar la aplicación en modo desarrollo
if __name__ == '__main__':
    app.run(debug=True)