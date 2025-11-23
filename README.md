# Gestor de Tareas Web

A Flask-based task management web application that can be deployed to Vercel.

## Features

- Create, read, update, and delete tasks
- Responsive web interface
- Form validation
- Duplicate title prevention
- Due date management

## Deployment to Vercel

This application is configured for deployment to Vercel with both SQLite (local development) and PostgreSQL (production) support.

### Quick Deployment

1. Fork this repository
2. Connect to Vercel
3. Add environment variables:
   - `FLASK_ENV=production`
   - `SECRET_KEY=your-secret-key`
   - `DATABASE_URL=your-postgresql-url`
4. Deploy!

### Detailed Deployment Instructions

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

## Local Development

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Create a `.env` file with:
   ```
   FLASK_ENV=development
   SECRET_KEY=dev-secret-key
   DATABASE_URL=sqlite:///gestor_tareas.sqlite
   ```

3. Run the application:
   ```
   python app.py
   ```

4. Visit `http://localhost:5000`

## Project Structure

- `app.py` - Main Flask application
- `database.py` - Database abstraction layer
- `config.py` - Configuration management
- `models.py` - SQLAlchemy models
- `templates/` - HTML templates
- `static/` - CSS, JavaScript, and other static assets
- `api/` - Vercel deployment entry point
- `migrations/` - Database migrations

## Technology Stack

- Flask (Python web framework)
- PostgreSQL/SQLite (database)
- JavaScript (client-side functionality)
- HTML/CSS (frontend)

## License

MIT