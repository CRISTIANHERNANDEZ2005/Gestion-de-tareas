"""
Vercel entry point for the Flask application.

This module serves as the entry point for Vercel deployments,
initializing the Flask app and making it compatible with Vercel's serverless environment.
"""

import os
import sys

# Add the parent directory to the path so we can import our app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app import app

# Vercel expects the application to be available as `application` or `app`
application = app

if __name__ == "__main__":
    app.run()