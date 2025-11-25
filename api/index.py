"""
Entry point for Vercel deployment.
This file initializes the Flask application for use with Vercel.
"""

from app import crear_app

# Create the Flask app instance
app = crear_app()

# Vercel requires the handler to be named "handler"
handler = app