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

## Environment Variables

Configure the following environment variables in your Vercel project settings:

1. `DATABASE_URL` - Connection string for your PostgreSQL database
2. `JWT_SECRET_KEY` - Secret key for JWT token generation

## Database Configuration

The application is configured to work with PostgreSQL on Vercel. The database schema is defined in `sql/database.sql`.

For local development, the application will use SQLite as a fallback if no `DATABASE_URL` is provided.

## Deployment Steps

1. Push your code to your Git repository
2. Connect your repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy the application

## Notes

- The application uses SQLAlchemy for database operations, which provides abstraction between different database systems
- Flask-Migrate is included for handling database migrations if needed
- The application is configured with connection pooling for better performance