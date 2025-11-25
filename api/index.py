"""
Entry point for Vercel deployment.
This file initializes the Flask application for use with Vercel.
"""

import os
import traceback
from app import crear_app

try:
    # Create the Flask app instance
    app = crear_app()
    
    # Vercel requires the handler to be named "handler"
    handler = app
    
    # For local testing
    if __name__ == "__main__":
        app.run(debug=os.environ.get('VERCEL_ENV') != 'production')
        
except Exception as e:
    print(f"Error initializing application: {str(e)}")
    print(traceback.format_exc())
    raise