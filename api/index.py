"""
Entry point for Vercel deployment.
This file initializes the Flask application for use with Vercel.
"""

import os
from app import crear_app

# Create the Flask app instance
app = crear_app()

# Vercel requires the handler to be named "handler"
handler = app

# For local testing
if __name__ == "__main__":
    app.run(debug=os.environ.get('VERCEL_ENV') != 'production')