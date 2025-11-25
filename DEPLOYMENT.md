# Deployment Guide for Vercel

This document provides instructions for deploying the Gestor de Tareas Web application to Vercel.

## Prerequisites

1. A Vercel account
2. The project repository hosted on GitHub, GitLab, or Bitbucket
3. Environment variables configured in Vercel dashboard

## Vercel Configuration Files

### 1. vercel.json
This file configures how Vercel builds and deploys the application:
- Uses the Python runtime
- Specifies the entry point at `api/index.py`
- Routes all requests through the Flask application

### 2. .vercelignore
This file specifies which files and directories should be excluded from the Vercel deployment to reduce bundle size and improve security.

### 3. api/index.py
This is the entry point for Vercel deployments. It initializes the Flask application and makes it available to Vercel's serverless environment.

### 4. runtime.txt
Specifies the Python version to use (3.9).

### 5. pyproject.toml
Specifies project dependencies and metadata for modern Python package management.

### 6. requirements.txt
Lists all Python dependencies with specific versions for reproducible builds.

### 7. .python-version
Specifies the Python version for development environments.

## Environment Variables

Configure the following environment variables in your Vercel project settings:

1. `DATABASE_URL` - Connection string for your PostgreSQL database
2. `JWT_SECRET_KEY` - Secret key for JWT token generation
3. `VERCEL_ENV` - Environment identifier (production, preview, development)

## Database Configuration

The application is configured to work with PostgreSQL on Vercel. The database schema is defined in `sql/database.sql`.

For local development, the application will use SQLite as a fallback if no `DATABASE_URL` is provided.

## Deployment Steps

1. Push your code to your Git repository
2. Connect your repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy the application

## Troubleshooting

### Common Issues

1. **Python version conflicts**: The application is configured to use Python 3.9. Ensure your local development environment matches this version.

2. **Dependency installation errors**: If you encounter issues with dependency installation, try clearing the Vercel build cache.

3. **Database connection issues**: Ensure the `DATABASE_URL` environment variable is correctly set in your Vercel project settings.

### Build Process

The Vercel build process:
1. Detects the Python project
2. Installs dependencies from requirements.txt
3. Builds the application
4. Deploys the application to a serverless environment

## Notes

- The application uses SQLAlchemy for database operations, which provides abstraction between different database systems
- Flask-Migrate is included for handling database migrations if needed
- The application is configured with connection pooling for better performance
- Debug mode is automatically disabled in production environments